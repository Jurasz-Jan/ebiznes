plugins {
    kotlin("jvm") version "1.9.10"
    application
}

group = "com.example"
version = "1.0"

application {
    mainClass.set("com.example.bot.AppKt")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("dev.kord:kord-core:0.10.0")
    implementation("io.ktor:ktor-server-core:2.3.2")
    implementation("io.ktor:ktor-server-netty:2.3.2")
    implementation("io.ktor:ktor-server-content-negotiation:2.3.2")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.2")
    implementation("ch.qos.logback:logback-classic:1.4.5")
}
