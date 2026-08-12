import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dictation from './activities/Dictation';
import DragDrop from './activities/DragDrop';
import Hotspot from './activities/Hotspot';
import MemoryGame from './activities/MemoryGame';
import WordScramble from './activities/WordScramble';

function App() {
  const [currentActivity, setCurrentActivity] = useState(null);

  const handleSelectActivity = (activityId) => {
    setCurrentActivity(activityId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToActivities = () => {
    setCurrentActivity(null);
    setTimeout(() => {
      const activitiesElement = document.getElementById('activities');
      if (activitiesElement) {
        activitiesElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleNavigateHome = () => {
    setCurrentActivity(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateActivities = () => {
    setCurrentActivity(null);
    setTimeout(() => {
      const activitiesElement = document.getElementById('activities');
      if (activitiesElement) {
        activitiesElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const renderContent = () => {
    switch (currentActivity) {
      case 'dictation':
        return <Dictation onBack={handleBackToActivities} />;
      case 'drag-drop':
        return <DragDrop onBack={handleBackToActivities} />;
      case 'multiple-hotspot':
        return <Hotspot onBack={handleBackToActivities} />;
      case 'memory-game':
        return <MemoryGame onBack={handleBackToActivities} />;
      case 'word-scramble':
        return <WordScramble onBack={handleBackToActivities} />;
      default:
        return <Home onSelectActivity={handleSelectActivity} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar
        onNavigateHome={handleNavigateHome}
        onNavigateActivities={handleNavigateActivities}
        currentActivity={currentActivity}
      />
      <main className="main-content">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
