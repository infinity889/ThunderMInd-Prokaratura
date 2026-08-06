from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer
from .permissions import IsAdminUser
from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'is_admin': getattr(user, 'is_admin', False) or user.is_staff or user.is_superuser
            })
        return Response({"error": "Wrong credentials"}, status=400)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserListView(APIView):
    """Admin-only: list all registered users."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('id')
        data = []
        for u in users:
            data.append({
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'is_admin': getattr(u, 'is_admin', False),
                'is_staff': u.is_staff,
                'is_superuser': u.is_superuser,
                'date_joined': u.date_joined.isoformat(),
            })
        return Response(data)


class ToggleAdminView(APIView):
    """Admin-only: toggle is_admin flag for a user."""
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Prevent removing admin from yourself
        if target_user.id == request.user.id:
            return Response({"error": "Cannot change your own admin status"}, status=status.HTTP_400_BAD_REQUEST)

        new_status = request.data.get('is_admin')
        if new_status is None:
            # Toggle
            target_user.is_admin = not target_user.is_admin
        else:
            target_user.is_admin = bool(new_status)

        target_user.save()
        return Response({
            'id': target_user.id,
            'username': target_user.username,
            'is_admin': target_user.is_admin,
        })


class DeleteUserView(APIView):
    """Admin-only: delete a user."""
    permission_classes = [IsAdminUser]

    def delete(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if target_user.id == request.user.id:
            return Response({"error": "Cannot delete yourself"}, status=status.HTTP_400_BAD_REQUEST)

        username = target_user.username
        target_user.delete()
        return Response({"message": f"User '{username}' deleted"})
