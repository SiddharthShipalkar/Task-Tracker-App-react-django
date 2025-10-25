from django.shortcuts import render
from .serializers import AccountSerializer
from rest_framework import generics
from .models import Account
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# Create your views here.
# ✅ Register new user (public)
class RegisterView(generics.CreateAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [AllowAny]


class ProtectedView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        response={
            'status': 'request was permitted'
        }
        return Response(response)