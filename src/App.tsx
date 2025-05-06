import { Suspense, useState /* remove lazy */ } from 'react';
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
      // Ensure this div takes full viewport height/width
      <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
          {!isLoggedIn ? (
              <HomeScreen onStart={handleStartGame} />
          ) : (
              <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>Loading 3D Scene...</div>}>
                  <GameScene playerName={playerName} />
              </Suspense>
          )}
      </div>
  );
}
export default App;