from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from django.contrib.auth import get_user_model
import firebase_admin
from firebase_admin import credentials
from django.conf import settings

_firebase_app = None

def get_firebase_app():
    """Lazy initialize firebase-admin app.
    Returns the app or None if config is missing/invalid so the server can still boot.
    """
    global _firebase_app
    if _firebase_app:
        return _firebase_app
    cfg = getattr(settings, "FIREBASE_CONFIG", None)
    if not cfg:
        return None
    pk = (cfg or {}).get("private_key", "") or ""
    # Normalize accidental escaped newlines if not already handled
    if "\\n" in pk and "\n" not in pk:
        pk = pk.replace("\\n", "\n")
        cfg["private_key"] = pk
    if not pk.startswith("-----BEGIN PRIVATE KEY-----"):
        # Don't crash entire Django app; just skip firebase init
        return None
    try:
        cred = credentials.Certificate(cfg)
        _firebase_app = firebase_admin.initialize_app(cred)
    except Exception:
        # Swallow and allow app to continue; authentication will fail gracefully
        _firebase_app = None
    return _firebase_app


class FirebaseAuthentication(BaseAuthentication):
    """DRF authentication class that accepts Firebase ID tokens in the
    Authorization header: "Authorization: Bearer <id_token>".

    It verifies the ID token with Firebase Admin SDK and returns a Django user
    object (created on-demand) so your views can use `request.user`.
    """

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None

        id_token = parts[1]

        # Ensure firebase app initialized (non-fatal if missing)
        app = get_firebase_app()
        if not app:
            raise exceptions.AuthenticationFailed("Firebase configuration not set on server")

        try:
            from firebase_admin import auth as fb_auth
            decoded = fb_auth.verify_id_token(id_token)
        except Exception as exc:
            raise exceptions.AuthenticationFailed(f"Invalid Firebase ID token: {exc}")

        uid = decoded.get("uid")
        email = decoded.get("email")
        User = get_user_model()

        # Create or get a lightweight Django user backing the Firebase identity
        if email:
            username = email.split("@")[0]
        else:
            username = uid

        user, _ = User.objects.get_or_create(email=email or f"{uid}@firebase.local", defaults={
            "username": username,
            "is_active": True,
        })

        # Attach firebase uid to user instance (non-persistent attribute)
        setattr(user, "firebase_uid", uid)

        return (user, None)
