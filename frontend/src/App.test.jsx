import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './pages/Home';

describe('App', () => {
  it('renders home page without crashing', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    // Check if the main heading renders
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText(/Find Your V!B3/i)).toBeInTheDocument();
  });
});
