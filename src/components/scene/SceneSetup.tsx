import React, { forwardRef } from 'react'; // Import forwardRef
import { Grid, Environment, Plane } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three'; // Needed for THREE.Mesh type

// Define props including the forwarded ref
interface SceneSetupProps {
    // Add any other props if needed later
}

// Use forwardRef to accept the ref from App.tsx
export const SceneSetup = forwardRef<THREE.Mesh, SceneSetupProps>((props, ref) => {
    return (
        <>
            {/* Lighting & Environment (No Change) */}
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

            {/* Grid (No Change) */}
            <Grid
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

            {/* Physics Ground (No Change) */}
            <RigidBody type="fixed" colliders="cuboid" name="physicsGround"> {/* Maybe rename? */}
                <CuboidCollider args={[1000, 0.1, 1000]} position={[0, -0.1, 0]} />
            </RigidBody>

             {/* Invisible Plane for Raycasting - Forward the ref here */}
             <Plane ref={ref} args={[2000, 2000]} rotation={[-Math.PI / 2, 0, 0]} name="raycastPlane" visible={false}>
                <meshStandardMaterial color="white" side={THREE.DoubleSide}/> {/* Ensure material exists */}
             </Plane>
        </>
    );
});

SceneSetup.displayName = 'SceneSetup'; // Add display name