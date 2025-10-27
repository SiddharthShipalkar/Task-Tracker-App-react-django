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
    
class TreeDataView(APIView):
    def get(self, request):
        tree_data = [
            {
                "id": 1,
                "name": "Project Alpha",
                "type": "project",
                "status": "active",
                "children": [
                    {
                        "id": 11,
                        "name": "Frontend Team",
                        "type": "department",
                        "status": "active",
                        "children": [
                            {"id": 111, "name": "UI Devs", "type": "team", "status": "active"},
                            {"id": 112, "name": "UX Designers", "type": "team", "status": "active"},
                        ],
                    },
                    {
                        "id": 12,
                        "name": "Backend Team",
                        "type": "department",
                        "status": "active",
                        "children": [
                            {"id": 121, "name": "API Devs", "type": "team", "status": "active"},
                            {"id": 122, "name": "Database", "type": "team", "status": "active"},
                        ],
                    },
                ],
            },
            {
                "id": 2,
                "name": "Project Beta",
                "type": "project",
                "status": "inactive",
                "children": [
                    {"id": 21, "name": "Testing", "type": "department", "status": "active"},
                    {"id": 22, "name": "Deployment", "type": "department", "status": "active"},
                ],
            },
        ]
        return Response(tree_data, status=status.HTTP_200_OK)

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
class AddTaskView(APIView):
    def post(self, request):
        task_name = request.data.get("name")
        task_description = request.data.get("description", "")

        print(f"✅ New Task Added: {task_name} - {task_description}")

        # Dummy response for now
        return Response(
            {"message": f"Task '{task_name}' added successfully."},
            status=status.HTTP_201_CREATED
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
