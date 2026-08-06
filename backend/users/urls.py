from django.urls import path
from .views import (RegisterView, LoginView, ProfileView,
                    UserListView, ToggleAdminView, DeleteUserView)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    # Admin endpoints
    path('list/', UserListView.as_view(), name='user-list'),
    path('<int:user_id>/toggle-admin/', ToggleAdminView.as_view(), name='toggle-admin'),
    path('<int:user_id>/delete/', DeleteUserView.as_view(), name='delete-user'),
]
