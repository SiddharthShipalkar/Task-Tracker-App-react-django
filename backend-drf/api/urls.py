from django.urls import path 
from accounts import views as AccountViews
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView

urlpatterns=[
    path('register/',AccountViews.RegisterView.as_view()),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('protected-view/',AccountViews.ProtectedView.as_view()),
    path('tree-data/', AccountViews.TreeDataView.as_view(), name='tree-data'),
    path('get-filtered-trackers/', AccountViews.FilteredTrackersView.as_view(), name='filtered-trackers'),
    path('add-task/', AccountViews.AddTaskView.as_view(), name='add-task'),
    path('task-progress-tracker/', AccountViews.TaskProgressTrackerView.as_view(), name='task-progress-tracker'),

]