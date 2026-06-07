from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShopStitchingViewSet, TailorViewSet, InvoiceViewSet, RateSheetViewSet

router = DefaultRouter()
router.register(r'tailors', TailorViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'ratesheets', RateSheetViewSet)
router.register(r'stitching', ShopStitchingViewSet)


urlpatterns = [
    path('', include(router.urls)),
]