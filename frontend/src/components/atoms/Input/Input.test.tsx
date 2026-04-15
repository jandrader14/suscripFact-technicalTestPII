import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Escribe aquí" />);
    expect(screen.getByPlaceholderText('Escribe aquí')).toBeInTheDocument();
  });

  it('renders error message when error prop is provided', () => {
    render(<Input id="email" error="Campo requerido" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Campo requerido');
  });

  it('marks input as invalid when error is set', () => {
    render(<Input id="email" error="Campo requerido" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not render error message when no error', () => {
    render(<Input id="email" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('links error message to input via aria-describedby', () => {
    render(<Input id="email" error="Inválido" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('calls onChange on user input', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hola' } });
    expect(handleChange).toHaveBeenCalledOnce();
  });

  it('merges custom className', () => {
    render(<Input className="w-full" />);
    expect(screen.getByRole('textbox')).toHaveClass('w-full');
  });
});
