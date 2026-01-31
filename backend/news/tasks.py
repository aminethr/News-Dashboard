from celery import shared_task
from .services import fetch_news_from_api
from .models import Article, Source
from django.utils.dateparse import parse_datetime
from django.utils.timezone import make_aware, is_naive
import logging

logger = logging.getLogger(__name__)

@shared_task
def update_news_from_api():

    """
    Periodic Celery task to fetch latest news from the API and update the database.
    - Fetches articles from the API (100 per page in this example)
    - Creates or updates Source and Article records
    - Handles timezone-aware datetime conversion
    - Logs any failures during saving
    """

    articles = fetch_news_from_api(page_size=100, page=1)
    saved_count = 0 # Counter for successfully saved articles

    for item in articles:
        try:
            # Extract source info from API response
            source_data = item.get('source', {})
            source_obj = None

            # Only create/get Source if both id and name exist
            if source_data.get('id') and source_data.get('name'):
                source_obj, _ = Source.objects.get_or_create(
                    id=source_data['id'],
                    defaults={"name": source_data['name']}
                )

            pub_dt = parse_datetime(item.get('publishedAt'))
            if pub_dt and is_naive(pub_dt):
                pub_dt = make_aware(pub_dt)

            # Create new Article or update existing one based on URL
            Article.objects.update_or_create(
                url=item['url'],
                defaults={
                    "title": item.get('title'),
                    "description": item.get('description'),
                    "content": item.get('content'),
                    "url_to_image": item.get('urlToImage'),
                    "source": source_obj,
                    "author": item.get('author'),
                    "published_at": pub_dt,
                }
            )
            saved_count += 1

        except Exception as e:
            # Log errors without stopping the whole update
            logger.error(f"Failed to save article '{item.get('title')}': {e}")

    # Log completion of the periodic task
    logger.info(f"Periodic news update complete. Saved {saved_count} articles.")
    return saved_count
