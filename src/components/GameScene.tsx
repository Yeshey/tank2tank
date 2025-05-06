// src/components/GameScene.tsx
import React, { Suspense, useRef, useState, useEffect } from 'react'; // Add useState, useEffect
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Physics } from '@react-three/rapier';
// ... other imports (Tank, CameraRig, SceneSetup, constants) ...
import { Tank } from './game/Tank';
import type { TankRef } from './game/Tank';
import { CameraRig } from './scene/CameraRig';
import { SceneSetup } from './scene/SceneSetup';
import { USE_ORTHOGRAPHIC_CAMERA, /* ... */ BASE_CAMERA_OFFSET, ORTHO_NEAR_CLIP, ORTHO_CAMERA_ZOOM, ORTHO_FAR_CLIP, /* ... */ } from '../constants';


interface GameSceneProps {
  playerName: string;
}

export function GameScene({ playerName }: GameSceneProps) {
    const tankRef = useRef<TankRef>(null);
    const groundPlaneRef = useRef<THREE.Mesh>(null);
    const [showPhysics, setShowPhysics] = useState(false); // State to control physics rendering

    // Camera props logic
    const perspectiveCameraProps = { /* ... */ position: BASE_CAMERA_OFFSET.toArray() as [number, number, number], fov: 55 };
    const orthographicCameraProps = { /* ... */ position: BASE_CAMERA_OFFSET.toArray(), zoom: ORTHO_CAMERA_ZOOM, near: ORTHO_NEAR_CLIP, far: ORTHO_FAR_CLIP };


    // Effect to enable physics shortly after the component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowPhysics(true);
        }, 100); // Delay by 100ms (adjust if needed)

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, []); // Empty dependency array means run only once on mount

    return (
        <Canvas
            shadows
             {...(USE_ORTHOGRAPHIC_CAMERA ? { /* ... */ } : { /* ... */ })}
            style={{ background: '#ffffff' }}
            gl={{ antialias: true }} dpr={[1, 2]}
        >
            {/* Optionally render basic non-physics elements first */}
             <ambientLight intensity={0.5} /> {/* Maybe a dimmer light initially */}

            {/* Conditionally render Physics */}
            {showPhysics ? (
                <Physics gravity={[0, -9.81, 0]}>
                    {/* Keep the inner Suspense if needed for models INSIDE physics */}
                    <Suspense fallback={null}>
                        <SceneSetup ref={groundPlaneRef} />
                        <Tank ref={tankRef} name={playerName} position={[0, 0.5, 0]} groundPlaneRef={groundPlaneRef} />
                        <CameraRig tankRef={tankRef} />
                    </Suspense>
                </Physics>
            ) : (
                // Optional: Render a placeholder or just the basic lights/environment
                // while waiting for physics to initialize
                <>
                   {/* Render SceneSetup without Physics-dependent parts if possible */}
                   {/* Or just show a loading indicator */}
                   {/* <mesh>
                       <boxGeometry args={[1,1,1]}/>
                       <meshBasicMaterial color="lightgrey" wireframe/>
                   </mesh> */}
                </>
            )}
        </Canvas>
    );
}
export default GameScene;