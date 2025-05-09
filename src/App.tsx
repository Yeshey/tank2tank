// src/App.tsx
import { useState, Suspense } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { BabylonSceneComponent } from './components/BabylonSceneComponent'; // We will create this
import './App.css';
import './index.css'; // Ensure this contains fullscreen styles

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerName, setPlayerName] = useState('');

  const handleStartGame = (name: string) => {
    setPlayerName(name);
    setIsLoggedIn(true);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      {!isLoggedIn ? (
        <HomeScreen onStart={handleStartGame} />
      ) : (
        // Suspense might not be strictly necessary here unless BabylonSceneComponent itself uses React.lazy
        // For Babylon.js, loading is handled internally or via its AssetManager
        <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>Loading Scene...</div>}>
          <BabylonSceneComponent playerName={playerName} />
        </Suspense>
      )}
    </div>
  );
}

export default App;