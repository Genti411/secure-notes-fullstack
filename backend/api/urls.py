from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import NoteViewSet, RegisterView, healthz

# trailing_slash=False so /api/notes and /api/notes/{id} work without a trailing
# slash — matching the frontend client and avoiding 301 redirects that would turn
# a POST into a GET.
router = DefaultRouter(trailing_slash=False)
router.register("notes", NoteViewSet, basename="note")

urlpatterns = [
    path("auth/register", RegisterView.as_view(), name="register"),
    path("auth/token", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("healthz", healthz, name="healthz"),
]
urlpatterns += router.urls
