const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// === 🔸 Inicjalizacja bazy danych SQLite ===
const db = new Database('users.db');

// 🔸 Tworzenie tabeli jeśli nie istnieje
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`).run();

// === 🔹 Endpointy ===

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  try {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, password);
    res.status(201).json({ message: 'Registered' });
  } catch (err) {
    res.status(400).json({ message: 'User already exists' });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
                 .get(username, password);
  if (user) {
    res.json({ message: 'Login success', user: { username: user.username } });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
