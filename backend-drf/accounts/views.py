from django.shortcuts import render
from .serializers import AccountSerializer
from rest_framework import generics
from .models import Account
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from organization_structure.models import Team
from task_management.models import TaskCategory,SubTask,Task
from datetime import timedelta, datetime


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
        print(user.role)
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
class FilteredTrackersView(APIView):
    def post(self, request):
        print("🟢 /get-filtered-trackers endpoint hit!")
        try:
            # Safely read incoming filter data
            selected_node = request.data.get("selectedNode") or {}
            selected_trackers = request.data.get("selectedTrackers") or []
            date_filter = request.data.get("dateFilter", "")
            start_date = request.data.get("startDate")
            end_date = request.data.get("endDate")

            print("📥 Received Filters:")
            print("selected_node:", selected_node)
            print("selected_trackers:", selected_trackers)
            print("date_filter:", date_filter)
            print("start_date:", start_date)
            print("end_date:", end_date)

            # ✅ Dummy static trackers to send
            dummy_trackers = [
                {"id": 1, "name": "Homepage UI", "status": "In Progress", "priority": "High"},
                {"id": 2, "name": "API Integration", "status": "Completed", "priority": "Medium"},
                {"id": 3, "name": "Database Optimization", "status": "Pending", "priority": "Low"},
            ]

            # ✅ Optional filtering simulation
            if date_filter == "Single Day":
                dummy_trackers = dummy_trackers[:2]
            elif date_filter == "Date Range":
                dummy_trackers = dummy_trackers[1:]

            return Response(dummy_trackers, status=status.HTTP_200_OK)

        except Exception as e:
            print("❌ Error in FilteredTrackersView:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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
class TaskProgressTrackerView(APIView):
    def get(self, request):
        # Dummy counts
        tracker_summary = {
            "trackerType": "Task Progress",
            "statusCounts": {
                "New": 5,
                "In Progress": 10,
                "On Hold": 3,
                "Fixed": 7,
                "Total": 25
            },
            # Table data per status
            "tasks": {
                "New": [
                    {"id": 1, "title": "Task 1", "owner": "Alice", "priority": "High"},
                    {"id": 2, "title": "Task 2", "owner": "Bob", "priority": "Low"},
                ],
                "In Progress": [
                    {"id": 3, "title": "Task 3", "owner": "Siddharth", "priority": "Medium"},
                ],
                "On Hold": [
                    {"id": 4, "title": "Task 4", "owner": "John", "priority": "Low"},
                ],
                "Fixed": [
                    {"id": 5, "title": "Task 5", "owner": "Mike", "priority": "High"},
                ],
            }
        }

        return Response(tracker_summary, status=status.HTTP_200_OK)
