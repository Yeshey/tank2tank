// src/components/GameScene.tsx
import { Suspense, useRef, useEffect, useState, useMemo } from 'react'; // Added useState, useMemo
import { Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Physics } from '@react-three/rapier';
import { Tank } from './game/Tank';
import type { TankRef } from './game/Tank';
import { CameraRig } from './scene/CameraRig';
import { SceneSetup } from './scene/SceneSetup';
import { MazeWall } from './game/MazeWall'; // Import MazeWall
import { MiniMap } from './ui/MiniMap';   // Import MiniMap (will create this soon)

import {
    USE_ORTHOGRAPHIC_CAMERA,
    ORTHO_CAMERA_ZOOM,
    BASE_CAMERA_OFFSET,
    ORTHO_NEAR_CLIP,
    ORTHO_FAR_CLIP,
    SHOW_FPS_STATS,
    // Import wall constants
    WALL_COUNT,
    WALL_MIN_SIZE,
    WALL_MAX_SIZE,
    WALL_SPAWN_AREA_MIN_RADIUS,
    WALL_SPAWN_AREA_MAX_RADIUS,
    WALL_MIN_DISTANCE_FROM_TANK_START,
    MINIMAP_ENABLED, // To conditionally render minimap
} from '../constants';

interface GameSceneProps {
  playerName: string;
}

// Define a type for our wall data
export interface WallObjectData {
  id: string;
  position: THREE.Vector3;
  size: THREE.Vector3; // Full width, height, depth
}

export function GameScene({ playerName }: GameSceneProps) {
    console.log('GameScene RENDERED/MOUNTED');
    useEffect(() => {
        console.log('GameScene EFFECT MOUNT');
        return () => console.error('!!! GameScene UNMOUNTING !!!');
    }, []);

    const tankRef = useRef<TankRef>(null);
    const groundPlaneRef = useRef<THREE.Mesh>(null); // For SceneSetup
    const [wallsData, setWallsData] = useState<WallObjectData[]>([]);

    // Generate walls once on component mount
    useEffect(() => {
        const generatedWalls: WallObjectData[] = [];
        const tankInitialPos = new THREE.Vector3(0, 0, 0); // Tank starts near origin on XZ plane

        for (let i = 0; i < WALL_COUNT; i++) {
            let newWallPosition: THREE.Vector3;
            let newWallSize: THREE.Vector3;
            let distToTankStart: number;
            let attempts = 0;

            do {
                const angle = Math.random() * Math.PI * 2;
                const radius = WALL_SPAWN_AREA_MIN_RADIUS + Math.random() * (WALL_SPAWN_AREA_MAX_RADIUS - WALL_SPAWN_AREA_MIN_RADIUS);
                
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                newWallSize = new THREE.Vector3(
                    THREE.MathUtils.randFloat(WALL_MIN_SIZE.x, WALL_MAX_SIZE.x),
                    THREE.MathUtils.randFloat(WALL_MIN_SIZE.y, WALL_MAX_SIZE.y),
                    THREE.MathUtils.randFloat(WALL_MIN_SIZE.z, WALL_MAX_SIZE.z)
                );
                
                // Position wall so its base is on the ground (y=0)
                newWallPosition = new THREE.Vector3(x, newWallSize.y / 2, z);
                
                // Check distance from tank's start. Consider wall's own size for clearance.
                const clearanceRadius = Math.max(newWallSize.x, newWallSize.z) / 2;
                distToTankStart = newWallPosition.clone().setY(0).distanceTo(tankInitialPos) - clearanceRadius;
                attempts++;
            } while (distToTankStart < WALL_MIN_DISTANCE_FROM_TANK_START && attempts < 20); // Limit attempts to avoid infinite loop

            if (distToTankStart >= WALL_MIN_DISTANCE_FROM_TANK_START) {
                 generatedWalls.push({
                    id: `wall-${i}-${Date.now()}`, // More unique ID
                    position: newWallPosition,
                    size: newWallSize,
                });
            }
        }
        setWallsData(generatedWalls);
        console.log(`Generated ${generatedWalls.length} walls.`);
    }, []); // Empty dependency array means this runs once on mount

    const perspectiveCameraProps = useMemo(() => ({
        position: BASE_CAMERA_OFFSET.toArray() as [number, number, number],
        fov: 55
    }), []);
    const orthographicCameraProps = useMemo(() => ({
        position: BASE_CAMERA_OFFSET.toArray() as [number, number, number],
        zoom: ORTHO_CAMERA_ZOOM,
        near: ORTHO_NEAR_CLIP,
        far: ORTHO_FAR_CLIP,
    }), []);

    return (
        // This div needs to be relative for the absolute positioning of the MiniMap
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Canvas
                shadows
                {...(USE_ORTHOGRAPHIC_CAMERA
                    ? { orthographic: true, camera: orthographicCameraProps }
                    : { camera: perspectiveCameraProps }
                )}
                style={{ background: '#ffffff' }} // Canvas itself
                gl={{ antialias: true }}
                dpr={[1, 2]}
            >
                {SHOW_FPS_STATS && <Stats />}
                <Physics gravity={[0, -9.81, 0]}>
                    <Suspense fallback={null}>
                        <SceneSetup ref={groundPlaneRef} />
                        <Tank ref={tankRef} name={playerName} position={[0, 0.5, 0]} groundPlaneRef={groundPlaneRef} />
                        <CameraRig tankRef={tankRef} />
                        
                        {/* Render generated walls */}
                        {wallsData.map(wall => (
                            <MazeWall
                                key={wall.id}
                                position={wall.position.toArray() as [number, number, number]}
                                size={wall.size.toArray() as [number, number, number]}
                            />
                        ))}
                    </Suspense>
                </Physics>
            </Canvas>
            {/* Conditionally render MiniMap */}
            {MINIMAP_ENABLED && wallsData.length > 0 && <MiniMap tankRef={tankRef} walls={wallsData} />}
        </div>
    );
}

export default GameScene;