from django.http import JsonResponse
from rest_framework import permissions, viewsets
from rest_framework.generics import CreateAPIView

from .models import Note
from .serializers import NoteSerializer, RegisterSerializer


class RegisterView(CreateAPIView):
    """Public endpoint to create a user account."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class NoteViewSet(viewsets.ModelViewSet):
    """CRUD for notes with row-level RBAC:
      - a regular user sees and edits ONLY their own notes,
      - a staff user sees all notes.
    Because get_queryset is the security boundary, there is no endpoint that can
    return another user's note to a non-staff caller (404, not 403).
    """
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Note.objects.all()
        return Note.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


def healthz(_request):
    return JsonResponse({"status": "ok"})
