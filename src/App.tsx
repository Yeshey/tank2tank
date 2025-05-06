import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Physics } from '@react-three/rapier';
import { Tank } from './components/game/Tank';
import type { TankRef } from './components/game/Tank';
import { HomeScreen } from './components/HomeScreen';
import { CameraRig } from './components/scene/CameraRig';
import { SceneSetup } from './components/scene/SceneSetup';
import './App.css';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const tankRef = useRef<TankRef>(null);
  // Create the ref for the raycasting plane here
  const groundPlaneRef = useRef<THREE.Mesh>(null);

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
          <Physics gravity={[0, -9.81, 0]}>
            <Suspense fallback={null}>
              {/* Pass the ref to SceneSetup */}
              <SceneSetup ref={groundPlaneRef} />

              {/* Pass the ref to Tank */}
              <Tank ref={tankRef} name={playerName} position={[0, 0.5, 0]} groundPlaneRef={groundPlaneRef} />

              <CameraRig tankRef={tankRef} />
            </Suspense>
          </Physics>
        </Canvas>
      )}
    </div>
  );
}

export default App;