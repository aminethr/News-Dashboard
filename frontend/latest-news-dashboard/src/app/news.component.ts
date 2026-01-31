import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { NewsService, NewsArticle } from './news/news';
import { ChangeDetectorRef } from '@angular/core';


@Component({
    
  selector: 'app-news',
  standalone: true,
  imports: [
    
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <header class="header">
        <h1>📰 Latest News Dashboard</h1>
        <p class="subtitle">Stay updated with the latest news from around the world</p>
      </header>

      <!-- Search and Filter Section -->
      <div class="filter-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search News</mat-label>
          <input matInput [(ngModel)]="searchQuery" placeholder="Enter keywords..." (keyup.enter)="applyFilters()">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>



        <mat-form-field appearance="outline" class="source-field">
          <mat-label>Source</mat-label>
          <input matInput [(ngModel)]="selectedSource" placeholder="e.g., BBC News" (keyup.enter)="applyFilters()">
        </mat-form-field>


<button mat-raised-button color="warn" class="filter-btn" (click)="resetFilters()">
  <mat-icon>refresh</mat-icon>
  Reset
</button>


      </div>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading news articles...</p>
      </div>

      <!-- Results Info -->
      <div *ngIf="!loading && news.length > 0" class="results-info">
        <p>Showing {{ news.length }} articles (Total: {{ totalNews }} results)</p>
      </div>

      <!-- No Results Message -->
      <div *ngIf="!loading && news.length === 0" class="no-results">
        <mat-icon>info</mat-icon>
        <h3>No articles found</h3>
        <p>Try adjusting your search criteria or filters</p>
      </div>

      <!-- News Grid -->
      <div class="news-grid" *ngIf="!loading && news.length > 0">
        <mat-card *ngFor="let article of news" class="news-card" (click)="openArticle(article.url)">
          <!-- Article Image -->
          <div class="card-image-container">
            <img 
              mat-card-image 
              *ngIf="article.url_to_image" 
              [src]="article.url_to_image" 
              [alt]="article.title"
              (error)="handleImageError($event)">
            <div *ngIf="!article.url_to_image" class="no-image">
              <mat-icon>article</mat-icon>
            </div>
          </div>

          <!-- Article Content -->
          <mat-card-header>
            <mat-card-title>{{ article.title }}</mat-card-title>
            <mat-card-subtitle>
              <span class="source">{{ article.source_name }}</span>
              <span class="separator">•</span>
              <span class="date">{{ article.published_at | date:'MMM d, y, h:mm a' }}</span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="description">{{ article.description || 'No description available' }}</p>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button color="primary">
              Read More
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="!loading && totalPages > 1">
        <button 
          mat-raised-button 
          (click)="prevPage()" 
          [disabled]="page === 1">
          <mat-icon>chevron_left</mat-icon>
          Previous
        </button>

        <div class="page-info">
          <span class="current-page">Page {{ page }}</span>
          <span class="separator">of</span>
          <span class="total-pages">{{ totalPages }}</span>
        </div>

        <button 
          mat-raised-button 
          (click)="nextPage()" 
          [disabled]="page === totalPages">
          Next
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
    }

    /* Header Styles */
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .header h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 600;
      letter-spacing: -0.5px;
    }

    .subtitle {
      margin: 10px 0 0 0;
      font-size: 1.1rem;
      opacity: 0.95;
    }

    /* Filter Section */
    .filter-section {
      display: flex;
      gap: 15px;
      padding: 25px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin-bottom: 30px;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    .search-field {
      flex: 2;
      min-width: 250px;
    }


    .source-field {
      flex: 1;
      min-width: 180px;
    }

    .filter-btn,
     {
      margin-top: 8px;
      height: 56px;
      padding: 0 24px;
    }

    .filter-btn mat-icon,
     {
      margin-right: 8px;
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 20px;
    }

    .loading-container p {
      color: #666;
      font-size: 1.1rem;
    }

    /* Results Info */
    .results-info {
      text-align: center;
      margin-bottom: 20px;
      color: #666;
      font-size: 0.95rem;
    }

    /* No Results */
    .no-results {
      text-align: center;
      padding: 80px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .no-results mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #999;
      margin-bottom: 16px;
    }

    .no-results h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .no-results p {
      margin: 0;
      color: #666;
    }

    /* News Grid */
    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    /* News Card */
    .news-card {
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .news-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }

    .card-image-container {
      position: relative;
      width: 100%;
      height: 220px;
      overflow: hidden;
      background: #f0f0f0;
    }

    .card-image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .news-card:hover .card-image-container img {
      transform: scale(1.05);
    }

    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .no-image mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: white;
      opacity: 0.7;
    }

    mat-card-header {
      padding: 16px 16px 8px 16px;
    }

    mat-card-title {
      font-size: 1.15rem;
      line-height: 1.5;
      margin-bottom: 12px;
      color: #333;
      font-weight: 600;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #666;
      flex-wrap: wrap;
    }

    .source {
      color: #667eea;
      font-weight: 500;
    }

    .separator {
      color: #ccc;
    }

    .date {
      color: #999;
    }

    mat-card-content {
      flex-grow: 1;
      padding: 0 16px 16px 16px;
    }

    .description {
      color: #555;
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    mat-card-actions {
      padding: 8px 16px 16px 16px;
      margin: 0;
    }

    mat-card-actions button {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
      padding: 30px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .pagination button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 24px;
      height: 48px;
    }

    .page-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.1rem;
      color: #333;
      min-width: 140px;
      justify-content: center;
    }

    .current-page {
      font-weight: 600;
      color: #667eea;
      font-size: 1.3rem;
    }

    .separator {
      color: #999;
      font-weight: 400;
    }

    .total-pages {
      color: #666;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .header h1 {
        font-size: 1.8rem;
      }

      .subtitle {
        font-size: 0.95rem;
      }

      .news-grid {
        grid-template-columns: 1fr;
      }

      .filter-section {
        flex-direction: column;
      }

      .search-field,
      .source-field {
        width: 100%;
      }

      .filter-btn,
      {
        width: 100%;
      }
    }
  `]
})
export class NewsComponent implements OnInit {
  news: NewsArticle[] = [];
  totalNews = 0;
  page = 1;
  pageSize = 50;
  selectedCategory = '';
  selectedSource = '';
  searchQuery = '';
  loading = false;

  constructor(private newsService: NewsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log("LOAD NEWS CALLED");
    this.loadNews();
  }

  loadNews() {
    this.loading = true;
    
    this.newsService.getNews(
      this.page, 
      this.pageSize, 
      this.selectedSource, 
      this.searchQuery
    ).subscribe({
      next: (res) => {
        this.news = res.results;
        this.totalNews = res.count;
        this.loading = false;
this.cdr.detectChanges();

      },
      error: (err) => {
        console.error('Error loading news:', err);
        this.loading = false;
        this.news = [];
      }
    });
  }

  applyFilters() {
    this.page = 1; // Reset to first page when filtering
    this.loadNews();
  }


  resetFilters() {
  this.searchQuery = '';
  this.selectedSource = '';
  this.selectedCategory = '';
  this.page = 1;
  this.loadNews(); // reload without filters
}

  get totalPages(): number {
    return Math.ceil(this.totalNews / this.pageSize);
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadNews();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadNews();
    }
  }

  openArticle(url: string) {
    window.open(url, '_blank');
  }

  handleImageError(event: any) {
    event.target.style.display = 'none';
  }
}