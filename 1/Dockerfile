FROM ubuntu:24.04

# Install dependencies
RUN apt-get update && \
    apt-get install -y openjdk-8-jdk curl unzip zip && \
    apt-get clean

# Install SDKMAN, Kotlin, and Gradle in a single RUN layer
RUN curl -s "https://get.sdkman.io" | bash && \
    bash -c ". /root/.sdkman/bin/sdkman-init.sh && sdk install kotlin && sdk install gradle"

# Set JAVA_HOME and update PATH
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
ENV PATH=$PATH:/root/.sdkman/candidates/kotlin/current/bin:/root/.sdkman/candidates/gradle/current/bin

# Create project directory
WORKDIR /app

# Copy build.gradle into the project directory
COPY build.gradle .

# Verify installations
CMD ["bash", "-c", "java -version && kotlin -version && gradle -version"]