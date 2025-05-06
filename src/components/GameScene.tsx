import { Suspense, useRef } from 'react';
import { Stats } from '@react-three/drei'; // Import Stats
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Physics } from '@react-three/rapier';
import { Tank } from './game/Tank';
import type { TankRef } from './game/Tank';
import { CameraRig } from './scene/CameraRig';
import { SceneSetup } from './scene/SceneSetup'; // Import the modified SceneSetup
import {
    USE_ORTHOGRAPHIC_CAMERA,
    ORTHO_CAMERA_ZOOM,
    BASE_CAMERA_OFFSET,
    ORTHO_NEAR_CLIP,
    ORTHO_FAR_CLIP,
    SHOW_FPS_STATS,
} from '../constants';

interface GameSceneProps {
  playerName: string;
}

export function GameScene({ playerName }: GameSceneProps) {
    const tankRef = useRef<TankRef>(null);
    // This ref is for the raycasting plane, needs to be passed to SceneSetup
    const groundPlaneRef = useRef<THREE.Mesh>(null);

    // Camera props logic
    const perspectiveCameraProps = {
        position: BASE_CAMERA_OFFSET.toArray() as [number, number, number],
        fov: 55
    };
    const orthographicCameraProps = {
        position: BASE_CAMERA_OFFSET.toArray(),
        zoom: ORTHO_CAMERA_ZOOM,
        near: ORTHO_NEAR_CLIP,
        far: ORTHO_FAR_CLIP,
    };

    return (
        <Canvas
            shadows
             {...(USE_ORTHOGRAPHIC_CAMERA
                 ? { orthographic: true, camera: orthographicCameraProps }
                 : { camera: perspectiveCameraProps }
             )}
            style={{ background: '#ffffff' }}
            gl={{ antialias: true }}
            dpr={[1, 2]}
        >
            {SHOW_FPS_STATS && <Stats />}
            <Physics gravity={[0, -9.81, 0]}>
                <Suspense fallback={null}>
                    {/* Pass the groundPlaneRef (for raycasting) */}
                    {/* Do NOT pass tankRef, as it's not needed by SceneSetup anymore */}
                    <SceneSetup ref={groundPlaneRef} />
                    <Tank ref={tankRef} name={playerName} position={[0, 0.5, 0]} groundPlaneRef={groundPlaneRef} />
                    <CameraRig tankRef={tankRef} />
                </Suspense>
            </Physics>
        </Canvas>
    );
}

export default GameScene;