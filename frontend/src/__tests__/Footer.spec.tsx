// src/__tests__/Footer.spec.tsx

import { render, screen } from '@testing-library/react';
import Footer from '../components/Layout/Footer';
import { BrowserRouter } from 'react-router-dom';

describe('Footer', () => {
  it('renders "About Us" and "How to?" links with correct destinations', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const aboutLink = screen.getByRole('link', { name: /about us/i });
    const howToLink = screen.getByRole('link', { name: /how to/i });

    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute('href', '/about');

    expect(howToLink).toBeInTheDocument();
    expect(howToLink).toHaveAttribute('href', '/instructions');
  });
});
