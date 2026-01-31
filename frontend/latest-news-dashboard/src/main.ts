import { bootstrapApplication } from '@angular/platform-browser';
import { NewsComponent } from './app/news.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClientModule } from '@angular/common/http'; 

bootstrapApplication(NewsComponent, {
  providers: [
    provideAnimations(),
    importProvidersFrom(HttpClientModule),  
    importProvidersFrom(
      FormsModule,
      MatCardModule,
      MatSelectModule,
      MatInputModule,
      MatButtonModule,
      NgxPaginationModule
    )
  ]
}).catch(err => console.error(err));  //  error handling