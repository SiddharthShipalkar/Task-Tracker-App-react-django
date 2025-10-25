from rest_framework import serializers
from .models import TaskCategory, SubTask, Task
from organization_structure.serializers import TeamSerializer
from accounts.serializers import AccountSerializer
from organization_structure.models import Team


class TaskCategorySerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    team_id = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.filter(is_active=True), source='team', write_only=True
    )

    class Meta:
        model = TaskCategory
        fields = [
            'task_category_id',
            'task_category_name',
            'team',
            'team_id',
            'is_active',
            'created_at',
            'updated_at',
        ]


class SubTaskSerializer(serializers.ModelSerializer):
    task_category = TaskCategorySerializer(read_only=True)
    task_category_id = serializers.PrimaryKeyRelatedField(
        queryset=TaskCategory.objects.filter(is_active=True), source='task_category', write_only=True
    )

    class Meta:
        model = SubTask
        fields = [
            'subtask_id',
            'subtask_name',
            'task_category',
            'task_category_id',
            'subtask_expected_efforts',
            'is_active',
            'created_at',
            'updated_at',
        ]


class TaskSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    team_id = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.filter(is_active=True), source='team', write_only=True
    )

    task_category = TaskCategorySerializer(read_only=True)
    task_category_id = serializers.PrimaryKeyRelatedField(
        queryset=TaskCategory.objects.filter(is_active=True), source='task_category', write_only=True
    )

    subtask = SubTaskSerializer(read_only=True)
    subtask_id = serializers.PrimaryKeyRelatedField(
        queryset=SubTask.objects.filter(is_active=True), source='subtask', write_only=True
    )

    assigned_by = AccountSerializer(read_only=True)
    assigned_by_id = serializers.PrimaryKeyRelatedField(
        queryset=TaskCategory.objects.filter(is_active=True), source='assigned_by', write_only=True
    )

    assigned_to = AccountSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=TaskCategory.objects.filter(is_active=True), source='assigned_to', write_only=True
    )

    class Meta:
        model = Task
        fields = [
            'task_id',
            'task_name',
            'task_description',
            'team',
            'team_id',
            'task_category',
            'task_category_id',
            'subtask',
            'subtask_id',
            'assigned_by',
            'assigned_by_id',
            'assigned_to',
            'assigned_to_id',
            'task_status',
            'task_priority',
            'task_expected_efforts',
            'task_estimated_efforts',
            'task_actual_efforts',
            'is_active',
            'created_at',
            'updated_at',
        ]
