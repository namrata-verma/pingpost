<p align="center">
  <img src="pingpost-frontend/src/main/client/src/assets/pingpost-logo.jpg" width="200">
</p>
<p align="center">
    <h1 align="center">PingPost</h1>
</p>

<p align="center">    
    <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/Material_UI-007FFF.svg?style=flat&logo=mui&logoColor=white" alt="Material UI">
    <img src="https://img.shields.io/badge/React_Router-CA4245.svg?style=flat&logo=react-router&logoColor=white" alt="React Router">
    <img src="https://img.shields.io/badge/Axios-5A29E4.svg?style=flat&logo=Axios&logoColor=white" alt="Axios">
    <br> 
    <img src="https://img.shields.io/badge/Java-ED8B00.svg?style=flat&logo=openjdk&logoColor=black" alt="Java">
    <img src="https://img.shields.io/badge/Spring_Boot-6DB33F.svg?style=flat&logo=spring-boot&logoColor=white" alt="Spring Boot">
    <img src="https://img.shields.io/badge/JPA-Hibernate-59666C.svg?style=flat&logo=hibernate&logoColor=white" alt="JPA-Hibernate">
    <img src="https://img.shields.io/badge/JWT-3BBAF1.svg?style=flat&logo=jsonwebtokens&logoColor=white" alt="JWT">
    <img src="https://img.shields.io/badge/MariaDB-003545?style=flat&logo=mariadb&logoColor=white" alt="MariaDB">
    <br>   
    <img src="https://img.shields.io/badge/Docker-2496ED.svg?style=flat&logo=Docker&logoColor=white" alt="Docker">
    <img src="https://img.shields.io/badge/Git-F05032.svg?style=flat&logo=git&logoColor=white" alt="Git">
    <img src="https://img.shields.io/badge/JUnit-25A162.svg?style=flat&logo=junit5&logoColor=white" alt="JUnit">
</p>

<br>

## Table of Contents

- [📕 Overview](#-overview)
- [⭐ Features](#-features)
- [🧩 Architecture](#-architecture)
- [🚀 Getting Started](#-getting-started)
  - [⚙️ Running App Locally](#️-running-app-locally)
  - [📖 Usage](#-usage)
  - [📘 Swagger UI](#-swagger-ui)
  - [🧪 Tests](#-tests)
- [📱 Mobile Responsiveness](#-mobile-responsiveness)

<hr>

## 📕 Overview

PingPost is a modern, responsive social media blogging application built with React and Spring Boot. It provides a complete blogging platform with social features like likes, comments, user following, and hashtag support.

---

## ⭐ Features

### User & Authentication
- **JWT Authentication**: Secure user registration and login with JWT tokens
- **Password Security**: BCrypt password hashing for enhanced security
- **Profile Management**: Edit profile information (name, bio, profile picture)
- **User Following**: Follow/unfollow users with follower/following counts
- **Public Profiles**: View other users' public profiles and blogs

### Blogging System
- **Create & Edit**: Create, edit, and delete blogs (author-only permissions)
- **Rich Content**: Support for images, hashtags, and formatted text
- **Auto Hashtag Extraction**: Automatically extracts hashtags from blog content
- **Hashtag Search**: Search blogs by hashtag with real-time suggestions
- **Pagination**: Efficient pagination for large blog collections
- **Sorting**: Blogs sorted by latest update date

### Social Features
- **Like System**: Like/unlike blogs (users cannot like their own posts)
- **Comments**: Add, edit, and delete comments on blogs
- **Real-time Counts**: Live like and comment counts on blog cards
- **User Activity**: View your liked blogs and comments in profile

### Search & Discovery
- **Live Search**: Real-time search for users and hashtags in navbar
- **Grouped Results**: Search results grouped by users and hashtags
- **Clickable Results**: Direct navigation from search results
- **Hashtag Navigation**: Click hashtags to discover related content

### UI/UX Features
- **Responsive Design**: Mobile-first responsive layout
- **Material UI**: Modern, consistent design system
- **Interactive Cards**: Hover effects and smooth transitions
- **Loading States**: Proper loading indicators throughout the app
- **Error Handling**: User-friendly error messages and fallbacks
- **Accessibility**: Keyboard navigation and screen reader support

### Backend & API
- **RESTful API**: Clean, well-structured REST endpoints
- **DTO Pattern**: Data Transfer Objects for all API responses
- **Spring Security**: Comprehensive security with JWT authentication
- **Database**: MariaDB with JPA/Hibernate ORM
- **API Documentation**: Swagger/OpenAPI documentation
- **Logging**: Comprehensive logging for debugging

### Testing & Quality
- **Backend Testing**: JUnit tests with H2 in-memory database
- **Service Layer Tests**: Unit tests for business logic
- **Controller Tests**: Integration tests for API endpoints
- **Frontend Linting**: ESLint for code quality
- **TypeScript**: Type safety for better development experience

---

## 🧩 Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Context API for authentication
- **Routing**: React Router v7
- **HTTP Client**: Axios for API communication
- **Build Tool**: Vite for fast development and building
- **Styling**: Emotion for styled components

### Backend Architecture
- **Framework**: Spring Boot 3.3.1
- **Language**: Java 21
- **Database**: MariaDB with JPA/Hibernate
- **Security**: Spring Security with JWT
- **Documentation**: SpringDoc OpenAPI
- **Build Tool**: Maven

### Database Design
- **Users**: User profiles, authentication, following relationships
- **Blogs**: Blog posts with content, images, and metadata
- **Comments**: User comments on blogs
- **Likes**: User likes on blogs
- **Hashtags**: Extracted from blog content

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.17.x or later`
- **npm or yarn**: Package manager
- **Java**: `JDK 21 or later`
- **MariaDB**: `latest` (or use Docker)
- **Docker**: For database containerization
- **Git**: Version control

### ⚙️ Running App Locally

#### 1. Clone the Repository
```bash
git clone https://gitlab.oth-regensburg.de/ven46979/ics-wtp-pingpost.git
cd ics-wtp-pingpost
```

#### 2. Setup Database with Docker
```bash
cd pingpostBackend
docker-compose up -d
```

#### 3. Start Backend Server
```bash
cd pingpostBackend
./mvnw clean install
./mvnw spring-boot:run
```
The backend will be available at `http://localhost:8080`

#### 4. Start Frontend Development Server
```bash
cd pingpost-frontend/src/main/client
npm install
npm run dev
```
The frontend will be available at `http://localhost:3000`

### 📖 Usage

1. **Register/Login**: Create an account or sign in
2. **Create Blogs**: Write and publish blog posts with images and hashtags
3. **Discover Content**: Browse blogs, search by hashtags, and follow users
4. **Interact**: Like and comment on blogs, follow other users
5. **Manage Profile**: Edit your profile and view your activity

### 📘 Swagger UI

Access the interactive API documentation at:
```
http://localhost:8080/swagger-ui/index.html
```

### 🧪 Tests

#### Backend Tests
```bash
cd pingpostBackend
./mvnw test
```

#### Frontend Linting
```bash
cd pingpost-frontend/src/main/client
npm run lint
```

---

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for mobile devices:

- **Mobile-First Design**: Responsive layout that works on all screen sizes
- **Touch-Friendly**: Optimized touch targets and navigation
- **Adaptive Navigation**: Collapsible navbar with hamburger menu on mobile
- **Flexible Grid**: Blog cards adapt to screen size
- **Optimized Forms**: Mobile-friendly input fields and buttons

---

<p align="right">
  <a href="#-overview"><b>Return to Top</b></a>
</p>
