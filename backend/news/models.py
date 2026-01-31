from django.db import models


# Represents a news source (e.g., BBC, CNN, etc.)
class Source(models.Model):
    id = models.CharField(max_length=50, primary_key=True)  # Using a string ID since sources have unique identifiers from the API
    name = models.CharField(max_length=255)


# Represents a news article fetched from the API
class Article(models.Model):
    title = models.CharField(max_length=500)
    description = models.TextField(null=True, blank=True)
    content = models.TextField(null=True, blank=True)
    url = models.URLField(unique=True)
    url_to_image = models.URLField(null=True, blank=True)

    source = models.ForeignKey(
        Source,
        on_delete=models.CASCADE,
        db_column="source_id",
        to_field="id",
        null=True,
        blank=True,
    )

    author = models.CharField(max_length=200, null=True, blank=True)
    published_at = models.DateTimeField()
    fetched_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "news_article_partitioned" # Custom table name in PostgreSQL
        managed = False # Table is managed externally (created directly in PostgreSQL as a partitioned table)

    def __str__(self):
        return self.title

    