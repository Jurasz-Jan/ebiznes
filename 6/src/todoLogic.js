let todos = [];
let nextId = 1;

/**
 * Dodaje nowe zadanie do listy.
 * Zwraca obiekt dodanego zadania lub false, jeśli nie dodano (np. pusty tytuł).
 */
function addTodo(title) {
  if (!title || title.trim() === '') {
    return false;
  }
  const todo = {
    id: nextId++,
    title: title,
    completed: false
  };
  todos.push(todo);
  return todo;
}

/**
 * Zwraca listę wszystkich zadań.
 */
function getTodos() {
  return todos;
}

/**
 * Oznacza zadanie (po id) jako ukończone/nieukończone (toggluje flagę completed).
 * Zwraca zaktualizowany obiekt zadania lub false, jeśli nie znaleziono.
 */
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return false;
  todo.completed = !todo.completed;
  return todo;
}

/**
 * Aktualizuje tytuł zadania o podanym id. Zwraca zaktualizowany obiekt lub false w razie błędu.
 */
function updateTodo(id, newTitle) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return false;
  if (!newTitle || newTitle.trim() === '') {
    return false;
  }
  todo.title = newTitle;
  return todo;
}

/**
 * Usuwa zadanie o podanym id z listy.
 * Zwraca obiekt usuniętego zadania lub false, jeśli nie znaleziono takiego id.
 */
function removeTodo(id) {
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return false;
  const removed = todos.splice(index, 1)[0];
  return removed;
}

/**
 * Usuwa wszystkie zadania (np. do wykorzystania w testach).
 */
function clearTodos() {
  todos = [];
  nextId = 1;
}

module.exports = { addTodo, getTodos, toggleTodo, updateTodo, removeTodo, clearTodos };
