import { useState, useEffect, useMemo } from 'react';
import Flashcard from './components/Flashcard.jsx';
import CardButtons from './components/CardButtons.jsx';
import ProgressStats from './components/ProgressStats.jsx';
import CardManager from './components/CardManager.jsx';
import CardFilter from './components/CardFilter.jsx';
import Auth from './components/Auth.jsx';
import { useAuth } from './hooks/useAuth.js';
import { convertNumbersToCards } from './data/tibetanNumbers.js';
import { convertWordsToCards } from './data/tibetanWords.js';
import { 
  loadCards, 
  saveCards, 
  loadProgress, 
  saveProgress, 
  updateCardProgress as updateProgressStorage,
  mergeSeedData 
} from './utils/storage.js';
import { loadCards as loadCardsSupabase, saveCards as saveCardsSupabase, saveCard as saveCardSupabase, deleteCard as deleteCardSupabase, subscribeToCards } from './services/cardsService.js';
import { loadProgress as loadProgressSupabase, saveProgressBatch as saveProgressSupabase, subscribeToProgress } from './services/progressService.js';
import { isSupabaseConfigured } from './services/supabase.js';
import { 
  calculateReview, 
  initializeCardProgress,
  getQualityFromButton 
} from './utils/sm2Algorithm.js';
import { 
  getNextCard, 
  calculateStats,
  filterCardsByTags
} from './utils/cardUtils.js';
import './App.css';

function App() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [cards, setCards] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [view, setView] = useState('study'); // 'study' or 'manage'
  const [selectedTags, setSelectedTags] = useState(['all']); // Filter tags
  const [useSupabase, setUseSupabase] = useState(false);
  const [migrationPrompt, setMigrationPrompt] = useState(false);

  // Determine if we should use Supabase
  useEffect(() => {
    const configured = isSupabaseConfigured();
    const hasUser = user !== null;
    setUseSupabase(configured && hasUser);
  }, [user]);

  // Initialize cards and progress on mount (don't wait for auth)
  useEffect(() => {
    const initializeData = async () => {
      try {
        const numberCards = convertNumbersToCards();
        const wordCards = convertWordsToCards();
        const seedCards = [...numberCards, ...wordCards];
        
        let existingCards = [];
        let existingProgress = {};

        // Try Supabase first if configured and user available
        if (useSupabase && user) {
          try {
            existingCards = await loadCardsSupabase(() => loadCards()) || [];
            existingProgress = await loadProgressSupabase(user.id, () => loadProgress()) || {};
          } catch (err) {
            console.warn('Error loading from Supabase, falling back to localStorage:', err);
            existingCards = loadCards();
            existingProgress = loadProgress();
          }
        } else {
          // Load from localStorage
          existingCards = loadCards();
          existingProgress = loadProgress();
        }

        // Check for localStorage data to migrate
        const localCards = loadCards();
        const localProgress = loadProgress();
        if (useSupabase && user && (localCards.length > 0 || Object.keys(localProgress).length > 0)) {
          const hasSupabaseData = existingCards.length > 0 || Object.keys(existingProgress).length > 0;
          if (!hasSupabaseData) {
            setMigrationPrompt(true);
          }
        }

        const mergedCards = mergeSeedData(seedCards, existingCards);
        
        if (mergedCards.length !== existingCards.length) {
          try {
            if (useSupabase && user) {
              await saveCardsSupabase(mergedCards, () => saveCards(mergedCards));
            } else {
              saveCards(mergedCards);
            }
          } catch (err) {
            console.warn('Error saving merged cards, using localStorage:', err);
            saveCards(mergedCards);
          }
        }
        
        setCards(mergedCards);
        setProgressMap(existingProgress);
      } catch (err) {
        console.error('Error initializing app data:', err);
        // Fallback to basic setup
        const numberCards = convertNumbersToCards();
        const wordCards = convertWordsToCards();
        const seedCards = [...numberCards, ...wordCards];
        const existingCards = loadCards();
        const mergedCards = mergeSeedData(seedCards, existingCards);
        setCards(mergedCards);
        setProgressMap(loadProgress());
      }
    };

    // Don't wait for auth - initialize immediately
    initializeData();
  }, [useSupabase, user]);

  // Set up real-time subscriptions for Supabase
  useEffect(() => {
    if (!useSupabase || !user) return;

    // Subscribe to card changes
    const unsubscribeCards = subscribeToCards((payload) => {
      if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
        setCards(prevCards => {
          const existing = prevCards.find(c => c.id === payload.data.id);
          if (existing) {
            return prevCards.map(c => c.id === payload.data.id ? payload.data : c);
          }
          return [...prevCards, payload.data];
        });
      } else if (payload.type === 'DELETE') {
        setCards(prevCards => prevCards.filter(c => c.id !== payload.data.id));
      }
    });

    // Subscribe to progress changes for this user
    const unsubscribeProgress = subscribeToProgress(user.id, (payload) => {
      if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
        setProgressMap(prev => ({
          ...prev,
          [payload.data.cardId]: payload.data
        }));
      } else if (payload.type === 'DELETE') {
        setProgressMap(prev => {
          const newMap = { ...prev };
          delete newMap[payload.data.cardId];
          return newMap;
        });
      }
    });

    return () => {
      if (unsubscribeCards) unsubscribeCards();
      if (unsubscribeProgress) unsubscribeProgress();
    };
  }, [useSupabase, user]);

  // Get filtered cards based on selected tags (memoized to prevent unnecessary recalculations)
  const filteredCards = useMemo(() => {
    return filterCardsByTags(cards, selectedTags);
  }, [cards, selectedTags]);

  // Get next card when filtered cards or progress changes
  // Only update if current card is not in filtered set or we don't have a current card
  // Skip updates while card is flipped to prevent interrupting user study
  useEffect(() => {
    // Don't change card if user is currently viewing the answer
    if (isFlipped) {
      return;
    }

    if (filteredCards.length > 0) {
      // Check if current card is still in the filtered set
      const isCurrentCardInFilteredSet = currentCard && filteredCards.some(card => card.id === currentCard.id);
      
      // Only get new card if current card is not in filtered set or we don't have a current card
      if (!currentCard || !isCurrentCardInFilteredSet) {
        const nextCard = getNextCard(filteredCards, progressMap);
        setCurrentCard(nextCard);
        setIsFlipped(false);
      }
      // If current card is still in filtered set, don't change it (keep it as is)
    } else {
      setCurrentCard(null);
      setIsFlipped(false);
    }
  }, [filteredCards, progressMap, isFlipped, currentCard]);

  const handleCardFlip = () => {
    setIsFlipped(true);
  };

  const handleRate = async (buttonType) => {
    if (!currentCard || !isFlipped) return;

    const quality = getQualityFromButton(buttonType);
    let cardProgress = progressMap[currentCard.id];

    if (!cardProgress) {
      cardProgress = initializeCardProgress(currentCard.id);
    }

    const updatedProgress = calculateReview(cardProgress, quality);
    const newProgressMap = {
      ...progressMap,
      [currentCard.id]: updatedProgress
    };

    setProgressMap(newProgressMap);
    
    // Save to backend
    if (useSupabase && user) {
      await saveProgressSupabase(user.id, newProgressMap, () => {
        updateProgressStorage(currentCard.id, updatedProgress);
        saveProgress(newProgressMap);
      });
    } else {
      updateProgressStorage(currentCard.id, updatedProgress);
      saveProgress(newProgressMap);
    }

    // Hide card during transition to prevent showing answer
    setIsTransitioning(true);
    setIsFlipped(false);
    
    // Wait for fade out, then get next card
    setTimeout(() => {
      const nextCard = getNextCard(filteredCards, newProgressMap);
      setCurrentCard(nextCard);
      // Wait a bit before showing new card (fade in)
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const handleAddCard = async (newCard) => {
    // Optimistic update
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);

    // Save to backend
    if (useSupabase && user && isAdmin) {
      await saveCardSupabase(newCard, () => saveCards(updatedCards));
    } else {
      saveCards(updatedCards);
    }
  };

  const handleAddCards = async (newCards) => {
    // Optimistic update
    const updatedCards = [...cards, ...newCards];
    setCards(updatedCards);

    // Save to backend
    if (useSupabase && user && isAdmin) {
      await saveCardsSupabase(newCards, () => saveCards(updatedCards));
    } else {
      saveCards(updatedCards);
    }
  };

  const handleEditCard = async (updatedCard) => {
    // Optimistic update
    const updatedCards = cards.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    );
    setCards(updatedCards);

    // Save to backend
    if (useSupabase && user && isAdmin) {
      await saveCardSupabase(updatedCard, () => saveCards(updatedCards));
    } else {
      saveCards(updatedCards);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      // Optimistic update
      const updatedCards = cards.filter(card => card.id !== cardId);
      setCards(updatedCards);
      
      // Remove progress for deleted card
      const newProgressMap = { ...progressMap };
      delete newProgressMap[cardId];
      setProgressMap(newProgressMap);

      // Save to backend
      if (useSupabase && user && isAdmin) {
        await deleteCardSupabase(cardId, () => saveCards(updatedCards));
      } else {
        saveCards(updatedCards);
      }
      saveProgress(newProgressMap);
    }
  };

  const handleMigration = async () => {
    const localCards = loadCards();
    const localProgress = loadProgress();

    if (localCards.length > 0) {
      await saveCardsSupabase(localCards);
    }

    if (Object.keys(localProgress).length > 0 && user) {
      await saveProgressSupabase(user.id, localProgress);
    }

    setMigrationPrompt(false);
    alert('Migration complete! Your cards and progress have been synced.');
  };

  const stats = calculateStats(cards, progressMap);

  // Show auth screen if not logged in and trying to manage cards
  if (authLoading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Show auth screen for card management (admin only)
  if (view === 'manage' && (!user || !isAdmin)) {
    return (
      <div className="app">
        <Auth onLogin={() => {}} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>རིན་ཆེན་སྒྲིག་སྟངས། Tibetan Flashcards</h1>
        <nav className="app-nav">
          <button 
            className={`nav-button ${view === 'study' ? 'active' : ''}`}
            onClick={() => setView('study')}
          >
            Study
          </button>
          <button 
            className={`nav-button ${view === 'manage' ? 'active' : ''}`}
            onClick={() => setView('manage')}
          >
            Manage Cards
          </button>
          {user && (
            <div className="user-info">
              {isAdmin && <span className="admin-badge">Admin</span>}
              <span className="user-email">{user.email}</span>
            </div>
          )}
        </nav>
      </header>
      
      {migrationPrompt && (
        <div className="migration-banner">
          <p>We found local data. Would you like to sync it to the cloud?</p>
          <div className="migration-actions">
            <button onClick={handleMigration} className="btn-primary">Yes, Sync Now</button>
            <button onClick={() => setMigrationPrompt(false)} className="btn-secondary">Later</button>
          </div>
        </div>
      )}

      <main className="app-main">
        {view === 'study' ? (
          <div className="study-view">
            <CardFilter 
              selectedTags={selectedTags}
              onTagToggle={setSelectedTags}
            />
            <ProgressStats stats={calculateStats(filteredCards, progressMap)} />
            
            {currentCard ? (
              <div style={{ opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.3s' }}>
                <Flashcard 
                  key={currentCard.id}
                  card={currentCard} 
                  onFlip={handleCardFlip}
                />
                {isFlipped && !isTransitioning && (
                  <CardButtons 
                    onRate={handleRate} 
                    disabled={false}
                  />
                )}
              </div>
            ) : (
              <div className="no-cards-message">
                <p>No cards available. Add some cards in the Manage Cards section!</p>
              </div>
            )}
          </div>
        ) : (
          <CardManager 
            cards={cards}
            onAddCard={handleAddCard}
            onAddCards={handleAddCards}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            isAdmin={isAdmin}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Learn Tibetan with spaced repetition</p>
      </footer>
    </div>
  );
}

export default App;
