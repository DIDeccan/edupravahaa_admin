from rest_framework import views, status,generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils import timezone
from rest_framework import serializers
from edu_platform.models import Course, CourseSubscription, CourseEnrollment,Payment
from edu_platform.permissions.auth_permissions import IsStudent
from edu_platform.serializers.payment_serializers import CreateOrderSerializer, VerifyPaymentSerializer,TransactionReportSerializer,PaymentReportSerializer
import razorpay
import logging
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from edu_platform.filters import PaymentFilter


import pandas as pd
from io import BytesIO
from django.http import HttpResponse
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet

# Initialize Razorpay client
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

# Set up logging
logger = logging.getLogger(__name__)

def get_error_message(serializer):
    """Extracts a specific error message from serializer errors."""
    errors = serializer.errors
    if 'non_field_errors' in errors:
        return errors['non_field_errors'][0]
    for field, error in errors.items():
        if isinstance(error, dict) and 'error' in error:
            return error['error']
        return error[0] if isinstance(error, list) else error
    return 'Invalid input data.'

class BaseAPIView(views.APIView):
    def validate_serializer(self, serializer_class, data, context=None):
        serializer = serializer_class(data=data, context=context or {'request': self.request})
        if not serializer.is_valid():
            raise serializers.ValidationError({
                'error': get_error_message(serializer),
                'status': status.HTTP_400_BAD_REQUEST
            })
        return serializer

class CreateOrderView(BaseAPIView):
    """Creates a Razorpay order for course purchase."""
    permission_classes = [IsAuthenticated, IsStudent]

    @swagger_auto_schema(
        request_body=CreateOrderSerializer,
        responses={
            200: openapi.Response(
                description="Order created successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                        'data': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'order_id': openapi.Schema(type=openapi.TYPE_STRING),
                                'amount': openapi.Schema(type=openapi.TYPE_NUMBER),
                                'currency': openapi.Schema(type=openapi.TYPE_STRING),
                                'key': openapi.Schema(type=openapi.TYPE_STRING),
                                'subscription_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'batch': openapi.Schema(type=openapi.TYPE_STRING)
                            }
                        )
                    }
                )
            ),
            400: openapi.Response(
                description="Invalid input",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING),
                        'status': openapi.Schema(type=openapi.TYPE_INTEGER)
                    }
                )
            ),
            401: openapi.Response(
                description="Unauthorized",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING),
                        'status': openapi.Schema(type=openapi.TYPE_INTEGER)
                    }
                )
            ),
            403: openapi.Response(
                description="Forbidden",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING),
                        'status': openapi.Schema(type=openapi.TYPE_INTEGER)
                    }
                )
            ),
            500: openapi.Response(
                description="Server error",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING),
                        'status': openapi.Schema(type=openapi.TYPE_INTEGER)
                    }
                )
            )
        }
    )
    def post(self, request):
        """Generates Razorpay order and creates/updates subscription and enrollment."""
        try:
            serializer = self.validate_serializer(CreateOrderSerializer, request.data)
            course_id = serializer.validated_data['course_id']
            batch = serializer.validated_data['batch']
            course = Course.objects.get(id=course_id, is_active=True)

            # Check for existing pending subscription
            try:
                subscription = CourseSubscription.objects.get(
                    student=request.user,
                    course=course,
                    payment_status='pending'
                )
                logger.info(f"Reusing existing pending subscription {subscription.id} for user {request.user.id}, course {course.id}")
            except CourseSubscription.DoesNotExist:
                subscription = None

            # Create Razorpay order
            amount = int(course.base_price * 100)
            order_data = {
                'amount': amount,
                'currency': 'INR',
                'payment_capture': '1',
                'notes': {
                    'course_id': str(course.id),
                    'student_id': str(request.user.id),
                    'student_email': request.user.email,
                    'batch': batch
                }
            }
            order = client.order.create(data=order_data)

            # Update or create subscription
            if subscription:
                subscription.order_id = order['id']
                subscription.purchased_at = timezone.now()
                subscription.save(update_fields=['order_id', 'purchased_at'])
                logger.info(f"Updated subscription {subscription.id} with new order_id {order['id']}")
            else:
                subscription = CourseSubscription.objects.create(
                    student=request.user,
                    course=course,
                    amount_paid=course.base_price,
                    order_id=order['id'],
                    payment_method='razorpay',
                    payment_status='pending',
                    currency='INR'
                )
                logger.info(f"Created new subscription {subscription.id} for user {request.user.id}, course {course.id}")

            try:
                enrollment = CourseEnrollment.objects.get(
                    student=request.user,
                    course=course,
                    subscription=subscription
                )
                enrollment.batch = batch
                enrollment.save(update_fields=['batch'])
                logger.info(f"Updated enrollment for subscription {subscription.id} with batch {batch}")
            except CourseEnrollment.DoesNotExist:
                enrollment = CourseEnrollment.objects.create(
                    student=request.user,
                    course=course,
                    batch=batch,
                    subscription=subscription
                )
                logger.info(f"Created new enrollment for subscription {subscription.id} with batch {batch}")

            return Response({
                'message': 'Order created successfully.',
                'data': {
                    'order_id': order['id'],
                    'amount': order['amount'],
                    'currency': order['currency'],
                    'key': settings.RAZORPAY_KEY_ID,
                    'subscription_id': subscription.id,
                    'batch': batch
                }
            }, status=status.HTTP_200_OK)

        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Course.DoesNotExist:
            return Response({
                'error': 'Course not found or inactive.',
                'status': status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)
        except razorpay.errors.BadRequestError as e:
            logger.error(f"Razorpay error creating order: {str(e)}")
            return Response({
                'error': f'Payment gateway error: {str(e)}',
                'status': status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error creating order: {str(e)}")
            return Response({
                'error': 'Failed to create order. Please try again.',
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPaymentView(BaseAPIView):
    """Verifies Razorpay payment and updates subscription and enrollment."""
    permission_classes = [IsAuthenticated, IsStudent]

    @swagger_auto_schema(
        request_body=VerifyPaymentSerializer,
        responses={
            200: openapi.Response(
                description="Payment verified successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                        'data': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'subscription_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'course_name': openapi.Schema(type=openapi.TYPE_STRING),
                                'batch': openapi.Schema(type=openapi.TYPE_STRING)
                            }
                        )
                    }
                )
            ),
            400: openapi.Response(
                description="Invalid input",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING),
                        'status': openapi.Schema(type=openapi.TYPE_INTEGER)
                    }
                )
            ),
            401: openapi.Response(
                description="Unauthorized",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING),
                        'status': openapi.Schema(type=openapi.TYPE_INTEGER)
                    }
                )
            ),
            403: openapi.Response(
                description="Forbidden",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING),
                        'status': openapi.Schema(type=openapi.TYPE_INTEGER)
                    }
                )
            ),
            500: openapi.Response(
                description="Server error",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING),
                        'status': openapi.Schema(type=openapi.TYPE_INTEGER)
                    }
                )
            )
        }
    )
    def post(self, request):
        """Verifies payment signature and updates subscription and enrollment status."""
        try:
            serializer = self.validate_serializer(VerifyPaymentSerializer, request.data)
            payment_id = serializer.validated_data['razorpay_payment_id']
            order_id = serializer.validated_data['razorpay_order_id']
            signature = serializer.validated_data['razorpay_signature']
            subscription = serializer.validated_data['subscription']

            # Handle idempotency for completed payments
            if subscription.payment_status == 'completed':
                enrollment = CourseEnrollment.objects.get(subscription=subscription)
                logger.info(f"Payment already verified for subscription {subscription.id}, user {request.user.id}")
                return Response({
                    'message': 'Payment already verified.',
                    'data': {
                        'subscription_id': subscription.id,
                        'course_name': subscription.course.name,
                        'batch': enrollment.batch
                    }
                }, status=status.HTTP_200_OK)

            # Verify payment signature
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }

            if settings.DEBUG and "fake_secret_for_testing" == 'fake_secret_for_testing':
                logger.info(f"Skipping signature verification for subscription {subscription.id} in test mode")
            else:
                try:
                    client.utility.verify_payment_signature(params_dict)
                except razorpay.errors.SignatureVerificationError as e:
                    logger.error(f"Signature verification failed for subscription {subscription.id}, user {request.user.id}: {str(e)}")
                    subscription.payment_status = 'failed'
                    subscription.save()
                    return Response({
                        'error': 'Invalid payment signature.',
                        'status': status.HTTP_400_BAD_REQUEST
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Update subscription details
            subscription.payment_id = payment_id
            subscription.payment_status = 'completed'
            subscription.payment_response = params_dict
            subscription.payment_completed_at = timezone.now()
            subscription.save()
            
            enrollment = CourseEnrollment.objects.get(subscription=subscription)
            
            logger.info(f"Payment verified for subscription {subscription.id}, user {request.user.id}, course {subscription.course.name}, batch {enrollment.batch}")
            return Response({
                'message': 'Payment verified successfully.',
                'data': {
                    'subscription_id': subscription.id,
                    'course_name': subscription.course.name,
                    'batch': enrollment.batch
                }
            }, status=status.HTTP_200_OK)

        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except CourseEnrollment.DoesNotExist:
            logger.error(f"No enrollment found for subscription {subscription.id if 'subscription' in locals() else 'unknown'}")
            return Response({
                'error': 'No enrollment found for this subscription.',
                'status': status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error updating subscription {subscription.id if 'subscription' in locals() else 'unknown'} for user {request.user.id}: {str(e)}")
            return Response({
                'error': 'Failed to verify payment. Please try again.',
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TransactionReportView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        try:
            # Get the last 5 transactions, ordered by purchased_at (most recent first)
            transactions = CourseSubscription.objects.all().order_by('-purchased_at')[:5]
            serializer = TransactionReportSerializer(transactions, many=True)
            response_data = {
                "message": "Transactions retrieved successfully.",
                "message_type": "success",
                "data": serializer.data
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            response_data = {
                "message": f"Failed to retrieve transactions: {str(e)}",
                "message_type": "error",
                "data": []
            }
            return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)       
        
class PaymentReportView(generics.ListAPIView):
    queryset = Payment.objects.all().order_by("-created_at")
    serializer_class = PaymentReportSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = PaymentFilter
    search_fields = ["course__name", "student__username", "payment_status"]
    ordering_fields = ["created_at", "amount"]

    def get(self, request, *args, **kwargs):
        export = request.query_params.get("export")

        if export == "excel":
            return self.export_excel()
        elif export == "pdf":
            return self.export_pdf()

        return super().get(request, *args, **kwargs)

    def export_excel(self):
        qs = self.filter_queryset(self.get_queryset())
        data = PaymentReportSerializer(qs, many=True).data
        df = pd.DataFrame(data)

        buffer = BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Payments")

        buffer.seek(0)
        response = HttpResponse(buffer, content_type="application/vnd.ms-excel")
        response["Content-Disposition"] = "attachment; filename=payments.xlsx"
        return response

    def export_pdf(self):
        qs = self.filter_queryset(self.get_queryset())
        data = PaymentReportSerializer(qs, many=True).data

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        elements.append(Paragraph("Payments Report", styles["Heading1"]))

        # Table
        table_data = [list(data[0].keys())] if data else []
        for row in data:
            table_data.append(list(row.values()))

        table = Table(table_data, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        elements.append(table)

        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = "attachment; filename=payments.pdf"
        return response        