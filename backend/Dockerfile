FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
RUN apk add --no-cache maven
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn package -DskipTests
EXPOSE 8080
CMD ["java", "-jar", "target/student-management-0.0.1-SNAPSHOT.jar"]
