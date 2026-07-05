


### 🏷️ Project Title

```
🔐 Auth_Service
```

---

### 💬 Description

```
A secure and lightweight Spring Boot Authentication Service built using Java and Gradle.  
Handles user registration, login, and token-based authentication with best practices in structure and scalability.

```



---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Endpoints (optional)](#api-endpoints-optional)
- [Acknowledgements](#acknowledgements)

---
### 🧠 Overview

```
Auth Service is a modular authentication backend built using Spring Boot and Gradle.  
It provides user authentication, authorization, and security mechanisms such as JWT-based login, role management, and password encryption.

This project is ideal for integrating into larger systems as a microservice or learning authentication principles in Java.
```

---
### ✨ Features

```
- ✅ User registration & login APIs  
- 🔑 JWT-based authentication  
- 🔒 Password encryption using BCrypt  
- 🧩 Modular Gradle structure (`app/` subproject)  
- 🧰 Easy local setup using Gradle Wrapper  


```
### 🚀 Getting Started

````
1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/Auth_Service.git
cd Auth_Service
````


#### 2️⃣ Verify prerequisites

* Java JDK 11+
* Git
* (Optional) Postman for testing API endpoints



### ⚙️ Build & Run



```bash
./gradlew build
````

#### ▶️ Run using Spring Boot

```bash
./gradlew :app:bootRun
```

or build the JAR manually:

```bash
./gradlew :app:bootJar
java -jar app/build/libs/*-boot.jar
```




Configuration is stored in:

```
app/src/main/resources/application.properties
```

Example (update based on your setup):

```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/authdb
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
jwt.secret=your-secret-key
jwt.expiration=86400000
```




```
 🧰 Tech Stack :

Language: Java (>= 11)  
Framework: Spring Boot  
Build Tool: Gradle (Wrapper included)  
Database: H2 / MySQL (configurable)  
Authentication: Spring Security, JWT  
```

🔗 API Endpoints 
```
POST /auth/v1/signup — Register a new user.
POST /auth/v1/login — Login and receive a JWT token.
POST /auth/v1/refreshToken — Generate a new access token using a valid refresh token.
```


🙏 Acknowledgements
```

* Tutorial followed on YouTube
* Spring Boot & Gradle official docs
* Community contributors
