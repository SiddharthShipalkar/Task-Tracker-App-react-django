from django.urls import path 
from accounts import views as AccountViews
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView

urlpatterns=[
    path('register/',AccountViews.RegisterView.as_view()),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('protected-view/',AccountViews.ProtectedView.as_view()),
    path('user-profile/',AccountViews.UserProfileView.as_view(),name='user-profile'),
    path('tree-data/', AccountViews.TreeDataView.as_view(), name='tree-data'),
    path("tasks/create/", AccountViews.TaskCreateView.as_view(), name="task-create"),
    path("teams/", AccountViews.TeamListView.as_view(), name="teams-list"),
    path("task-categories/", AccountViews.TaskCategoryListView.as_view(), name="task-categories-list"),
    path("subtasks/", AccountViews.SubTaskListView.as_view(), name="subtasks-list"),
    path("accounts/", AccountViews.UserListForAssignmentView.as_view(), name="accounts-list"),
    path('self-task-progress-tracker/', AccountViews.SelfTaskProgressTrackerView.as_view(), name='self-task-progress-tracker'),
    path('overall-task-progress-tracker/', AccountViews.OverallTaskProgressTrackerView.as_view(), name='overall-task-progress-tracker'),

    path("tasks/<int:pk>/", AccountViews.TaskDetailView.as_view(), name="task-detail"),

]