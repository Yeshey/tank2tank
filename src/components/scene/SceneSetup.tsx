// src/components/scene/SceneSetup.tsx
import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid, Environment, Plane } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import type { TankRef } from '../game/Tank';

interface SceneSetupProps {
    tankRef: React.RefObject<TankRef | null>;
}

const tankWorldPos = new THREE.Vector3();

export const SceneSetup = forwardRef<THREE.Mesh, SceneSetupProps>( // Forwarded ref is for the Plane (Mesh)
    ({ tankRef, ...props }, ref) => { // 'ref' here is the forwarded ref for the Plane
        const gridRef = useRef<THREE.Group>(null); // Local ref for the Grid (Group) - Use 'null' instead of 'null!'

        useFrame(() => {
            const tankGroup = tankRef.current?.group;
            const grid = gridRef.current; // grid is potentially null initially

            if (tankGroup && grid) {
                tankGroup.getWorldPosition(tankWorldPos);
                grid.position.set(tankWorldPos.x, grid.position.y, tankWorldPos.z);
                grid.updateMatrixWorld();
            }
        });

        return (
            <>
                {/* ... Lights, Environment ... */}
                <ambientLight intensity={1} />
                 <directionalLight
                    position={[15, 20, 10]}
                    intensity={2.5}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-camera-far={50}
                    shadow-camera-left={-15}
                    shadow-camera-right={15}
                    shadow-camera-top={15}
                    shadow-camera-bottom={-15}
                />
                <Environment preset="city" background={false} />

                {/* Grid - Assign the LOCAL gridRef */}
                <Grid
                    ref={gridRef as any} // Assign the THREE.Group ref here
                    position={[0, 0, 0]} // Initial position (will be updated)
                    // args={[10.5, 10.5]} // Remove args if not needed/causing issues
                    infiniteGrid
                    cellSize={0.6}
                    cellThickness={0.6}
                    cellColor="#cccccc"
                    sectionSize={3}
                    sectionThickness={1.2}
                    sectionColor="#999999"
                    fadeDistance={150}
                    fadeStrength={1.5}
                    followCamera={false}
                />

                {/* ... Physics Ground ... */}
                 <RigidBody type="fixed" colliders="cuboid" name="physicsGround">
                    <CuboidCollider args={[1000, 0.1, 1000]} position={[0, -0.1, 0]} />
                </RigidBody>


                {/* Invisible Plane - Assign the FORWARDED ref */}
                <Plane
                    ref={ref} // Assign the forwarded THREE.Mesh ref here
                    args={[2000, 2000]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    name="raycastPlane"
                    visible={false}
                >
                    <meshStandardMaterial color="white" side={THREE.DoubleSide} />
                </Plane>
            </>
        );
    });

SceneSetup.displayName = 'SceneSetup';