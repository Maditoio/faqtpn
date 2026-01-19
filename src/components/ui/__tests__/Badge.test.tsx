import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  it('should render badge with text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('should render with success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('should render with warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('should render with info variant', () => {
    render(<Badge variant="info">Info</Badge>);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('should display status text correctly', () => {
    render(<Badge variant="success">APPROVED</Badge>);
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('should display PENDING status correctly', () => {
    render(<Badge variant="warning">PENDING</Badge>);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('should display SUSPENDED status correctly', () => {
    render(<Badge variant="error">SUSPENDED</Badge>);
    expect(screen.getByText('SUSPENDED')).toBeInTheDocument();
  });

  it('should handle different text content', () => {
    render(<Badge>Custom Text</Badge>);
    const badge = screen.getByText('Custom Text');
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe('SPAN');
  });
});
