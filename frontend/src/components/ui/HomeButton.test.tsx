import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomeButton from './HomeButton';
import userEvent from '@testing-library/user-event';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('HomeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render home button', () => {
    renderWithRouter(<HomeButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should navigate to home when clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<HomeButton />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should render with custom size', () => {
    renderWithRouter(<HomeButton size="lg" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('lg'); // Adjust based on actual implementation
  });

  it('should have accessible label', () => {
    renderWithRouter(<HomeButton />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Về trang chủ');
  });
});

