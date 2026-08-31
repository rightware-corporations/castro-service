FROM maven:3.9.11-eclipse-temurin-26 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src src
RUN mvn -B -q package -DskipTests
FROM eclipse-temurin:26-jre
RUN useradd --system --create-home appuser
WORKDIR /app
COPY --from=build /workspace/target/castros-service-0.1.0-SNAPSHOT.jar app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
