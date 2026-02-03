"use client";
"use client";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'next/navigation';
import HomeButton from './HomeButton';
import userEvent from '@testing-library/user-event';

// Mock useRouter
const mockNavigate = vi.fn();
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => mockNavigate,
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

