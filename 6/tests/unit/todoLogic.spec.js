const todoLogic = require('../../src/todoLogic');
const { expect } = require('chai');

describe('Logika Todo - testy jednostkowe', () => {
  beforeEach(() => {
    // Czyszczenie listy zadań przed każdym testem
    todoLogic.clearTodos();
  });

  it('Początkowo lista zadań jest pusta', () => {
    const list = todoLogic.getTodos();
    expect(list).to.be.an('array');
    expect(list).to.be.empty;
  });

  it('Powinien dodać nowe zadanie do listy', () => {
    const newTodo = todoLogic.addTodo('Testowe zadanie');
    expect(newTodo).to.exist;
    expect(newTodo.title).to.equal('Testowe zadanie');
    expect(newTodo.completed).to.be.false;
    expect(newTodo).to.have.property('id');
    const list = todoLogic.getTodos();
    expect(list).to.have.lengthOf(1);
    expect(list[0]).to.deep.equal(newTodo);
  });

  it('Nie powinien dodawać zadania z pustym tytułem', () => {
    const result = todoLogic.addTodo('');
    expect(result).to.be.false;
    expect(todoLogic.getTodos()).to.have.lengthOf(0);
  });

  it('Powinien dodawać kolejne zadania z unikalnymi ID', () => {
    const t1 = todoLogic.addTodo('Zadanie A');
    const t2 = todoLogic.addTodo('Zadanie B');
    const t3 = todoLogic.addTodo('Zadanie C');
    const list = todoLogic.getTodos();
    expect(list).to.have.lengthOf(3);
    expect(t1.id).to.be.a('number');
    expect(t2.id).to.be.a('number');
    expect(t3.id).to.be.a('number');
    // Sprawdzenie unikalności i ciągłości identyfikatorów
    expect(t2.id).to.equal(t1.id + 1);
    expect(t3.id).to.equal(t2.id + 1);
    expect(t2.id).to.not.equal(t1.id);
    expect(t3.id).to.not.equal(t1.id);
    expect(t3.id).to.not.equal(t2.id);
    // Sprawdzenie, że wszystkie dodane zadania są w liście i mają właściwe tytuły
    expect(list[0].title).to.equal('Zadanie A');
    expect(list[1].title).to.equal('Zadanie B');
    expect(list[2].title).to.equal('Zadanie C');
    // Wszystkie nowe zadania powinny być nieukończone
    expect(list[0].completed).to.be.false;
    expect(list[1].completed).to.be.false;
    expect(list[2].completed).to.be.false;
  });

  it('Powinien togglować (zmieniać) status ukończenia zadania', () => {
    const todo = todoLogic.addTodo('ABC');
    expect(todo.completed).to.be.false;
    const toggled1 = todoLogic.toggleTodo(todo.id);
    expect(toggled1).to.exist;
    expect(toggled1.id).to.equal(todo.id);
    expect(toggled1.completed).to.be.true;
    expect(toggled1.title).to.equal('ABC');
    const toggled2 = todoLogic.toggleTodo(todo.id);
    expect(toggled2).to.exist;
    expect(toggled2.id).to.equal(todo.id);
    expect(toggled2.completed).to.be.false;
    // Stan w liście powinien odpowiadać (powrót do nieukończonego)
    const list = todoLogic.getTodos();
    expect(list[0].completed).to.be.false;
  });

  it('Nie powinien zmieniać statusu jeśli podano nieistniejące ID', () => {
    const todo = todoLogic.addTodo('Do togglowania');
    const result = todoLogic.toggleTodo(999);
    expect(result).to.be.false;
    // Istniejące zadanie pozostało bez zmian
    expect(todoLogic.getTodos()[0].completed).to.be.false;
  });

  it('Powinien usunąć zadanie o danym ID', () => {
    todoLogic.addTodo('First task');
    const second = todoLogic.addTodo('Second task');
    const removed = todoLogic.removeTodo(1);
    expect(removed).to.exist;
    expect(removed.title).to.equal('First task');
    expect(todoLogic.getTodos()).to.have.lengthOf(1);
    expect(todoLogic.getTodos()[0].title).to.equal('Second task');
    // Ponowna próba usunięcia tego samego (już usuniętego) zadania zwraca false
    const result = todoLogic.removeTodo(1);
    expect(result).to.be.false;
    expect(todoLogic.getTodos()).to.have.lengthOf(1);
  });

  it('Powinien aktualizować tytuł zadania', () => {
    const todo = todoLogic.addTodo('Pierwotny tytuł');
    const updated = todoLogic.updateTodo(todo.id, 'Zmieniony tytuł');
    expect(updated).to.exist;
    expect(updated.title).to.equal('Zmieniony tytuł');
    expect(updated.completed).to.be.false;
    // Wewnętrzna lista też powinna mieć zaktualizowany tytuł
    const list = todoLogic.getTodos();
    expect(list[0].title).to.equal('Zmieniony tytuł');
    expect(list).to.have.lengthOf(1);
  });

  it('Nie powinien aktualizować zadania o nieistniejącym ID', () => {
    todoLogic.addTodo('Exist');
    const result = todoLogic.updateTodo(999, 'NewTitle');
    expect(result).to.be.false;
    // Istniejące zadanie pozostało bez zmian
    expect(todoLogic.getTodos()[0].title).to.equal('Exist');
  });

  it('Nie powinien ustawiać pustego tytułu przy edycji', () => {
    const todo = todoLogic.addTodo('Titl');
    const result = todoLogic.updateTodo(todo.id, '');
    expect(result).to.be.false;
    // Tytuł pozostał niezmieniony
    expect(todoLogic.getTodos()[0].title).to.equal('Titl');
  });
});
