from django.urls import path
from django.contrib import admin
from news.views import NewsListView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/news/", NewsListView.as_view(), name="news-list"),
]
