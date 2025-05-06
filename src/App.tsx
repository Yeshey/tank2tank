import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three'; // Import THREE
import { Tank } from './components/game/Tank'; // Updated path
import { HomeScreen } from './components/HomeScreen';
import { CameraRig } from './components/scene/CameraRig'; // Updated path
import { SceneSetup } from './components/scene/SceneSetup'; // Updated path
import './App.css';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const tankRef = useRef<THREE.Group>(null);

  const handleStartGame = (name: string) => {
    setPlayerName(name);
    setIsLoggedIn(true);
  };

  // Correctly type or construct the camera props
  const initialCameraProps = {
    // position: new THREE.Vector3(0, 12, 14), // Option 1: Use Vector3
    position: [0, 12, 14] as [number, number, number], // Option 2: Type Assertion
    fov: 55
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}> {/* Ensure container fills screen */}
      {!isLoggedIn ? (
        <HomeScreen onStart={handleStartGame} />
      ) : (
        <Canvas
          shadows
          camera={initialCameraProps} // Use the typed props
          style={{ background: '#ffffff' }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            {/* Setup Scene Elements */}
            <SceneSetup />

            {/* Game Objects */}
            <Tank ref={tankRef} name={playerName} position={[0, 0, 0]} />

            {/* Camera Controller */}
            <CameraRig tankRef={tankRef} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

export default App;