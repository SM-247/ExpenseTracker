# Stage 1: Build the Spring Boot application

FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy project files

COPY pom.xml .
COPY src ./src

# Build the executable JAR

RUN mvn -B -DskipTests clean package

# Stage 2: Run the application

FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the generated JAR from the build stage

COPY --from=build /app/target/expense_tracker-0.0.1-SNAPSHOT.jar app.jar

# Expose Spring Boot port

EXPOSE 8080

# Start the application

ENTRYPOINT ["java", "-jar", "app.jar"]
