import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// News interface
export interface NewsArticle {
  id: number;
  title: string;
  description: string;
  content: string;
  url: string;
  url_to_image: string;
  source_name: string;
  source_id: string;
  author: string;
  published_at: string;
  fetched_at: string;
}


@Injectable({
  providedIn: 'root'
})
export class NewsService {
  // ✅ Absolute URL to Django backend
  private apiUrl = 'http://localhost:8000/api/news/';

  constructor(private http: HttpClient) {}

  getNews(
    page: number = 1,
    pageSize: number = 50,

    source?: string,
    query?: string
  ): Observable<{ results: NewsArticle[]; count: number }> {
    let params = new HttpParams()

      .set('page', page)
      .set('page_size', pageSize);


    if (source) params = params.set('source', source);
    if (query) params = params.set('q', query);

    return this.http.get<{ results: NewsArticle[]; count: number }>(
      this.apiUrl,
      { params }
    );
  }
}
