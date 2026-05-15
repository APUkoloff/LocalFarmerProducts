import csv
import io
from datetime import datetime

from django.http import HttpResponse
from openpyxl import Workbook
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.users.permissions import IsAdmin, IsSeller

from .services import admin_analytics, export_orders_data, parse_period, seller_analytics


class SellerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsSeller]

    def get(self, request):
        period = request.query_params.get('period', 'week')
        granularity = request.query_params.get('granularity', 'day')
        from_date = request.query_params.get('from')
        to_date = request.query_params.get('to')
        if from_date and to_date:
            from_dt = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
            to_dt = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
        else:
            from_dt, to_dt = parse_period(period)
        data = seller_analytics(request.user, from_dt, to_dt, granularity)
        return Response(data)


class AdminAnalyticsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        period = request.query_params.get('period', 'week')
        granularity = request.query_params.get('granularity', 'day')
        from_date = request.query_params.get('from')
        to_date = request.query_params.get('to')
        if from_date and to_date:
            from_dt = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
            to_dt = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
        else:
            from_dt, to_dt = parse_period(period)
        data = admin_analytics(from_dt, to_dt, granularity)
        return Response(data)


class AdminExportCSVView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        period = request.query_params.get('period', 'month')
        from_dt, to_dt = parse_period(period)
        rows = export_orders_data(from_dt, to_dt)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders_export.csv"'
        if not rows:
            writer = csv.writer(response)
            writer.writerow(['order_id', 'buyer', 'status', 'product', 'quantity', 'price', 'total', 'created_at'])
            return response
        writer = csv.DictWriter(response, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
        return response


class AdminExportXLSXView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        period = request.query_params.get('period', 'month')
        from_dt, to_dt = parse_period(period)
        rows = export_orders_data(from_dt, to_dt)
        wb = Workbook()
        ws = wb.active
        ws.title = 'Orders'
        headers = ['order_id', 'buyer', 'status', 'product', 'quantity', 'price', 'total', 'created_at']
        ws.append(headers)
        for row in rows:
            ws.append([row[h] for h in headers])
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        response = HttpResponse(
            buffer.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = 'attachment; filename="orders_export.xlsx"'
        return response
