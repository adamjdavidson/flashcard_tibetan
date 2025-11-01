import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase.js';
import './AdminCardReview.css';

/**
 * AdminCardReview component
 * Allows admin to review user-created cards and promote them to master library
 */
export default function AdminCardReview({ isAdmin }) {
  const [userCards, setUserCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadUserCards();
    }
  }, [isAdmin]);

  async function loadUserCards() {
    setLoading(true);
    setError('');
    try {
      // Load all cards that have a user_id and are not master (user-created cards)
      const { data, error: fetchError } = await supabase
        .from('cards')
        .select('*, user_id')
        .not('user_id', 'is', null)
        .eq('is_master', false)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setUserCards(data || []);
    } catch (err) {
      console.error('Error loading user cards:', err);
      setError('Failed to load user cards: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function promoteToMaster(cardId) {
    if (!confirm('Promote this card to the master library? It will be available to all users.')) {
      return;
    }

    setPromoting(cardId);
    setError('');
    setSuccess('');
    
    try {
      const { error: updateError } = await supabase
        .from('cards')
        .update({ 
          is_master: true,
          user_id: null  // Remove user ownership to make it truly master
        })
        .eq('id', cardId);
      
      if (updateError) throw updateError;
      
      // Remove from list
      setUserCards(prev => prev.filter(c => c.id !== cardId));
      setSuccess('Card promoted to master library!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error promoting card:', err);
      setError('Failed to promote card: ' + err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setPromoting(null);
    }
  }

  async function deleteCard(cardId) {
    if (!confirm('Delete this user-created card? This cannot be undone.')) {
      return;
    }

    setPromoting(cardId);
    setError('');
    setSuccess('');
    
    try {
      const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);
      
      if (deleteError) throw deleteError;
      
      // Remove from list
      setUserCards(prev => prev.filter(c => c.id !== cardId));
      setSuccess('Card deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting card:', err);
      setError('Failed to delete card: ' + err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setPromoting(null);
    }
  }

  if (loading) {
    return <div className="admin-card-review-loading">Loading user cards...</div>;
  }

  return (
    <div className="admin-card-review">
      <div className="admin-card-review-header">
        <h2>User-Created Cards</h2>
        <button onClick={loadUserCards} className="btn-secondary">
          Refresh
        </button>
      </div>
      
      <p className="admin-card-review-description">
        Review and promote user-created cards to the master library. Promoted cards become available to all users.
      </p>

      {error && (
        <div className="admin-message admin-error">
          {error}
          <button className="close-btn" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="admin-message admin-success">
          {success}
          <button className="close-btn" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {userCards.length === 0 ? (
        <div className="admin-card-review-empty">
          <p>No user-created cards to review.</p>
        </div>
      ) : (
        <div className="admin-card-review-list">
          {userCards.map(card => (
            <div key={card.id} className="admin-card-item">
              <div className="admin-card-content">
                <div className="admin-card-field">
                  <strong>Type:</strong> {card.type}
                </div>
                <div className="admin-card-field">
                  <strong>Front:</strong> {card.front}
                </div>
                {card.back_english && (
                  <div className="admin-card-field">
                    <strong>English:</strong> {card.back_english}
                  </div>
                )}
                {card.back_tibetan_script && (
                  <div className="admin-card-field">
                    <strong>Tibetan Script:</strong> {card.back_tibetan_script}
                  </div>
                )}
                {card.back_arabic && (
                  <div className="admin-card-field">
                    <strong>Arabic:</strong> {card.back_arabic}
                  </div>
                )}
                {card.tags && card.tags.length > 0 && (
                  <div className="admin-card-field">
                    <strong>Tags:</strong> {card.tags.join(', ')}
                  </div>
                )}
                {card.image_url && (
                  <div className="admin-card-field">
                    <strong>Image:</strong> <a href={card.image_url} target="_blank" rel="noopener noreferrer">View</a>
                  </div>
                )}
                <div className="admin-card-field admin-card-meta">
                  <small>
                    Created by: {card.user_id} | 
                    Created: {new Date(card.created_at).toLocaleDateString()}
                  </small>
                </div>
              </div>
              <div className="admin-card-actions">
                <button
                  onClick={() => promoteToMaster(card.id)}
                  disabled={promoting === card.id}
                  className="btn-primary"
                  title="Promote to master library"
                >
                  {promoting === card.id ? 'Promoting...' : '★ Promote to Master'}
                </button>
                <button
                  onClick={() => deleteCard(card.id)}
                  disabled={promoting === card.id}
                  className="btn-danger"
                  title="Delete card"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

