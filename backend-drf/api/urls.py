from django.urls import path 
from accounts import views as AccountViews
urlpatterns=[
    path('register/',AccountViews.RegisterView.as_view())
]