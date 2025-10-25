from django.shortcuts import render
from .serializers import AccountSerializer
from rest_framework import generics
from .models import Account
from rest_framework.permissions import AllowAny

# Create your views here.
# ✅ Register new user (public)
class RegisterView(generics.CreateAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [AllowAny]