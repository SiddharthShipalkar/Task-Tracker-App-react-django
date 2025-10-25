from rest_framework import serializers
from .models import Project, Department, Team


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['project_id', 'project_name', 'is_active', 'created_at', 'updated_at']


class DepartmentSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.filter(is_active=True), source='project', write_only=True
    )

    class Meta:
        model = Department
        fields = [
            'department_id',
            'department_name',
            'project',
            'project_id',
            'is_active',
            'created_at',
            'updated_at',
        ]


class TeamSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(is_active=True), source='department', write_only=True
    )

    class Meta:
        model = Team
        fields = [
            'team_id',
            'team_name',
            'department',
            'department_id',
            'is_active',
            'created_at',
            'updated_at',
        ]
