describe('API Todo - testy endpointów', () => {
    let createdId;
    
    
  
    it('GET /api/todos powinien zwrócić pustą listę (brak zadań)', () => {
        cy.request('DELETE', '/api/test/reset'); // Resetujemy dane przed testem
      cy.request('GET', '/api/todos').then((response) => {
        expect(response.status).to.equal(200);
        // Oczekujemy, że zwrócona zostanie tablica (początkowo pusta)
        expect(response.body).to.be.an('array').that.is.empty;
      });
    });
  
    it('POST /api/todos powinien utworzyć nowe zadanie', () => {
      cy.request('POST', '/api/todos', { title: 'Nowe zadanie' }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.include({ title: 'Nowe zadanie', completed: false });
        // Zachowujemy utworzone id do dalszych testów
        createdId = response.body.id;
      });
    });
  
    it('GET /api/todos/{id} powinien zwrócić dane konkretnego zadania', () => {
      // Używamy id utworzonego powyżej zadania
      cy.request('GET', `/api/todos/${createdId}`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', createdId);
        expect(response.body.title).to.equal('Nowe zadanie');
        expect(response.body.completed).to.be.false;
      });
    });
  
    it('PUT /api/todos/{id} powinien zaktualizować istniejące zadanie', () => {
      cy.request('PUT', `/api/todos/${createdId}`, { title: 'Zaktualizowane zadanie', completed: true }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('id', createdId);
        expect(response.body.title).to.equal('Zaktualizowane zadanie');
        expect(response.body.completed).to.be.true;
      });
    });
  
    it('DELETE /api/todos/{id} powinien usunąć zadanie', () => {
      cy.request('DELETE', `/api/todos/${createdId}`).then((response) => {
        // Możliwe statusy: 200 (OK) lub 204 (No Content) w zależności od implementacji
        expect([200, 204]).to.include(response.status);
      });
    });
  
    // Scenariusze negatywne:
  
    it('POST /api/todos - brak tytułu powinien zwrócić błąd 400', () => {
      cy.request({ method: 'POST', url: '/api/todos', body: {}, failOnStatusCode: false }).then((response) => {
        expect(response.status).to.equal(400);
        // Zakładamy, że API zwraca pole "error" z informacją o błędzie
        expect(response.body).to.have.property('error');
      });
    });
  
    it('PUT /api/todos/{id} - nieistniejące ID powinno zwrócić 404', () => {
      cy.request({ method: 'PUT', url: '/api/todos/9999', body: { title: 'x' }, failOnStatusCode: false }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });
  
    it('DELETE /api/todos/{id} - nieistniejące ID powinno zwrócić 404', () => {
      cy.request({ method: 'DELETE', url: '/api/todos/9999', failOnStatusCode: false }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });
  
    it('GET /api/todos/{id} - nieistniejące ID powinno zwrócić 404', () => {
      cy.request({ method: 'GET', url: '/api/todos/9999', failOnStatusCode: false }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });
  });
  