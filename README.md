README IN PROGRESS
Muszę jeszcze dodać demo itd.


# 1 Docker ✅
3.0 obraz ubuntu z Pythonem w wersji 3.10 ✅
3.5 obraz ubuntu:24.02 z Javą w wersji 8 oraz Kotlinem ✅
4.0 do powyższego należy dodać najnowszego Gradle’a oraz paczkę JDBC 
SQLite w ramach projektu na Gradle (build.gradle) ✅
4.5 stworzyć przykład typu HelloWorld oraz uruchomienie aplikacji
przez CMD oraz gradle ✅
5.0 dodać konfigurację docker-compose ✅

📦 Kod: folder 1/

# 2: TODO

📦 Kod: folder 2/

# ✅ Zadanie 3 – Ktor + Discord Bot (Kotlin)

✅ 3.0 Aplikacja kliencka w Kotlinie z frameworkiem Ktor
👉 Link do commita 1
📁 Plik: src/main/kotlin/com/example/bot/App.kt

✅ 3.5 Bot nasłuchuje i odbiera wiadomości z Discorda (Kord)
👉 Link do commita 2
📁 Plik: src/main/kotlin/com/example/bot/DiscordBot.kt

✅ 4.0 Komenda !kategorie zwraca listę kategorii
👉 Link do commita 3
📁 Plik: src/main/kotlin/com/example/bot/DiscordBot.kt

✅ 4.5 Komenda !produkty <kategoria> zwraca listę produktów
👉 Link do commita 4
📁 Plik: src/main/kotlin/com/example/bot/Handlers.kt, DiscordBot.kt

❌ 5.0 Integracja z drugą platformą (Slack, Webex, Messenger)
👉 Brak 

📦 Kod: folder 3/




# ✅ Zadanie 4 – Echo + GORM (Go)

✅ 3.0 Aplikacja we frameworku Echo w Go + kontroler Produktów z CRUD
👉 Link do commita 1
📁 Plik: main.go

✅ 3.5 Model Produktów z GORM + obsługa przez kontroler
👉 Link do commita 2
📁 Plik: main.go

✅ 4.0 Model Koszyka + endpoint POST
👉 Link do commita 3
📁 Plik: main.go

✅ 4.5 Model Kategorii + relacja z Produktem
👉 Link do commita 4
📁 Plik: main.go

✅ 5.0 Scope'y GORM (filtrowanie produktów po kategorii i cenie)
👉 Link do commita 5
📁 Plik: main.go

📦 Kod: folder 4/


# ✅ Zadanie 5 – Wzorce behawioralne React + Docker

✅ 3.0 Komponenty: Produkty i Płatności + komunikacja z backendem
👉 Link do commita 1
📁 Plik: src/components/Products.tsx, src/components/Payments.tsx

✅ 3.5 Komponent Koszyk + routing React Router
👉 Link do commita 2
📁 Plik: src/components/Cart.tsx, src/App.tsx

✅ 4.0 Przekazywanie danych przez React hooks (useContext)
👉 Link do commita 3
📁 Plik: src/context.tsx, src/App.tsx

✅ 4.5 Docker + Docker Compose (frontend + backend)
👉 Link do commita 4
📁 Plik: Dockerfile, docker-compose.yml

✅ 5.0 Axios + nagłówki CORS w zapytaniach HTTP
👉 Link do commita 5
📁 Plik: src/components/Products.tsx, src/components/Payments.tsx

📦 Kod: folder 5/

# ✅ Zadanie 6 – Testy automatyczne CypressJS
✅ 3.0 20 przypadków testowych
👉 Link do commita 1
📁 Plik: cypress/e2e/todos.cy.js

✅ 3.5 Minimum 50 asercji funkcjonalnych
👉 Link do commita 2
📁 Plik: cypress/e2e/todos.cy.js

✅ 4.0 Testy jednostkowe (50+ asercji)
👉 Link do commita 3
📁 Plik: tests/unit/todoLogic.spec.js

✅ 4.5 Testy API + negatywne scenariusze
👉 Link do commita 4
📁 Plik: cypress/e2e/api/todos_api.cy.js

✅ 5.0 Uruchomienie testów na Browserstack
👉 Link do commita 5
📁 Plik: .env, package.json, browserstack:run

📦 Kod: folder 6/

