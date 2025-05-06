// src/App.tsx
import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Physics } from '@react-three/rapier';
import { Tank } from './components/game/Tank';
import type { TankRef } from './components/game/Tank';
import { HomeScreen } from './components/HomeScreen';
import { CameraRig } from './components/scene/CameraRig';
import { SceneSetup } from './components/scene/SceneSetup';
// Import camera constants
import {
    USE_ORTHOGRAPHIC_CAMERA,
    ORTHO_CAMERA_ZOOM,
    BASE_CAMERA_OFFSET, // Needed for initial ortho position
    ORTHO_NEAR_CLIP,
    ORTHO_FAR_CLIP
} from './constants'; // Adjust path
import './App.css';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const tankRef = useRef<TankRef>(null);
  const groundPlaneRef = useRef<THREE.Mesh>(null);

  const handleStartGame = (name: string) => {
    setPlayerName(name);
    setIsLoggedIn(true);
  };

  // Define perspective camera props (only used if NOT orthographic)
  const perspectiveCameraProps = {
    position: BASE_CAMERA_OFFSET.toArray() as [number, number, number], // Use constant for initial pos
    fov: 55
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      {!isLoggedIn ? (
        <HomeScreen onStart={handleStartGame} />
      ) : (
        <Canvas
          shadows
          // Conditionally set camera props based on the constant
          {...(USE_ORTHOGRAPHIC_CAMERA
            ? { // Props for Orthographic mode
                orthographic: true,
                // Set initial ortho camera properties directly
                camera: {
                    position: BASE_CAMERA_OFFSET.toArray(), // Start at the offset
                    zoom: ORTHO_CAMERA_ZOOM,
                    near: ORTHO_NEAR_CLIP,
                    far: ORTHO_FAR_CLIP,
                 }
              }
            : { // Props for Perspective mode
                camera: perspectiveCameraProps
              }
          )}
          style={{ background: '#ffffff' }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
           {/* ===== Developer Note: Camera Mode Toggle ===== */}
           {/* To switch between camera modes, edit the   */}
           {/* USE_ORTHOGRAPHIC_CAMERA constant in       */}
           {/* src/constants.ts and restart the server.  */}
           {/* ============================================= */}

          <Physics gravity={[0, -9.81, 0]}>
            <Suspense fallback={null}>
              <SceneSetup ref={groundPlaneRef} />
              <Tank ref={tankRef} name={playerName} position={[0, 0.5, 0]} groundPlaneRef={groundPlaneRef} />
              {/* CameraRig works with both Perspective and Orthographic cameras */}
              {/* It reads the camera instance from useThree() */}
              <CameraRig tankRef={tankRef} />
            </Suspense>
          </Physics>
        </Canvas>
      )}
    </div>
  );
}

export default App;