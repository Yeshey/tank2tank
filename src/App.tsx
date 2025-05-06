import { Suspense, useState, lazy } from 'react';
// Remove direct imports of Canvas, Physics, Tank, CameraRig, SceneSetup etc. if they are ONLY used in GameScene
import { HomeScreen } from './components/HomeScreen';
import './App.css';
import './index.css';

// Dynamically import the GameScene component
const LazyGameScene = lazy(() => import('./components/GameScene'));

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerName, setPlayerName] = useState('');
  // tankRef and groundPlaneRef are now inside GameScene

  const handleStartGame = (name: string) => {
    setPlayerName(name);
    setIsLoggedIn(true);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      {!isLoggedIn ? (
        <HomeScreen onStart={handleStartGame} />
      ) : (
        // Use Suspense to show a loading indicator while the GameScene chunk is loaded
        <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>Loading 3D Scene...</div>}>
          <LazyGameScene playerName={playerName} />
        </Suspense>
      )}
    </div>
  );
}

export default App;