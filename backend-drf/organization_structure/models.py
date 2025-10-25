from django.db import models
from simple_history.models import HistoricalRecords

class BaseModel(models.Model):
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Project(BaseModel):
    project_id = models.CharField(max_length=20, primary_key=True)
    project_name = models.CharField(max_length=100, unique=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.project_id} - {self.project_name}"


class Department(BaseModel):
    department_id = models.CharField(max_length=20, primary_key=True)
    department_name = models.CharField(max_length=100)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='departments')
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.department_id} - {self.department_name} ({self.project.project_name})"


class Team(BaseModel):
    team_id = models.CharField(max_length=20, primary_key=True)
    team_name = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='teams')
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.team_id} - {self.team_name} ({self.department.department_name})"
