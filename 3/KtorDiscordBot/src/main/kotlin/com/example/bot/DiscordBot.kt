package com.example.bot

import dev.kord.core.Kord
import dev.kord.core.event.message.MessageCreateEvent
import dev.kord.core.on

suspend fun startDiscordBot() {
    println("➡️ Próba uruchomienia Discord Bota...")

    val token = System.getenv("DISCORD_TOKEN")
    if (token == null) {
        println("❌ DISCORD_TOKEN nie ustawiony w środowisku!")
        return
    }

    val bot = Kord(token)

    bot.on<MessageCreateEvent> {
        // Ignoruj wiadomości od botów (w tym siebie)
        if (message.author?.isBot == true) return@on

        val content = message.content
        println("📩 Otrzymano wiadomość: $content")

        when {
            content.startsWith("!kategorie") -> {
                message.channel.createMessage("Kategorie: meble, elektronika, odzież")
            }

            content.startsWith("!produkty") -> {
                val parts = content.split(" ")
                val category = parts.getOrNull(1)
                if (category == null) {
                    message.channel.createMessage("⚠️ Podaj kategorię, np. !produkty meble")
                } else {
                    val products = getProductsByCategory(category)
                    message.channel.createMessage("Produkty w kategorii '$category': $products")
                }
            }
        }
    }

    println("✅ Bot zalogowany, nasłuchuje wiadomości...")
    bot.login()
}
