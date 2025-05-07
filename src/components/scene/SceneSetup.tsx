import { forwardRef, useRef, useMemo } from 'react';
// No longer need useFrame here if it was only for the grid
// No longer need TankRef type here
// import { useFrame } from '@react-three/fiber';
// import type { TankRef } from '../game/Tank';
import { Environment, Plane } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { InfiniteGridHelper } from '../../helpers/InfiniteGridHelper'; // ADJUST PATH AS NEEDED
import { PHYSICS_GROUND_SIDE_LENGTH, RAYCAST_PLANE_SIDE_LENGTH } from '../../constants';

// --- Remove tankRef from the interface ---
interface SceneSetupProps {
    // tankRef: React.RefObject<TankRef | null>; // Remove this line
    // Add any other props if needed later
}

export const SceneSetup = forwardRef<THREE.Mesh, SceneSetupProps>(
    // Remove tankRef from the props destructuring
    // ({ tankRef }, ref) => {
    ({}, ref) => { // Receive only the forwarded ref

        // tankWorldPos is no longer needed if grid isn't moved manually
        // const tankWorldPos = useMemo(() => new THREE.Vector3(), []);

        const gridHelper = useMemo(() => {
            // ... Grid helper creation ...
            const helper = new InfiniteGridHelper(
                2, 20, 0xcccccc, 80
            );
            const material = helper.material as THREE.ShaderMaterial;
            material.transparent = true;
            material.depthWrite = false;
            helper.position.y = -0.01;
            return helper;
        }, []);

        // Ref for the grid helper primitive (optional, only needed if accessed)
        const gridPrimitiveRef = useRef<InfiniteGridHelper>(null!);

        // --- Ensure the useFrame that moved the grid IS REMOVED ---
        /*
         useFrame(() => {
            // THIS BLOCK SHOULD BE GONE
         });
        */
         // ---------------------------------------------------------

        return (
            <>
                {/* ... Lights, Environment ... */}
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

                {/* Primitive for the grid helper */}
                <primitive
                    object={gridHelper}
                    ref={gridPrimitiveRef} // Assign ref if needed elsewhere
                />

                {/* ... Physics Ground ... */}
                <RigidBody type="fixed" colliders="cuboid" name="physicsGround">
                    {/* Use the constant for CuboidCollider args (half-extents) */}
                    <CuboidCollider 
                        args={[
                            PHYSICS_GROUND_SIDE_LENGTH / 2, 
                            0.1, // Keep thickness small for a ground plane
                            PHYSICS_GROUND_SIDE_LENGTH / 2
                        ]} 
                        position={[0, -0.1, 0]} 
                    />
                </RigidBody>

                {/* Invisible Plane for Raycasting */}
                <Plane
                    ref={ref} // Assign the forwarded ref for raycasting
                    args={[RAYCAST_PLANE_SIDE_LENGTH, RAYCAST_PLANE_SIDE_LENGTH]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, -0.05, 0]}
                    name="raycastPlane"
                    visible={false}
                >
                    <meshBasicMaterial side={THREE.DoubleSide} transparent={true} opacity={0} depthWrite={false} />
                </Plane>
            </>
        );
    });
SceneSetup.displayName = 'SceneSetup';