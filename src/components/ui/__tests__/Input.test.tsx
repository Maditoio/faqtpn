import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input Component', () => {
  it('should render input field', () => {
    render(<Input label="Test Input" />);
    expect(screen.getByText('Test Input')).toBeInTheDocument();
  });

  it('should handle text input', async () => {
    const user = userEvent.setup();
    render(<Input label="Test Input" />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('should display error message', () => {
    render(<Input label="Test Input" error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should apply error styles when error exists', () => {
    render(<Input label="Test Input" error="Error message" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input label="Test Input" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should be required when required prop is true', () => {
    render(<Input label="Test Input" required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('should display placeholder', () => {
    render(<Input label="Test Input" placeholder="Enter text here" />);
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
  });

  it('should call onChange handler', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Input label="Test Input" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should handle email type', () => {
    render(<Input label="Email" type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should render label text', () => {
    render(<Input label="Username" />);
    const label = screen.getByText('Username');
    expect(label.tagName).toBe('LABEL');
  });
});
