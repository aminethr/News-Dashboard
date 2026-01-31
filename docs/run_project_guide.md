# Project Run Guide

##  PostgreSQL Setup
### 1. Install PostgreSQL
sudo apt install postgresql postgresql-contrib

### 2. Create Database and User
sudo -u postgres psql

CREATE DATABASE news_dashboard;
CREATE USER news_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE news_dashboard TO news_user;

------------------------------------------------------------------------

## Redis Setup (Caching & Celery Broker)
### 1. Install Redis
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis

### 2. Test Redis
redis-cli ping
PONG

------------------------------------------------------------------------

## Backend (Django)
### 1. Clone the Repository

``` bash
git clone <your-repository-url>
cd news-dashboard-backend
```

### 2. Create Virtual Environment

``` bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate    # Windows
```

### 3. Install Dependencies

``` bash
pip install -r requirements.txt
```

### 4. Environment Variables

Create a `.env` file:

``` env
NEWS_API_KEY=your_news_api_key
DATABASE_NAME=news_dashboard
DATABASE_USER=news_user
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
REDIS_URL=redis://localhost:6379/0
```

### 5. Run Migrations and Server

``` bash
python manage.py migrate
python manage.py runserver
```

Backend runs at: http://localhost:8000

------------------------------------------------------------------------

## Celery
### 1. Start Celery Worker
celery -A backend worker -l info


### 2. Start Celery Beat (Periodic Tasks)
celery -A backend beat -l info


------------------------------------------------------------------------

## Frontend (Angular)
### 1. Install Dependencies

``` bash
cd news-dashboard-frontend
npm install
```

### 2. Run Angular Application

``` bash
ng serve
```

Frontend runs at: http://localhost:4200
