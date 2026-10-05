from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, APIException
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from .models import User

class AuthThrottle(AnonRateThrottle):
    rate = "10/minute"
    scope = "auth"

def validate_new_password(password, user=None):
    if not isinstance(password, str):
        raise ValidationError({"password": "Mot de passe requis."})
    try:
        validate_password(password, user)
    except DjangoValidationError as exc:
        raise ValidationError({"password": exc.messages})

def revoke_sessions(user):
    for token in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=token)

class PasswordChangeView(APIView):
    @transaction.atomic
    def post(self, request):
        if not request.user.check_password(request.data.get("old_password", "")):
            raise ValidationError({"old_password": "Mot de passe incorrect."})
        password = request.data.get("password")
        validate_new_password(password, request.user)
        request.user.set_password(password)
        request.user.save(update_fields=["password"])
        revoke_sessions(request.user)
        return Response({"detail": "Mot de passe modifié. Reconnectez-vous."})

class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]
    def post(self, request):
        email = request.data.get("email", "")
        user = User.objects.filter(email__iexact=email, is_active=True, is_suspended=False).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            url = settings.FRONTEND_URL + "/?reset_uid=" + uid + "&reset_token=" + token
            try:
                send_mail("JobConnect — Réinitialisation", "Pour réinitialiser votre mot de passe : " + url, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
            except Exception as exc:
                error = APIException("Le service email n'est pas configuré ou ne répond pas.")
                error.status_code = 503
                raise error from exc
        return Response({"detail": "Si le compte existe, un lien de réinitialisation a été envoyé."})

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]
    @transaction.atomic
    def post(self, request):
        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(request.data.get("uid", ""))))
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            raise ValidationError("Lien invalide.")
        if not default_token_generator.check_token(user, request.data.get("token", "")):
            raise ValidationError("Lien invalide ou expiré.")
        password = request.data.get("password")
        validate_new_password(password, user)
        user.set_password(password)
        user.save(update_fields=["password"])
        revoke_sessions(user)
        return Response({"detail": "Mot de passe réinitialisé."})
