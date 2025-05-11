const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const logic = require('./src/todoLogic');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints
app.get('/api/todos', (req, res) => {
  res.json(logic.getTodos());
});

app.post('/api/todos', (req, res) => {
  const todo = logic.addTodo(req.body.title);
  if (!todo) return res.status(400).json({ error: 'Invalid title' });
  res.status(201).json(todo);
});

app.get('/api/todos/:id', (req, res) => {
  const todo = logic.getTodos().find(t => t.id == req.params.id);
  if (!todo) return res.status(404).json({ error: 'Not found' });
  res.json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const updated = logic.updateTodo(Number(req.params.id), req.body.title);
  if (!updated) return res.status(404).json({ error: 'Not found or invalid data' });
  updated.completed = req.body.completed ?? updated.completed;
  res.json(updated);
});

app.delete('/api/todos/:id', (req, res) => {
  const removed = logic.removeTodo(Number(req.params.id));
  if (!removed) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

// Endpoint do resetowania danych (tylko na potrzeby testów)
app.delete('/api/test/reset', (req, res) => {
  logic.clearTodos();
  res.status(204).send();
});


app.listen(port, () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});
