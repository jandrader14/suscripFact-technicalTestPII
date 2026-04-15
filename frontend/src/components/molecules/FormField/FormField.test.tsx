import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders label and input', () => {
    render(<FormField label="Correo" />);
    expect(screen.getByText('Correo')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('links label to input via htmlFor/id', () => {
    render(<FormField label="Email" id="email" />);
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Email');
    expect(label.closest('label')).toHaveAttribute('for', 'email');
    expect(input).toHaveAttribute('id', 'email');
  });

  it('shows required asterisk when required=true', () => {
    render(<FormField label="Contraseña" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message when error is provided', () => {
    render(<FormField label="Email" error="Formato inválido" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Formato inválido');
  });

  it('marks input as invalid when error is set', () => {
    render(<FormField label="Email" id="email" error="Requerido" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders without error by default', () => {
    render(<FormField label="Nombre" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
