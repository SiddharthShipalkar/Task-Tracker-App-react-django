from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin
from .models import Project, Department, Team

class TeamInline(admin.TabularInline):
    model = Team
    extra = 1

class DepartmentInline(admin.TabularInline):
    model = Department
    extra = 1

@admin.register(Project)
class ProjectAdmin(SimpleHistoryAdmin):
    list_display = ('project_id', 'project_name', 'is_active', 'created_at')
    inlines = [DepartmentInline]  # Show departments under each project

@admin.register(Department)
class DepartmentAdmin(SimpleHistoryAdmin):
    list_display = ('department_id', 'department_name', 'project', 'is_active')
    inlines = [TeamInline]  # Show teams under each department

@admin.register(Team)
class TeamAdmin(SimpleHistoryAdmin):
    list_display = ('team_id', 'team_name', 'department', 'is_active')
