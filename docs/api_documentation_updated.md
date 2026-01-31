# API Documentation

## Base URL

    http://localhost:8000/api/news/

------------------------------------------------------------------------

## GET /api/news/

Retrieve news articles stored in the database.

### Query Parameters

  ------------------------------------------------------------------------
  Parameter                    Type             Description
  ---------------------------- ---------------- --------------------------
  page                         int              Page number (default: 1)

  page_size                    int              Number of articles per
                                                page (default: 50)

  q                            string           Search keyword in title,
                                                description, or content

  source                       string           Filter by source name

  author                       string           Filter by author

  published_at                 date             Filter by publication date
  ------------------------------------------------------------------------

------------------------------------------------------------------------

### Example Request

``` bash
GET /api/news/?q=AI&source=BBC&page=2&page_size=50
```

------------------------------------------------------------------------

### Example Response

``` json
{
  "count": 120,
  "next": "/api/news/?page=3",
  "previous": "/api/news/?page=1",
  "results": [
    {
      "id": 1,
      "title": "AI Revolution",
      "description": "Latest AI news...",
      "url": "https://example.com/article",
      "source_name": "BBC News",
      "published_at": "2026-01-30T12:00:00Z"
    }
  ]
}
```

------------------------------------------------------------------------

## Caching Behavior

-   API responses are cached for **5 minutes** using Redis.
-   Cache keys are generated based on query parameters (search query,
    source, page, etc.).
-   This significantly reduces database load and improves API response
    time.

------------------------------------------------------------------------

# Background Services and Architecture

## 1. External News Fetching Service

The backend includes an internal service responsible for fetching news
from the **NewsAPI**.\
This service is **not exposed as a REST API endpoint** and is only used
internally.

### Service Function

-   `fetch_news_from_api()` communicates with NewsAPI.
-   Handles API parameters (country, category, source, query,
    pagination).
-   Implements error handling and free-tier constraints.
-   Forces localhost origin for Developer plan compatibility.

This service layer separates external API logic from Django views,
improving maintainability.

------------------------------------------------------------------------

## 2. Background Task Processing (Celery + Redis)

News ingestion is handled asynchronously using **Celery** with **Redis
as the message broker**.

### Periodic Task

-   `update_news_from_api` Celery task runs every 30 minutes using
    Celery Beat.
-   Fetches latest articles from NewsAPI.
-   Stores articles in PostgreSQL using `update_or_create` to avoid
    duplicates.

### Benefits

-   Prevents blocking the Django web server.
-   Enables scalable background processing.
-   Decouples ingestion logic from API serving layer.

------------------------------------------------------------------------

## 3. Database Storage Strategy

Articles are stored in a **PostgreSQL partitioned table**:

-   Partitioned by `published_at` (monthly partitions).
-   Composite primary key `(id, published_at)`.
-   Indexes created for:
    -   `source_id`
    -   `published_at`
    -   Combined `(source_id, published_at)`

This design improves query performance and scalability for large
datasets.

------------------------------------------------------------------------

## 4. Caching Layer (Redis)

Redis is used as a caching layer for API responses:

-   Cache keys are generated dynamically based on request filters.
-   Reduces repetitive database queries.
-   Improves frontend performance and scalability.

------------------------------------------------------------------------

## Summary of System Architecture

-   **Service Layer:** NewsAPI integration logic.
-   **Task Queue:** Celery + Redis for background ingestion.
-   **Database:** PostgreSQL with partitioning and indexing.
-   **Cache:** Redis for API response caching.
-   **API Layer:** Django REST Framework endpoints for Angular frontend.

This architecture ensures scalability, performance optimization, and
separation of concerns.
