from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Note


class RegisterSerializer(serializers.ModelSerializer):
    # write_only so the password is never echoed back; validated against the
    # configured Django password validators (min length, common-password list).
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["username", "password"]

    def create(self, validated_data):
        # create_user hashes the password (PBKDF2) — never store plaintext.
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )


class NoteSerializer(serializers.ModelSerializer):
    # owner is set from the authenticated request, never from client input.
    owner = serializers.ReadOnlyField(source="owner.username")

    class Meta:
        model = Note
        fields = ["id", "owner", "title", "body", "created"]
        read_only_fields = ["id", "owner", "created"]
