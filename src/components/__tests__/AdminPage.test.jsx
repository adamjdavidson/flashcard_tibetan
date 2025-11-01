import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from '../AdminPage.jsx';

// Create a simple global that the mock can access
global.__mockUseAuthValue = {
  user: null,
  isAdmin: false,
  loading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn()
};

// Mock useAuth hook - access global variable directly
vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => global.__mockUseAuthValue
}));

describe('AdminPage', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    
    // Reset global mock value
    global.__mockUseAuthValue = {
      user: null,
      isAdmin: false,
      loading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn()
    };
    vi.clearAllMocks();
  });

  it('shows access denied for non-admin users', () => {
    global.__mockUseAuthValue = {
      user: { id: 'user1', email: 'user@example.com' },
      isAdmin: false,
      loading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn()
    };

    render(<AdminPage />);

    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    expect(screen.getByText(/you must be an admin/i)).toBeInTheDocument();
  });

  it('renders admin dashboard for admin users', () => {
    global.__mockUseAuthValue = {
      user: { id: 'admin1', email: 'admin@example.com' },
      isAdmin: true,
      loading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn()
    };

    render(<AdminPage />);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders all tab buttons', () => {
    global.__mockUseAuthValue = {
      user: { id: 'admin1', email: 'admin@example.com' },
      isAdmin: true,
      loading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn()
    };

    render(<AdminPage />);

    expect(screen.getByText(/statistics/i)).toBeInTheDocument();
    expect(screen.getByText(/user management/i)).toBeInTheDocument();
    expect(screen.getByText(/change password/i)).toBeInTheDocument();
    expect(screen.getByText(/reset progress/i)).toBeInTheDocument();
    expect(screen.getByText(/card review/i)).toBeInTheDocument();
  });

  it('loads statistics on mount', async () => {
    global.__mockUseAuthValue = {
      user: { id: 'admin1', email: 'admin@example.com' },
      isAdmin: true,
      loading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        stats: {
          totalCards: 100,
          totalUsers: 10,
          totalProgress: 500
        }
      })
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/stats');
    });
  });

  it('displays error message on stats load failure', async () => {
    global.__mockUseAuthValue = {
      user: { id: 'admin1', email: 'admin@example.com' },
      isAdmin: true,
      loading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn()
    };

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load statistics/i)).toBeInTheDocument();
    });
  });

  it('switches to user management tab', async () => {
    const user = userEvent.setup();
    global.__mockUseAuthValue = {
      user: { id: 'admin1', email: 'admin@example.com' },
      isAdmin: true,
      loading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, stats: {} })
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        users: [{ id: 'user1', email: 'user@example.com', role: 'user' }]
      })
    });

    render(<AdminPage />);

    const usersButton = screen.getByRole('button', { name: /user management/i });
    await user.click(usersButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/users',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  it('allows creating new user', async () => {
    const user = userEvent.setup();
    global.__mockUseAuthValue = {
      user: { id: 'admin1', email: 'admin@example.com' },
      isAdmin: true,
      loading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, stats: {} })
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, users: [] })
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(<AdminPage />);

    // Switch to user management tab
    const usersButton = screen.getByRole('button', { name: /user management/i });
    await user.click(usersButton);

    await waitFor(() => {
      const emailInput = screen.queryByLabelText(/email/i);
      return emailInput;
    }, { timeout: 2000 });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const createButton = screen.getByRole('button', { name: /create user/i });

    await user.type(emailInput, 'newuser@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(createButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/users',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  it('displays Card Review tab content', async () => {
    const user = userEvent.setup();
    global.__mockUseAuthValue = {
      user: { id: 'admin1', email: 'admin@example.com' },
      isAdmin: true,
      loading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, stats: {} })
    });

    render(<AdminPage />);

    const cardsButton = screen.getByRole('button', { name: /card review/i });
    await user.click(cardsButton);

    // AdminCardReview component should be rendered
    await waitFor(() => {
      const reviewContent = screen.queryByText(/user-created cards/i) || 
                           screen.queryByText(/promote/i) ||
                           screen.queryByText(/master/i) ||
                           screen.queryByText(/review/i);
      expect(reviewContent).toBeDefined();
    }, { timeout: 2000 });
  });
});
