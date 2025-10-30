from django.shortcuts import render
from .serializers import AccountSerializer,TaskProgressTrackerSerializer,TaskDetailSerializer
from rest_framework import generics
from .models import Account
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from organization_structure.models import Team,Project,Department
from task_management.models import TaskCategory,SubTask,Task
from datetime import timedelta, datetime
from django.utils.dateparse import parse_datetime
from rest_framework.generics import RetrieveUpdateAPIView
from .serializers import TaskDeviationTrackerSerializer


# Create your views here.
# ✅ Register new user (public)
class RegisterView(generics.CreateAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [AllowAny]


class ProtectedView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        response={
            'status': 'request was permitted'
        }
        return Response(response)

class UserProfileView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        user=request.user
        return Response({
            "name":user.username,
            "email":user.email,
            "role":user.role,
            "location":user.location,
            "emp_id": user.emp_id,
        })
       
class TreeDataView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        user=request.user
        if not user.is_authenticated:
            return Response({"detail":"Unauthorized"},status=status.HTTP_401_UNAUTHORIZED)
        
        tree_data=[]
        if user.role =="Associate":
            tree_data=self.create_tree_data_for_associate(user)
        elif user.role =="Lead":
            tree_data=self.create_tree_data_for_lead(user)
        elif user.role =="Manager":
            tree_data=self.create_tree_data_for_Manager(user)
        else:
            return Response({"detail":"Unknown ROle"},status=status.HTTP_400_BAD_REQUEST)

        
        return Response(tree_data, status=status.HTTP_200_OK)
    def create_tree_data_for_associate(self,user):
        if not user.project or not user.department or not user.team:
            return []
        return [
            {
                "id": user.project.project_id,
                "name": user.project.project_name,
                "type": "project",
                "status": getattr(user.project,"status","inactive"),
                "children": [
                    {
                        "id": user.department.department_id,
                        "name": user.department.department_name,
                        "type": "department",
                        "status": getattr(user.department,"status","inactive"),
                        "children": [
                                {"id": user.team.team_id,
                                "name": user.team.team_name,
                                    "type": "team", 
                                    "status": getattr(user.team,"status","active"),
                                }
                                
                        ]
                    }
                ]
            }
        ]
    def create_tree_data_for_lead(self,user):
        if not user.project :
            return []
        print(user.role)
        return [
            {
                "id": user.project.project_id,
                "name": user.project.project_name,
                "type": "project",
                "status": getattr(user.project,"status","inactive"),
                "children": [
                    {
                        "id": user.department.department_id,
                        "name": user.department.department_name,
                        "type": "department",
                        "status": getattr(user.department,"status","inactive"),
                        "children": [
                                {"id": user.team.team_id,
                                "name": user.team.team_name,
                                    "type": "team", 
                                    "status": getattr(user.team,"status","active"),
                                }
                                
                        ]
                    }
                ]
            }
        ]
        
    def create_tree_data_for_Manager(self,user):
        if not user.project or not user.department or not user.team:
            return []
        print(user.role)
        return [
            {
                "id": user.project.project_id,
                "name": user.project.project_name,
                "type": "project",
                "status": getattr(user.project,"status","active"),
                "children": [
                    {
                        "id": user.department.department_id,
                        "name": user.department.department_name,
                        "type": "department",
                        "status": getattr(user.department,"status","active"),
                        "children": [
                                {"id": user.team.team_id,
                                "name": user.team.team_name,
                                    "type": "team", 
                                    "status": getattr(user.team,"status","active"),
                                }
                                
                        ]
                    }
                ]
            }
        ]
        

# --------------------------
# 2️⃣ FILTERED TRACKERS API
# --------------------------
# --------------------------
# 3️⃣ ADD TASK API
# --------------------------
class TeamListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        emp_id = request.query_params.get("emp_id")
        if not emp_id:
            return Response({"error": "emp_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Account.objects.get(emp_id=emp_id)
            department = user.department
            if not department:
                return Response({"error": "No department assigned for this user"}, status=404)

            teams = Team.objects.filter(department=department, is_active=True)
            data = [{"id": t.team_id, "name": t.team_name} for t in teams]
            return Response(data, status=200)

        except Account.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

class TaskCategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        team_id = request.query_params.get("team_id")
        if not team_id:
            return Response({"error": "team_id is required"}, status=400)

        categories = TaskCategory.objects.filter(team_id=team_id, is_active=True)
        data = [{"id": c.task_category_id, "name": c.task_category_name} for c in categories]
        return Response(data, status=200)

class SubTaskListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        task_category_id = request.query_params.get("task_category_id")
        if not task_category_id:
            return Response({"error": "task_category_id is required"}, status=400)

        subtasks = SubTask.objects.filter(task_category_id=task_category_id, is_active=True)
        data = [{"id": s.subtask_id, "name": s.subtask_name} for s in subtasks]
        return Response(data, status=200)

class UserListForAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        roles = ["Associate", "Lead"]
        users = Account.objects.filter(role__in=roles, is_active=True)
        data = [
            {"id": u.emp_id, "name": u.username, "role": u.role, "email": u.email}
            for u in users
        ]
        return Response(data)
    
class TaskCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data
        print("InAdd task")
        try:
            # 🔹 Fetch required related objects
            team = Team.objects.get(pk=data["team_id"])
            category = TaskCategory.objects.get(pk=data["task_category_id"])
            subtask = (
                SubTask.objects.get(pk=data["subtask_id"])
                if data.get("subtask_id")
                else None
            )

            # 🔹 Parse subtask count
            subtask_count = int(data.get("subtask_count", 1))

            # 🔹 Convert "HH:MM:SS" → timedelta
            estimated_efforts_str = data.get("task_estimated_efforts", "00:00:00")
            try:
                h, m, s = map(int, estimated_efforts_str.split(":"))
                task_estimated_efforts = timedelta(hours=h, minutes=m, seconds=s)
            except Exception:
                task_estimated_efforts = timedelta(0)

            # 🔹 Auto-calculate expected efforts from subtask
            task_expected_efforts = None
            if subtask and subtask.subtask_expected_efforts:
                try:
                    task_expected_efforts = (
                        subtask.subtask_expected_efforts * subtask_count
                    )
                except Exception:
                    task_expected_efforts = timedelta(0)
            print("fields ready")
            # 🔹 Create new task
            task = Task.objects.create(
                task_name=data["task_name"],
                task_description=data.get("description", ""),
                team=team,
                task_category=category,
                subtask=subtask,
                subtask_count=subtask_count,
                task_estimated_efforts=task_estimated_efforts,
                task_expected_efforts=task_expected_efforts,
                task_status="NEW",
                task_priority=data.get("priority", "LOW").upper(),
                assigned_by=user,
            )

            # 🔹 Handle multiple assigned users
            assigned_ids = data.get("assigned_to", [])
            if assigned_ids:
                assigned_users = Account.objects.filter(emp_id__in=assigned_ids)
                task.assigned_to.set(assigned_users)
            else:
                task.assigned_to.set([user])  # fallback

            task.save()
            print("task Saved Sucessfully")
            return Response(
                {
                    "message": "✅ Task created successfully",
                    "task_id": task.task_id,
                    "expected_efforts": str(task.task_expected_efforts),
                    "estimated_efforts": str(task.task_estimated_efforts),
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            print("❌ Task creation failed:", e)
            return Response(
                {"error": f"Task creation failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
# --------------------------
# 4️⃣ TRACKER CARD DATA API
# --------------------------
def apply_date_filter(tasks,date_filter,start_date,end_date):
        if date_filter =="Single Day" and start_date:
            date=parse_datetime(start_date)
            if date:
                return tasks.filter(created_at__date=date.date())
        elif date_filter=="Date Range" and start_date and end_date:
            start=parse_datetime(start_date)
            end=parse_datetime(end_date)
            if start and end:
                return tasks.filter(created_at__date__range=(start.date(),end.date())) 
        elif date_filter =="Until Date" and start_date:
            date=parse_datetime(start_date)
            if date:
                return tasks.filter(created_at__date__lte=date.date())
        return None
def get_all_active_teams_from_selected_node(node_type, node_id):
    teams = []

    if node_type == "project":
        try:
            project = Project.objects.get(project_id=node_id)
            departments = Department.objects.filter(project=project)
            for dept in departments:
                dep_teams = get_all_active_teams_from_selected_node("department", dept.department_id)
                teams.extend(dep_teams)
        except Project.DoesNotExist:
            pass

    elif node_type == "department":
        try:
            department = Department.objects.get(department_id=node_id)
            dep_teams = list(Team.objects.filter(department=department))
            teams.extend(dep_teams)
        except Department.DoesNotExist:
            pass

    elif node_type == "team":
        try:
            team = Team.objects.get(team_id=node_id)
            teams.append(team)
        except Team.DoesNotExist:
            pass

    return teams
def build_task_progress_response(tasks, tracker_type, date_filter="", start_date=None, end_date=None):
    status_group = {
        "New": [],
        "Assigned": [],
        "In Progress": [],
        "On Hold": [],
        "Fixed": [],
    }

    # Apply date filter
    filtered_tasks = apply_date_filter(tasks, date_filter, start_date, end_date)
    if filtered_tasks is None or not filtered_tasks.exists():
        status_counts = {k: 0 for k in status_group}
        status_counts["Total"] = 0
        return {
            "trackerType": tracker_type,
            "statusCounts": status_counts,
            "tasks": status_group
        }

    # Categorize tasks by status
    for task in filtered_tasks:
        task_status = task.task_status
        serialized = TaskProgressTrackerSerializer(task).data
        if task_status == "NEW":
            status_group["New"].append(serialized)
        elif task_status == "ASSIGNED":
            status_group["Assigned"].append(serialized)
        elif task_status == "IN_PROGRESS":
            status_group["In Progress"].append(serialized)
        elif task_status == "ON_HOLD":
            status_group["On Hold"].append(serialized)
        elif task_status == "FIXED":
            status_group["Fixed"].append(serialized)

    # Count totals
    status_counts = {k: len(v) for k, v in status_group.items()}
    status_counts["Total"] = sum(status_counts.values())

    return {
        "trackerType": tracker_type,
        "statusCounts": status_counts,
        "tasks": status_group
    }

class OverallTaskProgressTrackerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            filters = request.data
            selected_node = filters.get("selectedNode", {})
            date_filter = filters.get("dateFilter", "")
            start_date = filters.get("startDate")
            end_date = filters.get("endDate")

            # No node selected
            if not selected_node:
                return Response(
                    build_task_progress_response(Task.objects.none(), "Overall Task Progress"),
                    status=status.HTTP_200_OK
                )

            node_type = selected_node.get("type", "")
            node_id = selected_node.get("id", "")
            node_status = selected_node.get("status")

            # If inactive node
            if node_status == "inactive":
                return Response(
                    build_task_progress_response(Task.objects.none(), "Overall Task Progress"),
                    status=status.HTTP_200_OK
                )

            teams = get_all_active_teams_from_selected_node(node_type, node_id)
            tasks = Task.objects.filter(team__in=teams)

            response_data = build_task_progress_response(tasks, "Overall Task Progress", date_filter, start_date, end_date)
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error in OverallTaskProgressTrackerView:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)                 

class SelfTaskProgressTrackerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            filters = request.data
            user = request.user
            date_filter = filters.get("dateFilter", "")
            start_date = filters.get("startDate")
            end_date = filters.get("endDate")

            tasks = Task.objects.filter(assigned_to=user)

            response_data = build_task_progress_response(tasks, "Self Task Progress", date_filter, start_date, end_date)
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error in SelfTaskProgressTrackerView:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



def build_task_deviation_response(tasks, tracker_type):
    """
    Builds response for Task Deviation Tracker
    """

    deviation_group = {
        "Best Track": [],
        "Good Track": [],
        "On Track": [],
        "Low Deviation": [],
        "High Deviation": [],
    }

    # Handle no tasks case
    if not tasks.exists():
        status_counts = {k: 0 for k in deviation_group}
        status_counts["Total"] = 0
        return {
            "trackerType": tracker_type,
            "statusCounts": status_counts,
            "columns": [
                {"title": "Task ID", "dataIndex": "task_id"},
                {"title": "Title", "dataIndex": "task_name"},
                {"title": "Priority", "dataIndex": "task_priority_display"},
                {"title": "Deviation", "dataIndex": "task_deviation_display"},
            ],
            "items": deviation_group
        }

    # Serialize all tasks at once
    serialized_tasks = TaskDeviationTrackerSerializer(tasks, many=True).data

    # Categorize by readable deviation name
    for task in serialized_tasks:
        deviation_value = task.get("task_deviation_display") or "On Track"

        if deviation_value in deviation_group:
            deviation_group[deviation_value].append(task)
        else:
            deviation_group["On Track"].append(task)

    # Count totals
    status_counts = {k: len(v) for k, v in deviation_group.items()}
    status_counts["Total"] = sum(status_counts.values())

    return {
        "trackerType": tracker_type,
        "statusCounts": status_counts,
        "columns": [
            {"title": "Task ID", "dataIndex": "task_id"},
            {"title": "Title", "dataIndex": "task_name"},
            {"title": "Priority", "dataIndex": "task_priority_display"},
            {"title": "Deviation", "dataIndex": "task_deviation_display"},
        ],
        "items": deviation_group
    }

class TaskDeviationTrackerView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request):
        try:
            filters = request.data
            selected_node = filters.get("selectedNode", {})
            date_filter = filters.get("dateFilter", "")
            start_date = filters.get("startDate")
            end_date = filters.get("endDate")
           
            # No node selected
            if not selected_node:
                return Response(
                    build_task_deviation_response(Task.objects.none(), "Task Deviation Tracker"),
                    status=status.HTTP_200_OK
                )

            node_type = selected_node.get("type", "")
            node_id = selected_node.get("id", "")
            node_status = selected_node.get("status")

            # If inactive node
            if node_status == "inactive":
                return Response(
                    build_task_deviation_response(Task.objects.none(), "Task Deviation Tracker"),
                    status=status.HTTP_200_OK
                )

            teams = get_all_active_teams_from_selected_node(node_type, node_id)
            tasks = Task.objects.filter(team__in=teams)

            # Apply date filter (reuse your existing helper if you want)
            tasks = apply_date_filter(tasks, date_filter, start_date, end_date)

            response_data = build_task_deviation_response(tasks, "Task Deviation Tracker")
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error in TaskDeviationTrackerView:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
class TaskDetailView(RetrieveUpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskDetailSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        """🔹 Get task details by ID"""
        try:
            task = self.get_object()
            serializer = self.get_serializer(task)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk, *args, **kwargs):
        """🔹 Update task details"""
        task = self.get_object()
        serializer = self.get_serializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            updated_task=serializer.save()
            if updated_task.task_status=="FIXED" and updated_task.task_actual_efforts:
                actual_efforts=updated_task.task_actual_efforts.total_seconds()
                estimated_or_expected_efforts=None
                if updated_task.task_expected_efforts==None:
                    estimated_or_expected_efforts= updated_task.task_estimated_efforts.total_seconds()
                else:
                    estimated_or_expected_efforts=updated_task.task_expected_efforts.total_seconds()
                self.calculate_deviation_category(estimated_or_expected_efforts,actual_efforts,updated_task)
                updated_task.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def calculate_deviation_category(self,estimated_or_expected_efforts,actual_efforts,updated_task):
        if estimated_or_expected_efforts>0:
            deviation_percent=((actual_efforts - estimated_or_expected_efforts)/estimated_or_expected_efforts) *  100
            if deviation_percent<=-20:
                updated_task.task_deviation ="BEST_TRACK"
            elif -20<deviation_percent<= -10:
                updated_task.task_deviation ="GOOD_TRACK"
            elif -10< deviation_percent <= 10:
                updated_task.task_deviation ="ON_TRACK"
            elif 10<deviation_percent<=25:
                updated_task.task_deviation ="LOW_DEVIATION"
            else:
                updated_task.task_deviation ="HIGH_DEVIATION"



