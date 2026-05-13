# WorkForce Hub - Employee & Task Management System

## Overview
WorkForce Hub is a comprehensive internal company tool for managing employees and tasks with role-based access control.

## Features
- **Authentication**: JWT-based login/signup with BCrypt password encryption
- **Employee Management**: Full CRUD operations with search, filter, and pagination
- **Task Management**: Create, assign, and track tasks with subtasks/checklists
- **Export**: PDF (iText) and Excel (Apache POI) exports
- **API Documentation**: Swagger UI available

## Tech Stack
- **Backend**: Java Spring Boot 3.2 (Maven)
- **Frontend**: Angular 17 + Bootstrap 5
- **Database**: SQLite
- **Auth**: JWT tokens
- **API Docs**: springdoc-openapi
- **PDF**: iText 7
- **Excel**: Apache POI

## Roles
- **ADMIN**: Full system access, user management
- **MANAGER**: Create employees, assign tasks
- **TEAM_LEAD**: View team, monitor tasks
- **EMPLOYEE**: Work on assigned tasks

## Default Login
- Username: `admin`
- Password: `admin123`

## Running Backend
```cmd
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs at: http://localhost:8080

## Running Frontend
```cmd
cd frontend
npm install
npm start
```

Frontend runs at: http://localhost:4200

## API Documentation
After running backend, visit: http://localhost:8080/swagger-ui.html