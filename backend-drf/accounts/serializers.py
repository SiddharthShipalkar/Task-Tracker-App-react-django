from rest_framework import serializers
from .models import Account


class AccountSerializer(serializers.ModelSerializer):
    password= serializers.CharField(write_only=True,min_length=4, style={'input_type':'password'})
    class Meta:
        model = Account
        fields = [
            'id',
            'username',
            'email',
            'emp_id',
            'role',
            'is_active',
            'date_joined',
            'password',
        ]
        read_only_fields = ['date_joined','is_active']

    def create(self, validated_data):
        password=validated_data.pop('password',None)
        user=Account.objects.create_user(**validated_data,password=password)# type: ignore
        return user
