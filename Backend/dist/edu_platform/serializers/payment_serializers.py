from rest_framework import serializers
from edu_platform.models import Course, CourseSubscription


class CreateOrderSerializer(serializers.Serializer):
    """Validates course purchase order creation."""
    course_id = serializers.IntegerField()

    def validate_course_id(self, value):
        """Ensures course exists and is active."""
        try:
            course = Course.objects.get(id=value, is_active=True)
        except Course.DoesNotExist:
            raise serializers.ValidationError({"error": "Course not found or inactive."})
        
        # Check for existing completed subscription
        if CourseSubscription.objects.filter(
            student=self.context['request'].user,
            course=course,
            payment_status='completed'
        ).exists():
            raise serializers.ValidationError({"error": "You are already subscribed to this course."})
        
        return value

    def validate(self, attrs):
        """Ensures user is verified before creating order."""
        if not self.context['request'].user.is_verified:
            errors = []
            if not self.context['request'].user.email_verified:
                errors.append("Email not verified.")
            if not self.context['request'].user.phone_verified:
                errors.append("Phone not verified.")
            raise serializers.ValidationError({"error": ", ".join(errors)})
        
        return attrs


class VerifyPaymentSerializer(serializers.Serializer):
    """Validates payment verification data."""
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()
    subscription_id = serializers.IntegerField()

    def validate(self, attrs):
        """Ensures subscription exists and is pending."""
        try:
            subscription = CourseSubscription.objects.get(
                id=attrs['subscription_id'],
                order_id=attrs['razorpay_order_id'],
                student=self.context['request'].user,
                payment_status='pending'
            )
        except CourseSubscription.DoesNotExist:
            raise serializers.ValidationError({"error": "Subscription not found or already processed."})
        
        attrs['subscription'] = subscription
        return attrs


class TransactionReportSerializer(serializers.ModelSerializer):
    payment_mode = serializers.CharField(source='payment_method')
    date = serializers.DateTimeField(source='purchased_at')
    message_info = serializers.SerializerMethodField()
    amount = serializers.DecimalField(source='amount_paid', max_digits=10, decimal_places=2)

    class Meta:
        model = CourseSubscription
        fields = ['payment_mode', 'date', 'message_info', 'amount']    

    def get_message_info(self, obj):
        # Map payment_status to custom messages
        if obj.payment_status == 'completed':
            return 'Success'
        return 'Failure'    