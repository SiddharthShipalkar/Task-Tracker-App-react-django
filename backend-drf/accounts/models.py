from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from simple_history.models import HistoricalRecords
from smart_selects.db_fields import ChainedForeignKey
from organization_structure.models import Project, Department, Team




class MyAccountManager(BaseUserManager):
    def create_user(self,username,emp_id,email,password=None,**extra_fields):
        if not username:
            raise ValueError("Username is required")
        if not emp_id:
            raise ValueError("Employee ID is required")
        if not email:
            raise ValueError("Email is required")
        user = self.model(
            email=self.normalize_email(email),
            username=username,
            emp_id=emp_id,
            **extra_fields
        )
        user.is_active=True
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self,username,emp_id,email,password, **extra_fields):
        user=self.create_user(
            email=self.normalize_email(email),
            username=username,
            password=password,
            emp_id=emp_id,
             **extra_fields
            
        )
        user.is_admin=True
        user.is_active=True
        user.is_staff=True
        user.is_superadmin=True
        user.save(using=self._db)
        return user
# Create your models here.
class Account(AbstractBaseUser):
    ROLE_CHOICES = [
        ("Associate", "Associate"),
        ("Lead", "Lead"),
        ("Manager", "Manager"),
    ]
    LOCATION_CHOICES = [
        ("Pune", "Pune"),
        ("Nagpur", "Nagpur"),
        ("Ahmedabad", "Ahmedabad"),
    ]
    username=models.CharField(max_length=50,unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    location = models.CharField(max_length=50, choices=LOCATION_CHOICES,default="Pune")
    email=models.EmailField(max_length=100,unique=True)
    emp_id=models.PositiveIntegerField(unique=True)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)

    # 👇 dynamically filtered based on selected project
    department = ChainedForeignKey(# type: ignore
        Department,
        chained_field="project",            # field on this model
        chained_model_field="project",      # field on Department model
        show_all=False,
        auto_choose=True,
        sort=True,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    # 👇 dynamically filtered based on selected department
    team = ChainedForeignKey( # type: ignore
        Team,
        chained_field="department",
        chained_model_field="department",
        show_all=False,
        auto_choose=True,
        sort=True,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )


    #required
    date_joined=models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_superadmin= models.BooleanField(default=False)
    
    USERNAME_FIELD='username'
    REQUIRED_FIELDS=['email','emp_id']
    objects=MyAccountManager()
    history = HistoricalRecords() 
    def __str__(self):
        return self.username
    def has_perm(self,prem,obj=None):
        return self.is_admin
    
    def has_module_perms(self,add_lable):
        return True
    


