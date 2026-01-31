News Dashboard – Setup & Run Guide

This repository contains a full-stack News Dashboard application built with:

Backend: Django + Django REST Framework

Database: PostgreSQL (partitioned tables)

Cache & Broker: Redis

Background Tasks: Celery + Celery Beat

Frontend: Angular

Prerequisites

Make sure the following are installed on your system:

Python 3.10+

PostgreSQL 14+

Redis 6+

Node.js 18+

Angular CLI

------------------------------------------------------------------------

Backend Setup (Django)
1. Clone the Repository
git clone <repository-url>
cd news_dashboard

2. Create and Activate Virtual Environment
python -m venv prjvem
source prjvem/bin/activate

3. Install Python Dependencies
pip install -r requirements.txt

------------------------------------------------------------------------

Database Setup (PostgreSQL)
1. Create Database and User
CREATE DATABASE news_dashboard;
CREATE USER news_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE news_dashboard TO news_user;

2. Partitioned Tables (Important)

News articles are stored in PostgreSQL range-partitioned tables.
These tables cannot be created via Django models and must be created manually using SQL.

Create the partitioned tables using the SQL scripts provided in the documentation:

news_article_partitioned

Monthly partitions (news_article_YYYY_MM)

------------------------------------------------------------------------

Environment Variables

Create a .env file in the backend root directory:

NEWS_API_KEY=your_news_api_key
SECRET_KEY==django.secret key

DATABASE_NAME=news_dashboard
DATABASE_USER=news_user
DATABASE_PASSWORD=your_password



Run Django Migrations and Server
python manage.py migrate
python manage.py runserver


Backend API runs at:

http://127.0.0.1:8000


------------------------------------------------------------------------

Redis Setup

Start Redis:

redis-server


Redis is used for:

API response caching

Celery message broker

------------------------------------------------------------------------

Celery Setup
Start Celery Worker
celery -A backend worker -l info

Start Celery Beat (Periodic Tasks)
celery -A backend beat -l info


Celery periodically fetches news from the external API and stores it in PostgreSQL.

------------------------------------------------------------------------
Frontend Setup (Angular)
1. Install Dependencies
cd frontend
npm install

2. Run Angular Application
ng serve


Frontend runs at:

http://localhost:4200

------------------------------------------------------------------------

Running Order (Recommended)

Redis

Django server

Celery worker

Celery beat

Angular frontend
--------------------
----------------------------------------------------

Notes

The Source table uses a CharField primary key to match external API identifiers.

News articles are inserted into partitioned tables based on published_at.

API responses are cached for improved performance.
