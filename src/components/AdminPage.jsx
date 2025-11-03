import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import AdminCardReview from './AdminCardReview.jsx';
import AdminThemeManager from './AdminThemeManager.jsx';
import AdminCardTable from './AdminCardTable.jsx';
import AdminCardModal from './AdminCardModal.jsx';
import AdminClassificationManager from './AdminClassificationManager.jsx';
import CardManager from './CardManager.jsx';
import QuickTranslateForm from './QuickTranslateForm.jsx';
import CardPreviewModal from './CardPreviewModal.jsx';
import { ErrorBoundary } from '../ErrorBoundary.jsx';
import { loadCards, saveCard, saveCards, deleteCard } from '../services/cardsService.js';
import { loadCategories } from '../services/categoriesService.js';
import { loadInstructionLevels } from '../services/instructionLevelsService.js';
import './AdminPage.css';

/**
 * AdminPage component
 * Provides admin functionality: user management, password changes, progress reset, stats
 */
export default function AdminPage() {
  const { user, isAdmin: isAdminUser } = useAuth();
  
  // All hooks must be called before any conditional returns
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Stats state
  const [stats, setStats] = useState(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Forms state
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });
  const [passwordForm, setPasswordForm] = useState({ userId: '', newPassword: '', confirmPassword: '' });

  // Card Management state
  const [cards, setCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingCard, setEditingCard] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterInstructionLevel, setFilterInstructionLevel] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [categories, setCategories] = useState([]);
  const [previewCard, setPreviewCard] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [instructionLevels, setInstructionLevels] = useState([]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Load system statistics
  const loadStats = async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await fetch('/api/admin/stats');
      
      // Check if response is ok and is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load stats');
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  // Load all users
  const loadUsers = async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });
      
      // Check if response is ok and is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Failed to load users');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (!newUser.email || !newUser.password) {
      setError('Email and password required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          email: newUser.email,
          password: newUser.password,
          role: newUser.role
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`User ${newUser.email} created successfully`);
        setNewUser({ email: '', password: '', role: 'user' });
        loadUsers();
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Failed to create user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (userId, updates) => {
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          userId,
          ...updates
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('User updated successfully');
        loadUsers();
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, email) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This will also delete all their progress.`)) {
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          userId
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`User ${email} deleted successfully`);
        loadUsers();
      } else {
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (!passwordForm.userId || !passwordForm.newPassword) {
      setError('User and new password required');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: passwordForm.userId,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Password changed successfully');
        setPasswordForm({ userId: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset SM-2 progress
  const handleResetProgress = async (userId = null) => {
    const message = userId 
      ? `Reset SM-2 progress for this user? This cannot be undone.`
      : `Reset SM-2 progress for ALL users? This cannot be undone.`;
    
    if (!confirm(message)) {
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/admin/reset-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          confirm: true
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(userId ? 'Progress reset for user' : 'Progress reset for all users');
      } else {
        setError(data.error || 'Failed to reset progress');
      }
    } catch (err) {
      setError('Failed to reset progress');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle admin role
  const handleToggleAdmin = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? null : 'admin';
    await handleUpdateUser(userId, { role: newRole });
  };

  // Load cards for Card Management tab
  const loadCardsData = async () => {
    setCardsLoading(true);
    clearMessages();
    try {
      const loadedCards = await loadCards(() => [], user?.id, isAdminUser);
      setCards(loadedCards || []);
    } catch (err) {
      console.error('Error loading cards:', err);
      setError('Failed to load cards: ' + err.message);
    } finally {
      setCardsLoading(false);
    }
  };

  // Load categories for filtering
  const loadCategoriesData = async () => {
    try {
      const data = await loadCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      // Don't set error - filter will just be empty
    }
  };

  // Load instruction levels for filtering
  const loadInstructionLevelsData = async () => {
    try {
      const data = await loadInstructionLevels();
      setInstructionLevels(data || []);
    } catch (err) {
      console.error('Error loading instruction levels:', err);
      // Don't set error - filter will just be empty
    }
  };

  // Handle add card
  const handleAddCard = () => {
    setModalMode('add');
    setEditingCard(null);
    setModalOpen(true);
  };

  // Handle edit card
  const handleEditCard = (card) => {
    setModalMode('edit');
    setEditingCard(card);
    setModalOpen(true);
  };

  // Handle preview card
  const handlePreviewCard = (card) => {
    setPreviewCard(card);
    setIsPreviewOpen(true);
  };

  // Handle close preview
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewCard(null);
  };

  // Handle save card (add or edit)
  const handleSaveCard = async (card) => {
    setLoading(true);
    clearMessages();
    try {
      const result = await saveCard(card, () => {});
      if (result.success) {
        setSuccess(modalMode === 'add' ? 'Card added successfully' : 'Card updated successfully');
        setModalOpen(false);
        setEditingCard(null);
        await loadCardsData();
        // Reload categories and instruction levels in case new ones were created
        await Promise.all([loadCategoriesData(), loadInstructionLevelsData()]);
      } else {
        setError(result.error || 'Failed to save card');
      }
    } catch (err) {
      console.error('Error saving card:', err);
      setError('Failed to save card: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle add cards (batch from QuickTranslateForm)
  const handleAddCards = async (newCards) => {
    setLoading(true);
    clearMessages();
    try {
      const result = await saveCards(newCards, () => {});
      if (result.success) {
        setSuccess(`${newCards.length} card(s) added successfully`);
        await loadCardsData();
      } else {
        setError(result.error || 'Failed to add cards');
      }
    } catch (err) {
      console.error('Error adding cards:', err);
      setError('Failed to add cards: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete card
  const handleDeleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    clearMessages();
    try {
      const result = await deleteCard(cardId, () => {});
      if (result.success) {
        setSuccess('Card deleted successfully');
        await loadCardsData();
      } else {
        setError(result.error || 'Failed to delete card');
      }
    } catch (err) {
      console.error('Error deleting card:', err);
      setError('Failed to delete card: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingCard(null);
  };

  // Load stats on mount - AFTER all function definitions, BEFORE conditional return
  useEffect(() => {
    if (!isAdminUser) return; // Early return inside useEffect is OK
    
    // Check if we're in development (API endpoints won't work locally)
    const isDevelopment = import.meta.env.DEV;
    
    // Only auto-load if we haven't tried before (to avoid spamming errors)
    if (activeTab === 'stats' && !stats && !loading) {
      // Skip loading in development to avoid 404 errors
      if (!isDevelopment) {
        loadStats();
      }
    } else if (activeTab === 'users' || activeTab === 'password') {
      if (users.length === 0 && !loading) {
        // Skip loading in development to avoid 404 errors
        if (!isDevelopment) {
          loadUsers();
        }
      }
    } else if (activeTab === 'card-management') {
      // Card Management uses direct Supabase, so it works in development
      if (cards.length === 0 && !cardsLoading) {
        loadCardsData();
      }
      // Load categories and instruction levels for filtering
      if (categories.length === 0) {
        loadCategoriesData();
      }
      if (instructionLevels.length === 0) {
        loadInstructionLevelsData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAdminUser]);

  // Redirect if not admin - check AFTER all hooks
  if (!isAdminUser) {
    return (
      <div className="admin-page">
        <h1>Access Denied</h1>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`admin-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button
          className={`admin-tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Reset Progress
        </button>
        <button
          className={`admin-tab ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          Card Review
        </button>
        <button
          className={`admin-tab ${activeTab === 'card-management' ? 'active' : ''}`}
          onClick={() => setActiveTab('card-management')}
        >
          Card Management
        </button>
          <button
            className={`admin-tab ${activeTab === 'themes' ? 'active' : ''}`}
            onClick={() => setActiveTab('themes')}
          >
            Themes
          </button>
          <button
            className={`admin-tab ${activeTab === 'organization' ? 'active' : ''}`}
            onClick={() => setActiveTab('organization')}
          >
            Organization
          </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="admin-message admin-error">
          {error}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}
      {success && (
        <div className="admin-message admin-success">
          {success}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="admin-tab-content">
          <h2>System Statistics</h2>
          {error && !stats ? (
            <div className="admin-message admin-error">
              <p><strong>Failed to load statistics:</strong> {error}</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                This usually means the admin API is not configured. Check that <code>SUPABASE_SERVICE_ROLE_KEY</code> is set in Vercel environment variables and redeploy.
              </p>
            </div>
          ) : loading && !stats ? (
            <p>Loading...</p>
          ) : stats ? (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Cards</h3>
                <p className="stat-value">{stats.totalCards}</p>
              </div>
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.totalUsers}</p>
                <p className="stat-sub">{stats.adminCount} admin(s), {stats.userCount} user(s)</p>
              </div>
              <div className="stat-card">
                <h3>Total Progress Records</h3>
                <p className="stat-value">{stats.totalProgress}</p>
              </div>
              <div className="stat-card">
                <h3>Cards by Type</h3>
                <div className="stat-list">
                  {Object.entries(stats.cardsByType || {}).map(([type, count]) => (
                    <div key={type} className="stat-item">
                      <span className="stat-label">{type}:</span>
                      <span className="stat-number">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>No statistics available</p>
          )}
          <button onClick={loadStats} className="btn-secondary" disabled={loading}>
            Refresh
          </button>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-tab-content">
          <h2>User Management</h2>

          {/* Create User Form */}
          <div className="admin-section">
            <h3>Create New User</h3>
            <form onSubmit={handleCreateUser} className="admin-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  disabled={loading}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                Create User
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="admin-section">
            <h3>All Users</h3>
            {loading && users.length === 0 ? (
              <p>Loading users...</p>
            ) : users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Progress Records</th>
                      <th>Created</th>
                      <th>Last Sign In</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td>{u.progressCount}</td>
                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                        <td>{u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString() : 'Never'}</td>
                        <td className="actions-cell">
                          <button
                            onClick={() => handleToggleAdmin(u.id, u.role)}
                            className="btn-small"
                            disabled={loading}
                            title={u.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
                          >
                            {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => setPasswordForm({ ...passwordForm, userId: u.id })}
                            className="btn-small"
                            disabled={loading}
                          >
                            Change Password
                          </button>
                          <button
                            onClick={() => handleResetProgress(u.id)}
                            className="btn-small btn-danger"
                            disabled={loading}
                          >
                            Reset Progress
                          </button>
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="btn-small btn-danger"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button onClick={loadUsers} className="btn-secondary" disabled={loading}>
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className="admin-tab-content">
          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword} className="admin-form">
            <div className="form-group">
              <label>User</label>
              <select
                value={passwordForm.userId}
                onChange={(e) => setPasswordForm({ ...passwordForm, userId: e.target.value })}
                required
                disabled={loading}
              >
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email} {u.role === 'admin' ? '(Admin)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              Change Password
            </button>
          </form>
          {users.length === 0 && (
            <p className="hint">No users loaded. Switch to "User Management" tab first.</p>
          )}
        </div>
      )}

      {/* Reset Progress Tab */}
      {activeTab === 'progress' && (
        <div className="admin-tab-content">
          <h2>Reset SM-2 Progress</h2>
          <div className="admin-section">
            <h3>Reset Progress for Specific User</h3>
            <p className="warning">This will delete all SM-2 progress data for the selected user.</p>
            <select
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value || null)}
              disabled={loading}
            >
              <option value="">Select a user...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} ({u.progressCount} records)
                </option>
              ))}
            </select>
            <button
              onClick={() => handleResetProgress(selectedUser)}
              className="btn-danger"
              disabled={loading || !selectedUser}
            >
              Reset Progress for User
            </button>
          </div>

          <div className="admin-section danger-zone">
            <h3>⚠️ Danger Zone</h3>
            <p className="warning">Reset progress for ALL users. This cannot be undone!</p>
            <button
              onClick={() => handleResetProgress(null)}
              className="btn-danger btn-large"
              disabled={loading}
            >
              Reset Progress for ALL Users
            </button>
          </div>
        </div>
      )}

      {/* Card Review Tab */}
      {activeTab === 'cards' && (
        <div className="admin-tab-content">
          <AdminCardReview isAdmin={isAdminUser} />
        </div>
      )}

      {/* Card Management Tab */}
      {activeTab === 'card-management' && (
        <div className="admin-tab-content">
          <div className="card-management-header">
            <h2>Card Management</h2>
            <div className="card-management-actions">
              {/* View Toggle */}
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => {
                    // View switching preserves filters (they're in parent state)
                    // Modal state persists across view switches (modal is independent of view)
                    setViewMode('table');
                  }}
                  title="Table/Spreadsheet View"
                  aria-pressed={viewMode === 'table'}
                >
                  Table
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
                  onClick={() => {
                    // View switching preserves filters (they're in parent state)
                    // Modal state persists across view switches (modal is independent of view)
                    setViewMode('card');
                  }}
                  title="Card/Grid View"
                  aria-pressed={viewMode === 'card'}
                >
                  Cards
                </button>
              </div>
              <button
                className="btn-primary"
                onClick={handleAddCard}
                disabled={loading || cardsLoading}
              >
                + Add Card
              </button>
            </div>
          </div>

          {/* Quick Translate Form (for admins, only in card view) */}
          {viewMode === 'card' && (
            <QuickTranslateForm 
              onAddCards={handleAddCards} 
              isAdmin={isAdminUser} 
            />
          )}
          
          {/* Filters */}
          <div className="card-management-filters">
            <div className="filter-group">
              <label htmlFor="filter-type">Filter by Type:</label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="word">Word</option>
                <option value="phrase">Phrase</option>
                <option value="number">Number</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filter-category">Filter by Category:</label>
              <select
                id="filter-category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filter-instruction-level">Filter by Instruction Level:</label>
              <select
                id="filter-instruction-level"
                value={filterInstructionLevel}
                onChange={(e) => setFilterInstructionLevel(e.target.value)}
              >
                <option value="">All Levels</option>
                {instructionLevels
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* View Mode Content */}
          {viewMode === 'table' ? (
            <ErrorBoundary>
              <AdminCardTable
                cards={cards}
                loading={cardsLoading}
                onAdd={handleAddCard}
                onEdit={handleEditCard}
                onDelete={handleDeleteCard}
                onPreview={handlePreviewCard}
                filterType={filterType}
                filterCategory={filterCategory}
                filterInstructionLevel={filterInstructionLevel}
              />
            </ErrorBoundary>
          ) : (
            <CardManager
              cards={cards}
              onAddCard={handleSaveCard}
              onAddCards={handleAddCards}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              isAdmin={isAdminUser}
              currentUserId={user?.id || null}
              showHeader={false}
              showQuickTranslate={false}
              filterType={filterType}
              filterCategory={filterCategory}
              filterInstructionLevel={filterInstructionLevel}
            />
          )}

          <AdminCardModal
            isOpen={modalOpen}
            mode={modalMode}
            card={editingCard}
            onSave={handleSaveCard}
            onCancel={handleModalCancel}
            isAdmin={isAdminUser}
          />

          <CardPreviewModal
            card={previewCard}
            isOpen={isPreviewOpen}
            onClose={handleClosePreview}
          />
        </div>
      )}

      {/* Themes Tab */}
      {activeTab === 'themes' && (
        <div className="admin-tab-content">
          <AdminThemeManager />
        </div>
      )}

      {/* Organization Tab */}
      {activeTab === 'organization' && (
        <div className="admin-tab-content">
          <AdminClassificationManager />
        </div>
      )}
    </div>
  );
}

