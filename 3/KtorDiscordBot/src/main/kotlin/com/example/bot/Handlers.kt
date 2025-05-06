package com.example.bot

fun getProductsByCategory(category: String): String {
    return when (category.lowercase()) {
        "meble" -> "Stół, Krzesło, Szafa"
        "elektronika" -> "Laptop, Smartfon, Słuchawki"
        "odzież" -> "Koszulka, Spodnie, Kurtka"
        else -> "Brak produktów w tej kategorii"
    }
}
