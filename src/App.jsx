import { useState, useEffect, useMemo } from 'react';
import Flashcard from './components/Flashcard.jsx';
import CardButtons from './components/CardButtons.jsx';
import ProgressStats from './components/ProgressStats.jsx';
import CardManager from './components/CardManager.jsx';
import CardFilter from './components/CardFilter.jsx';
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
  const [cards, setCards] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [view, setView] = useState('study'); // 'study' or 'manage'
  const [selectedTags, setSelectedTags] = useState(['all']); // Filter tags

  // Initialize cards and progress on mount
  useEffect(() => {
    const numberCards = convertNumbersToCards();
    const wordCards = convertWordsToCards();
    const seedCards = [...numberCards, ...wordCards];
    const existingCards = loadCards();
    const mergedCards = mergeSeedData(seedCards, existingCards);
    
    if (mergedCards.length !== existingCards.length) {
      saveCards(mergedCards);
    }
    
    setCards(mergedCards);
    setProgressMap(loadProgress());
  }, []);

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

  const handleRate = (buttonType) => {
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
    updateProgressStorage(currentCard.id, updatedProgress);
    saveProgress(newProgressMap);

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

  const handleAddCard = (newCard) => {
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    saveCards(updatedCards);
  };

  const handleEditCard = (updatedCard) => {
    const updatedCards = cards.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    );
    setCards(updatedCards);
    saveCards(updatedCards);
  };

  const handleDeleteCard = (cardId) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      const updatedCards = cards.filter(card => card.id !== cardId);
      setCards(updatedCards);
      saveCards(updatedCards);
      
      // Remove progress for deleted card
      const newProgressMap = { ...progressMap };
      delete newProgressMap[cardId];
      setProgressMap(newProgressMap);
      saveProgress(newProgressMap);
    }
  };

  const stats = calculateStats(cards, progressMap);

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
        </nav>
      </header>

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
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
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
