from rest_framework import serializers
from .models import Account
from task_management.models import Task


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

# serializers.py


class TaskProgressTrackerSerializer(serializers.ModelSerializer):
    assigned_to = serializers.StringRelatedField(many=True)  # many=True since it's a ManyToManyField

    class Meta:
        model = Task
        fields = ['task_id', 'task_name', 'task_priority', 'task_status', 'assigned_to']
class TaskDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "task_id",
            "task_name",
            "task_description",
            "task_priority",
            "task_status",
            "created_at",
            "updated_at",
            "task_actual_efforts",
        ]
        read_only_fields = ["task_id", "created_at", "updated_at"]

class TaskDeviationTrackerSerializer(serializers.ModelSerializer):
    task_deviation_display = serializers.CharField(source='get_task_deviation_display', read_only=True)
    task_priority_display = serializers.CharField(source='get_task_priority_display', read_only=True)

    class Meta:
        model = Task
        fields = [
            "task_id",
            "task_name",
            "task_priority",
            "task_priority_display",
            "task_deviation",
            "task_deviation_display",
        ]
