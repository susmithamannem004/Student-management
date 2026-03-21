# StudentHub — Student Management System

**Java Spring Boot + React | Full Stack Project**

---

## Tech Stack

| Layer           | Technology                 |
| --------------- | -------------------------- |
| Backend         | Java 17 + Spring Boot 3.2  |
| Database        | H2 In-Memory (zero config) |
| Frontend        | HTML + CSS + Vanilla JS    |
| Deploy Backend  | Render.com (free)          |
| Deploy Frontend | Vercel (free)              |

---

## Features

- View all students in a sortable table
- Add new student (with validation)
- Edit existing student
- Delete student (with confirmation)
- Search by name, email, department
- Filter by status (Active / Inactive / Graduated)
- Live stats dashboard
- Filter by department from sidebar

---

## Run Locally

### Prerequisites

- Java 17+ installed
- Maven 3.8+ installed (or use the wrapper `./mvnw`)

### Step 1 — Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs at: http://localhost:8080

API Endpoints:

- GET /api/students — all students
- GET /api/students/{id} — single student
- POST /api/students — create student
- PUT /api/students/{id} — update student
- DELETE /api/students/{id} — delete student
- GET /api/students/search?query=priya
- GET /api/students/stats
- GET /h2-console — H2 DB browser (JDBC URL: jdbc:h2:mem:studentdb)

### Step 2 — Open the frontend

Simply open `frontend/index.html` in your browser.

No npm, no build step needed!

---

## Deploy to Production

### Backend → Render.com

1. Push `backend/` folder to a GitHub repo
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `./mvnw package -DskipTests`
   - **Start Command:** `java -jar target/student-management-0.0.1-SNAPSHOT.jar`
   - **Environment:** Java
5. Click Deploy
6. Copy your Render URL (e.g. https://studenthub-api.onrender.com)

### Frontend → Vercel

1. Push `frontend/` folder to a GitHub repo
2. Go to https://vercel.com → New Project → Import repo
3. No build settings needed (static HTML)
4. Edit `frontend/index.html`:
   - Change `const API = 'http://localhost:8080/api/students'`
   - To `const API = 'https://YOUR-RENDER-URL.onrender.com/api/students'`
5. Deploy!

---

## Project Structure

```
student-management/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/studentapp/
│       ├── StudentManagementApplication.java
│       ├── DataInitializer.java
│       ├── model/Student.java
│       ├── repository/StudentRepository.java
│       ├── service/StudentService.java
│       └── controller/StudentController.java
└── frontend/
    └── index.html   ← entire frontend in one file
```

---

## Sample Data (auto-loaded)

The app seeds 8 sample Indian students across departments on startup.

---
