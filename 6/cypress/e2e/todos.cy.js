describe('Lista zadań - działająca wersja testów', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.request('DELETE', '/api/test/reset');
    });
  
    it('Powinien wyświetlić pustą listę zadań początkowo', () => {
      cy.get('.todo-list li').should('have.length', 0);
    });
  
    it('Powinien dodać nowe zadanie do listy', () => {
      cy.get('.new-todo').type('Zadanie 1{enter}');
      cy.get('.todo-list li').should('have.length', 1);
      cy.get('.todo-list li').first().contains('Zadanie 1');
    });
  
    it('Powinien dodać wiele zadań i wyświetlić je wszystkie', () => {
      cy.get('.new-todo').type('A{enter}');
      cy.get('.new-todo').type('B{enter}');
      cy.get('.new-todo').type('C{enter}');
      cy.get('.todo-list li').should('have.length', 3);
    });
  
    it('Powinien oznaczyć zadanie jako ukończone', () => {
      cy.get('.new-todo').type('Do zrobienia{enter}');
      cy.get('.todo-list li').first().find('.toggle').check();
      cy.get('.todo-list li').first().should('have.class', 'completed');
    });
  
    it('Powinien odznaczyć zadanie (nieukończone)', () => {
      cy.get('.new-todo').type('Zadanie 2{enter}');
      cy.get('.todo-list li').first().find('.toggle').check()
        cy.get('.todo-list li').first().find('.toggle').uncheck();
      cy.get('.todo-list li').first().should('not.have.class', 'completed');
    });
  
    it('Powinien usunąć zadanie z listy', () => {
      cy.get('.new-todo').type('Usuń mnie{enter}');
      cy.get('.todo-list li').should('have.length', 1);
      cy.get('.todo-list li').first().find('.destroy').click();
      cy.get('.todo-list li').should('have.length', 0);
    });
  
    it('Nie powinien dodać pustego zadania', () => {
      cy.get('.new-todo').type('{enter}');
      cy.get('.todo-list li').should('have.length', 0);
    });
  
    it('Powinien wyczyścić input po dodaniu zadania', () => {
      cy.get('.new-todo').type('Testowe zadanie{enter}');
      cy.get('.new-todo').should('have.value', '');
    });
  
    it('Powinien zachować ukończenie zadania po odświeżeniu strony', () => {
      cy.get('.new-todo').type('Zapamiętaj mnie{enter}');
      cy.get('.todo-list li').first().find('.toggle').check();
      cy.reload();
      cy.get('.todo-list li').first().should('have.class', 'completed');
    });
  
    it('Powinien zachować zadania po odświeżeniu strony', () => {
      cy.get('.new-todo').type('A{enter}');
      cy.get('.new-todo').type('B{enter}');
      cy.reload();
      cy.get('.todo-list li').should('have.length', 2);
    });
  });
  