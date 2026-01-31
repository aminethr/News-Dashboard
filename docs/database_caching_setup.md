# Database and Caching Setup Documentation

## PostgreSQL Installation

``` bash
sudo apt install postgresql postgresql-contrib
sudo -i -u postgres
```

### Create Database and User

``` sql
CREATE DATABASE news_dashboard;
CREATE USER news_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE news_dashboard TO news_user;
```

### Connect to Database

``` bash
psql -U news_user -d news_dashboard -h localhost -W
```

------------------------------------------------------------------------

## Partitioned Table Design

### Main Partitioned Table
This table was created manually in PostgreSQL using SQL because Django ORM does not support creating partitioned tables automatically. Django models are mapped to this table using managed = False.

``` sql
CREATE TABLE news_article_partitioned (
    id SERIAL NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content TEXT,
    url TEXT NOT NULL,
    url_to_image TEXT,
    source_id VARCHAR(50),
    author VARCHAR(200),
    published_at TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (id, published_at)
) PARTITION BY RANGE (published_at);
```

### Indexes for Optimization

``` sql
CREATE INDEX idx_news_article_source_published
    ON news_article_partitioned (source_id, published_at);

CREATE INDEX idx_news_article_published
    ON news_article_partitioned (published_at DESC);
```

### Monthly Partitions

``` sql
CREATE TABLE news_article_2026_01 PARTITION OF news_article_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE news_article_2026_02 PARTITION OF news_article_partitioned
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

------------------------------------------------------------------------

## Redis Caching Setup

### Install Redis

``` bash
sudo apt install redis-server
redis-server
```

### Django Cache Configuration

``` python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}
```

Caching is used to store API responses for 5 minutes to reduce database
load.

------------------------------------------------------------------------

## Celery Background Tasks


### Django Celery Configuration


CELERY_BEAT_SCHEDULE = {
    'update-news-every-30-mins': {
        'task': 'news.tasks.update_news_from_api',
        'schedule': crontab(minute='*/30'),
    },
}


### Start Celery Worker

``` bash
celery -A backend worker -l info
```

### Start Celery Beat (Periodic Fetching)

``` bash
celery -A backend beat -l info
```

Celery periodically fetches news from NewsAPI and stores it in
PostgreSQL.
