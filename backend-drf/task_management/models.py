from datetime import timedelta
from django.db import models
from simple_history.models import HistoricalRecords
from organization_structure.models import Team, Department
from smart_selects.db_fields import ChainedForeignKey

from datetime import timedelta
from accounts.models import Account  # or UserProfile if you’ve extended separately

# ✅ Common fields for reuse
class BaseModel(models.Model):
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# ✅ Task Category Model
class TaskCategory(BaseModel):
    task_category_id = models.CharField(max_length=20, primary_key=True)
    task_category_name = models.CharField(max_length=150, unique=True)

    # relation to Team
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='task_categories'
    )

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.task_category_name} ({self.team.team_name})"


# ✅ SubTask Model
class SubTask(BaseModel):
    subtask_id = models.CharField(max_length=20, primary_key=True)
    subtask_name = models.CharField(max_length=150)

    # relation to TaskCategory
    task_category = models.ForeignKey(
        TaskCategory,
        on_delete=models.CASCADE,
        related_name='subtasks'
    )

    subtask_expected_efforts = models.DurationField( default=timedelta(),
        help_text="Expected time in HH:MM:SS format"
    )

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.subtask_name} ({self.task_category.task_category_name})"





class Task(models.Model):
    # ===============================
    # 🔹 Choice fields
    # ===============================
    STATUS_CHOICES = [
        ("NEW", "New"),
        ("ASSIGNED", "Assigned"),
        ("IN_PROGRESS", "In Progress"),
        ("ON_HOLD", "On Hold"),
        ("FIXED", "Fixed"),
    ]

    PRIORITY_CHOICES = [
        ("HIGH", "High"),
        ("MEDIUM", "Medium"),
        ("LOW", "Low"),
    ]

    DEVIATION_CHOICES = [
        ("BEST_TRACK", "Best Track"),
        ("GOOD_TRACK", "Good Track"),
        ("ON_TRACK", "On Track"),
        ("LOW_DEVIATION", "Low Deviation"),
        ("HIGH_DEVIATION", "High Deviation"),
    ]

    QUALITY_CHOICES = [
        ("BEST", "Best"),
        ("GOOD", "Good"),
        ("MODERATE", "Moderate"),
        ("LOW", "Low"),
        ("BAD", "Bad"),
    ]

    # ===============================
    # 🔹 Core Fields
    # ===============================
    task_id = models.AutoField(primary_key=True)
    task_name = models.CharField(max_length=255)
    task_description = models.TextField(blank=True, null=True)

    # ===============================
    # 🔹 Relations
    # ===============================
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='tasks')
    task_category = ChainedForeignKey(# type: ignore
        TaskCategory,
        chained_field="team",                  # depends on team
        chained_model_field="team",            # foreign key in TaskCategory
        show_all=False,
        auto_choose=True,
        sort=True,
        related_name='tasks',
        on_delete=models.CASCADE
    )

    subtask = ChainedForeignKey(# type: ignore
        SubTask,
        chained_field="task_category",         # depends on selected category
        chained_model_field="task_category",   # foreign key in SubTask
        show_all=False,
        auto_choose=True,
        sort=True,
        related_name='tasks',
        on_delete=models.CASCADE,
        blank=True,
        null=True
    )

    # Assigned users
    assigned_by = models.ForeignKey(
        Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks'
    )
    assigned_to = models.ManyToManyField(
        Account, null=True, blank=True, related_name='received_tasks'
    )

    # ===============================
    # 🔹 Tracking fields
    # ===============================
    task_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="NEW")
    task_priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="LOW")
    task_deviation = models.CharField(max_length=20, choices=DEVIATION_CHOICES, blank=True, null=True)
    task_quality = models.CharField(max_length=20, choices=QUALITY_CHOICES, blank=True, null=True)

    

    # ===============================
    # 🔹 Effort Tracking
    # ===============================
    subtask_count = models.PositiveIntegerField(default=1)
    task_expected_efforts = models.DurationField(blank=True, null=True)
    task_estimated_efforts = models.DurationField(default=timedelta(hours=0))
    task_actual_efforts = models.DurationField(default=timedelta(hours=0))

    # ===============================
    # 🔹 Common Meta fields
    # ===============================
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ===============================
    # 🔹 History Tracking
    # ===============================
    history = HistoricalRecords()

    # ===============================
    # 🔹 Logic for Auto Effort Calculation
    # ===============================
    def save(self, *args, **kwargs):
        # auto-calculate expected effort if subtask provided
        if self.subtask and self.subtask.subtask_expected_efforts:
            self.task_expected_efforts = self.subtask.subtask_expected_efforts * self.subtask_count
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.task_name} ({self.task_status})"
