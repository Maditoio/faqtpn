import React from 'react';
import { render } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render loading spinner', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with default medium size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('should have spinning animation class', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should render with circular border', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('rounded-full');
  });

  it('should have border styling', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('border-blue-600');
  });

  it('should render wrapper with flex layout', () => {
    const { container } = render(<LoadingSpinner />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
  });
});
