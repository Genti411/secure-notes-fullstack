from django.conf import settings
from django.db import models


class Note(models.Model):
    """A note owned by a user. Ownership drives the RBAC rules in the viewset."""
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notes"
    )
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]

    def __str__(self):
        return f"{self.title} ({self.owner})"
