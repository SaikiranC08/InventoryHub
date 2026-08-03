# Stage 1: Build
FROM gradle:8.14.5-jdk21 AS build

WORKDIR /app

COPY . .

RUN gradle clean bootJar -x test

# Stage 2: Run
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]