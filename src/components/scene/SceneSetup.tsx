import React, { forwardRef, useRef, useMemo } from 'react';
// Remove useFrame if it's ONLY used for the grid now
// import { useFrame } from '@react-three/fiber';
import { Environment, Plane } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { InfiniteGridHelper } from '../../helper/InfiniteGridHelper'; // ADJUST PATH AS NEEDED
import type { TankRef } from '../game/Tank';

interface SceneSetupProps {
    tankRef: React.RefObject<TankRef | null>; // Keep tankRef if needed elsewhere, otherwise can remove
}

export const SceneSetup = forwardRef<THREE.Mesh, SceneSetupProps>(
    // Remove tankRef from props if no longer needed by this component
    // ({ tankRef }, ref) => {
    ({}, ref) => { // Example: If tankRef is no longer needed here
        // This is likely no longer needed if only used for grid positioning
        // const tankWorldPos = useMemo(() => new THREE.Vector3(), []);

        const gridHelper = useMemo(() => {
            const helper = new InfiniteGridHelper(
                10, 100, 0xcccccc, 80
            );
            const material = helper.material as THREE.ShaderMaterial;
            material.transparent = true;
            material.depthWrite = false;

            // Set the initial position (e.g., slightly below origin)
            // This position will NOT be updated per frame anymore
            helper.position.y = -0.01;
            return helper;
        }, []);

        // Keep the ref if you want to access the helper for other reasons (e.g., debugging)
        // otherwise, it can be removed if the object isn't interacted with after creation.
        const gridPrimitiveRef = useRef<InfiniteGridHelper>(null!);

        // --- REMOVE THE useFrame LOGIC THAT MOVES THE GRID ---
        /*
         useFrame(() => {
             const tankGroup = tankRef.current?.group;
             const gridPrimitive = gridPrimitiveRef.current;

             if (tankGroup && gridPrimitive) {
                 tankGroup.getWorldPosition(tankWorldPos);
                 // DON'T DO THIS: gridPrimitive.position.set(...)
             }
         });
        */
         // -------------------------------------------------------

         return (
            <>
              <ambientLight intensity={1} />
                 <directionalLight
                    position={[15, 20, 10]}
                    intensity={2.5}
                    castShadow
                    // ... shadow props ...
                     shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-camera-far={50}
                    shadow-camera-left={-15}
                    shadow-camera-right={15}
                    shadow-camera-top={15}
                    shadow-camera-bottom={-15}
                />
                <Environment preset="city" background={false} />

                 {/* The helper object itself stays stationary */}
                 <primitive
                    object={gridHelper}
                    ref={gridPrimitiveRef} // Ref is optional if not used elsewhere
                />

                 {/* Physics Ground remains essential */}
                 <RigidBody type="fixed" colliders="cuboid" name="physicsGround">
                    <CuboidCollider args={[1000, 0.1, 1000]} position={[0, -0.1, 0]} />
                </RigidBody>

                 {/* Raycasting Plane remains essential and MUST be stationary */}
                 <Plane
                    ref={ref} // Forwarded ref for raycasting target
                    args={[2000, 2000]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, -0.05, 0]} // Ensure Y is distinct
                    name="raycastPlane"
                    visible={false}
                >
                    <meshBasicMaterial side={THREE.DoubleSide} transparent={true} opacity={0} depthWrite={false} />
                </Plane>
            </>
        );
    });
SceneSetup.displayName = 'SceneSetup';