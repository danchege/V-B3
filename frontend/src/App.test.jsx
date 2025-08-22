import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // This is a simple test that just checks if the app renders
    // You can add more specific tests as needed
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
