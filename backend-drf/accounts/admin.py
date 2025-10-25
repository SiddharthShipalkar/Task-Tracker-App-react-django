from django.contrib import admin
from .models import Account
from simple_history.admin import SimpleHistoryAdmin
from django.contrib.auth.admin import UserAdmin


# Register your models here.
@admin.register(Account)
class AccountAdmin(SimpleHistoryAdmin):
    list_display = ('username', 'email', 'emp_id', 'role', 'is_active', 'project', 'department', 'team')
    search_fields = ('username', 'email', 'emp_id')
    readonly_fields = ('date_joined', 'last_login')
    list_filter = ('role', 'is_active')
