import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from './Label';

describe('Label', () => {
  it('renders children text', () => {
    render(<Label>Correo electrónico</Label>);
    expect(screen.getByText('Correo electrónico')).toBeInTheDocument();
  });

  it('shows required asterisk when required=true', () => {
    render(<Label required>Contraseña</Label>);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not show asterisk when required=false', () => {
    render(<Label>Nombre</Label>);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('forwards htmlFor to the label element', () => {
    render(<Label htmlFor="email-input">Email</Label>);
    expect(screen.getByText('Email').closest('label')).toHaveAttribute('for', 'email-input');
  });

  it('merges custom className', () => {
    render(<Label className="extra-class">Label</Label>);
    expect(screen.getByText('Label').closest('label')).toHaveClass('extra-class');
  });
});
