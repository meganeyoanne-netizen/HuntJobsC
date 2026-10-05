from django.http import JsonResponse
from rest_framework.exceptions import APIException
from .authentication import ActiveJWTAuthentication
from .platform_settings import get_platform_settings

class PlatformMaintenanceMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        allowed = {"/api/platform/settings/", "/api/health/", "/api/users/login/", "/api/users/logout/", "/api/users/token/refresh/", "/api/users/password-reset/", "/api/users/password-reset-confirm/"}
        if request.path.startswith("/api/") and request.method != "OPTIONS":
            config = get_platform_settings()
            restore_user = request.path == "/api/users/me/" and request.method in {"GET", "HEAD"}
            if config["maintenanceMode"] and request.path not in allowed and not restore_user:
                user = getattr(request, "user", None)
                try:
                    auth = ActiveJWTAuthentication().authenticate(request)
                    if auth:
                        user = auth[0]
                except APIException:
                    user = None
                if not (user and user.is_authenticated and user.is_active and not user.is_suspended and (user.is_admin_role or user.is_superuser)):
                    return JsonResponse({"detail": config["maintenanceMessage"], "code": "maintenance"}, status=503)
        return self.get_response(request)
