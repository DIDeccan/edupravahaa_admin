# filters.py
import django_filters
from .models import Payment

class PaymentFilter(django_filters.FilterSet):
    start_date = django_filters.IsoDateTimeFilter(field_name="created_at", lookup_expr="gte")
    end_date = django_filters.IsoDateTimeFilter(field_name="created_at", lookup_expr="lte")
    course = django_filters.CharFilter(field_name="course__name", lookup_expr="icontains")
    payment_status = django_filters.CharFilter(field_name="payment_status", lookup_expr="iexact")

    class Meta:
        model = Payment
        fields = ["start_date", "end_date", "course", "payment_status"]
