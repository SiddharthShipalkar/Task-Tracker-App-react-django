from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin
from .models import TaskCategory, SubTask ,Task


@admin.register(TaskCategory)
class TaskCategoryAdmin(SimpleHistoryAdmin):
    list_display = ('task_category_id', 'task_category_name', 'team', 'is_active', 'created_at', 'updated_at')
    list_filter = ('team', 'is_active')
    search_fields = ('task_category_name',)
    ordering = ('-created_at',)


@admin.register(SubTask)
class SubTaskAdmin(SimpleHistoryAdmin):
    list_display = ('subtask_id', 'subtask_name', 'task_category', 'subtask_expected_efforts', 'is_active', 'created_at', 'updated_at')
    list_filter = ('task_category', 'is_active')
    search_fields = ('subtask_name',)
    ordering = ('-created_at',)

@admin.register(Task)
class TaskAdmin(SimpleHistoryAdmin):
    list_display = (
        'task_id', 'task_name', 'team', 'task_category', 'task_status',
        'task_priority', 'task_quality', 'is_active', 'created_at'
    )
    list_filter = ('task_status', 'task_priority', 'is_active', 'team')
    search_fields = ('task_name',)
    ordering = ('-created_at',)
