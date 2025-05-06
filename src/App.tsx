import React, { Suspense, useState /* remove lazy */ } from 'react';
import { HomeScreen } from './components/HomeScreen';
// Import GameScene directly again
import { GameScene } from './components/GameScene';
import './App.css';
import './index.css';

// Remove lazy import: const LazyGameScene = lazy(() => import('./components/GameScene'));

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerName, setPlayerName] = useState('');

  const handleStartGame = (name: string) => {
    setPlayerName(name);
    setIsLoggedIn(true);
  };

  return (
    <div style={{ /* ... */ }}>
      {!isLoggedIn ? (
        <HomeScreen onStart={handleStartGame} />
      ) : (
         // Render GameScene directly, remove outer Suspense if only used for lazy load
         // <Suspense fallback={...}>
             <GameScene playerName={playerName} />
         // </Suspense>
      )}
    </div>
  );
}
export default App;