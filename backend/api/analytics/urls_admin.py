from django.urls import path

from .views import AdminAnalyticsView, AdminExportCSVView, AdminExportXLSXView

urlpatterns = [
    path('', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('export.csv', AdminExportCSVView.as_view(), name='admin-export-csv'),
    path('export.xlsx', AdminExportXLSXView.as_view(), name='admin-export-xlsx'),
]
