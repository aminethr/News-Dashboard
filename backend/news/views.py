# news/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.core.cache import cache
# For complex OR-based queries
from django.db.models import Q
from django.utils.dateparse import parse_datetime
import logging

# Local application imports
from .models import Article , Source
from .serializers import ArticleSerializer
from .services import fetch_news_from_api

logger = logging.getLogger(__name__)


class NewsPagination(PageNumberPagination):
    """
    Custom pagination class for news listing.
    Controls default page size and maximum allowed page size.
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100




def build_cache_key(params: dict) -> str:
    """
    Build a unique cache key based on request query parameters.
    This ensures different filters/pages are cached independently.
    """
    key_parts = []
    for k, v in sorted(params.items()):
        if v:  # only include non-empty values
            key_parts.append(f"{k}:{v}")
    return "news_" + "_".join(key_parts)



# -------------------------------
# List news from DB with filtering, pagination, and caching
# -------------------------------
class NewsListView(APIView):
    """
    Return news from database with optional filtering these fields: query, source, author, published_at.
    Supports pagination and caching.
    """
    def get(self, request):
    
        params = {
            "query": request.GET.get("q", ""),
            "source": request.GET.get("source", ""),
            "author": request.GET.get("author", ""),
            "published_at": request.GET.get("published_at", ""), 
            "page": request.GET.get("page", 1),
        }

        cache_key = build_cache_key(params)
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        # Base queryset
        articles = Article.objects.all().order_by('-published_at')

        # Filtering by source
        if params["source"]:
         articles = articles.filter(source__name__icontains=params["source"])

        # Filtering by keywords
        if params["query"]:
            articles = articles.filter(
                Q(title__icontains=params["query"]) |
                Q(description__icontains=params["query"]) |
                Q(content__icontains=params["query"])
            )

        # Pagination
        paginator = NewsPagination()
        result_page = paginator.paginate_queryset(articles, request)
        serializer = ArticleSerializer(result_page, many=True)
        response = paginator.get_paginated_response(serializer.data)

        # Cache the paginated response for 1 minutes
        cache.set(cache_key, response.data, timeout=60)

        return response
