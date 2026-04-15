import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with accessible role and label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: /cargando/i })).toBeInTheDocument();
  });

  it('applies sm size classes', () => {
    render(<Spinner size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4');
  });

  it('applies lg size classes', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8');
  });

  it('merges custom className', () => {
    render(<Spinner className="my-custom" />);
    expect(screen.getByRole('status')).toHaveClass('my-custom');
  });
});
