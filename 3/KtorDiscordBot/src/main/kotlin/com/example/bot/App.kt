package com.example.bot

import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.plugins.contentnegotiation.*
import kotlinx.coroutines.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

fun main() {
    val scope = CoroutineScope(Dispatchers.Default)

    scope.launch {
        startDiscordBot()
    }

    embeddedServer(Netty, port = 8080, module = Application::module).start(wait = true)
}


fun Application.module() {
    install(ContentNegotiation) {
        json(Json { prettyPrint = true })
    }

    routing {
        get("/") {
            call.respondText("Bot działa!")
        }
    }
}
