FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean bootJar -x test

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/app/build/libs/app.jar app.jar
EXPOSE 9898
ENTRYPOINT ["java", "-jar", "app.jar"]