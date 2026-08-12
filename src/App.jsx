import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dictation from './activities/Dictation';
import DragDrop from './activities/DragDrop';
import Hotspot from './activities/Hotspot';
import MemoryGame from './activities/MemoryGame';
import WordScramble from './activities/WordScramble';
import FindHotspot from './activities/FindHotspot';
import Flashcards from './activities/Flashcards';
import Crossword from './activities/Crossword';
import DragTheWords from './activities/DragTheWords';

import CreateActivity from './pages/CreateActivity';
import ActivityEditor from './creator/ActivityEditor';

function App() {
  const [currentActivity, setCurrentActivity] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'create' | 'editor'
  const [creatorType, setCreatorType] = useState(null);
  const [activeSavedData, setActiveSavedData] = useState(null);

  const handleSelectActivity = (activityId) => {
    setCurrentActivity(activityId);
    setActiveSavedData(null);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToActivities = () => {
    setCurrentActivity(null);
    setActiveSavedData(null);
    setCurrentView('home');
    setTimeout(() => {
      const activitiesElement = document.getElementById('activities');
      if (activitiesElement) {
        activitiesElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleNavigateHome = () => {
    setCurrentActivity(null);
    setActiveSavedData(null);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateActivities = () => {
    setCurrentActivity(null);
    setActiveSavedData(null);
    setCurrentView('home');
    setTimeout(() => {
      const activitiesElement = document.getElementById('activities');
      if (activitiesElement) {
        activitiesElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleNavigateCreate = () => {
    setCurrentActivity(null);
    setActiveSavedData(null);
    setCurrentView('create');
    setCreatorType(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchEditor = (type) => {
    setCreatorType(type);
    setActiveSavedData(null);
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaySaved = (savedAct) => {
    setActiveSavedData(savedAct);
    setCurrentActivity(savedAct.type);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditSaved = (savedAct) => {
    setCreatorType(savedAct.type);
    setActiveSavedData(savedAct);
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (currentView === 'create') {
      return (
        <CreateActivity
          onSelectType={handleLaunchEditor}
          onPlaySaved={handlePlaySaved}
          onEditSaved={handleEditSaved}
          onBack={handleNavigateHome}
        />
      );
    }

    if (currentView === 'editor') {
      return (
        <ActivityEditor
          type={creatorType}
          initialData={activeSavedData}
          onBack={() => setCurrentView('create')}
        />
      );
    }

    switch (currentActivity) {
      case 'dictation':
        return <Dictation data={activeSavedData} onBack={handleBackToActivities} />;
      case 'drag-drop':
        return <DragDrop data={activeSavedData} onBack={handleBackToActivities} />;
      case 'find-multiple-hotspot':
      case 'multiple-hotspot':
      case 'find-multiple-hotspots':
        return <Hotspot data={activeSavedData} onBack={handleBackToActivities} />;
      case 'find-hotspot':
        return <FindHotspot data={activeSavedData} onBack={handleBackToActivities} />;
      case 'memory':
      case 'memory-game':
        return <MemoryGame data={activeSavedData} onBack={handleBackToActivities} />;
      case 'word-scramble':
        return <WordScramble data={activeSavedData} onBack={handleBackToActivities} />;
      case 'flashcards':
        return <Flashcards data={activeSavedData} onBack={handleBackToActivities} />;
      case 'crossword':
        return <Crossword data={activeSavedData} onBack={handleBackToActivities} />;
      case 'drag-words':
      case 'drag-the-words':
        return <DragTheWords data={activeSavedData} onBack={handleBackToActivities} />;
      default:
        return <Home onSelectActivity={handleSelectActivity} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar
        onNavigateHome={handleNavigateHome}
        onNavigateActivities={handleNavigateActivities}
        onNavigateCreate={handleNavigateCreate}
        currentActivity={currentActivity}
        currentView={currentView}
      />
      <main className="main-content">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
