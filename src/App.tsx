import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
// Import Physics
import { Physics } from '@react-three/rapier';
import { Tank } from './components/game/Tank';
import type { TankRef } from './components/game/Tank'; // Import TankRef type
import { HomeScreen } from './components/HomeScreen';
import { CameraRig } from './components/scene/CameraRig';
import { SceneSetup } from './components/scene/SceneSetup';
import './App.css';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerName, setPlayerName] = useState('');
  // Ref now holds the TankRef type (or null)
  const tankRef = useRef<TankRef>(null);

  const handleStartGame = (name: string) => {
    setPlayerName(name);
    setIsLoggedIn(true);
  };

  const initialCameraProps = {
    position: [0, 12, 14] as [number, number, number],
    fov: 55
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      {!isLoggedIn ? (
        <HomeScreen onStart={handleStartGame} />
      ) : (
        <Canvas
          shadows
          camera={initialCameraProps}
          style={{ background: '#ffffff' }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          {/* Wrap dynamic scene elements in Physics */}
          <Physics gravity={[0, -9.81, 0]}> {/* Add gravity */}
            <Suspense fallback={null}>
              {/* Setup Scene Elements (Ground is now physics-based) */}
              <SceneSetup />

              {/* Game Objects */}
              <Tank ref={tankRef} name={playerName} position={[0, 0.5, 0]} /> {/* Start slightly above ground */}

              {/* Camera Controller */}
              {/* Pass the TankRef */}
              <CameraRig tankRef={tankRef} />
            </Suspense>
          </Physics>
        </Canvas>
      )}
    </div>
  );
}

export default App;