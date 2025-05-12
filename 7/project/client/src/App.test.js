import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders input fields and buttons', () => {
  render(<App />);
  expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  expect(screen.getByText(/register/i)).toBeInTheDocument();
  expect(screen.getByText(/login/i)).toBeInTheDocument();
});

test('can type into input fields', () => {
  render(<App />);
  const usernameInput = screen.getByPlaceholderText(/username/i);
  const passwordInput = screen.getByPlaceholderText(/password/i);

  fireEvent.change(usernameInput, { target: { value: 'jan' } });
  fireEvent.change(passwordInput, { target: { value: 'tajne' } });

  expect(usernameInput.value).toBe('jan');
  expect(passwordInput.value).toBe('tajne');
});
