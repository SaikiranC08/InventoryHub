# Stage 1: Build
FROM gradle:8.14.5-jdk21 AS build

WORKDIR /app

COPY app/ .

RUN gradle clean bootJar -x test --no-daemon

# Stage 2: Run
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 9898

ENTRYPOINT ["java", "-Xms64m", "-Xmx256m","-XX:+UseSerialGC","-jar", "app.jar"]