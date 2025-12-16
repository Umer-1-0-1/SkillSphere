# SkillSphere - Learning Management System

![SkillSphere](https://img.shields.io/badge/Version-1.0.0-94C705?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)

## Overview

SkillSphere is a comprehensive Learning Management System that enables instructors to create and manage courses, students to enroll and learn, and administrators to moderate content. Built with Django REST Framework and React.

## Features

**For Students**
- Browse and search course catalog
- Free course enrollment
- Track learning progress
- View completed courses and certificates
- Interactive dashboard with statistics

**For Instructors**
- Create and manage courses
- Upload video lessons and external links
- Save courses as drafts
- Submit courses for admin approval
- Track course status (Draft/Pending/Approved/Rejected)
- Instructor dashboard with analytics

**For Administrators**
- Review pending courses
- Approve or reject courses with feedback
- Email notifications to instructors
- Admin dashboard with system statistics

## Tech Stack

**Backend**
- Django 5.0 & Django REST Framework
- MySQL 8.0
- JWT Authentication
- SMTP Email notifications
- Pillow for image processing
- ReportLab for PDF generation

**Frontend**
- React 18 with Vite
- TailwindCSS
- Axios
- Zustand for state management
- React Router
- Lucide React icons

## Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- Git

### Backend Setup
```bash
# Clone repository
git clone https://github.com/Talha-3921/SkillSphere.git
cd SkillSphere/backend

# Create virtual environment
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your settings

# Create MySQL database
# CREATE DATABASE skillsphere_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

### Frontend Setup
```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env

# Run development server
npm run dev
```

Frontend: http://localhost:3000  
Backend API: http://localhost:8000/api  
Admin Panel: http://localhost:8000/admin

## Project Structure
```
SkillSphere/
├── backend/
│   ├── skillsphere/          # Django project settings
│   ├── users/                # User authentication & management
│   ├── courses/              # Course & lesson management
│   ├── enrollments/          # Student enrollments & progress
│   ├── media/                # Uploaded files
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── layouts/          # Layout components
│   │   ├── lib/              # Utilities & API
│   │   ├── store/            # State management
│   │   └── App.jsx
│   └── package.json
└── docs/
```
