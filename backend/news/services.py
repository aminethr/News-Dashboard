from django.conf import settings
import requests
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# This specific URL is used because it fetches the latest top headlines/news
NEWS_API_URL = "https://newsapi.org/v2/top-headlines"

def fetch_news_from_api(
    country: Optional[str] = "us",  # default to US top headlines
    category: Optional[str] = None,
    sources: Optional[str] = None,
    query: Optional[str] = None,
    page_size: int = 100,
    page: int = 1,
) -> List[Dict]:
    """
    Fetch news from News API with error handling.
    Developer plan only allows localhost requests.
    """
    # Free-tier limits
    max_page_size = 100
    if page_size > max_page_size:
        page_size = max_page_size
    if page > 1 and page * page_size > max_page_size:
        page = 1

    # Params for NewsAPI
    params = {
        "apiKey": settings.NEWS_API_KEY,
        "pageSize": page_size,
        "page": page,
    }

    # Ensure Developer plan has at least one filter
    if sources:
        params["sources"] = sources
    else:
        params["country"] = country
        if category:
            params["category"] = category
    if query:
        params["q"] = query

    try:
        # Force localhost access (Developer plan requirement)
        response = requests.get(
            NEWS_API_URL,
            params=params,
            timeout=10,
            headers={"Origin": "http://localhost"}  # important
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") != "ok":
            logger.error(f"News API returned non-ok status: {data.get('status')} | {data.get('message')}")
            return []
        articles = data.get("articles", [])
        logger.info(f"Fetched {len(articles)} articles from News API (country={country}, category={category})")
        return articles
    except requests.exceptions.RequestException as e:
        logger.error(f"News API request failed: {e}")
        return []
