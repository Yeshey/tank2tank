import React from 'react';
import { Grid, Environment } from '@react-three/drei';
// Import Rapier components for the ground
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export function SceneSetup() {
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

            {/* --- Physics Ground --- */}
            <RigidBody type="fixed" colliders="cuboid" name="groundPlane">
                {/* A large, thin cuboid acting as the ground collider */}
                {/* Position it slightly below Y=0 to avoid Z-fighting with visual grid */}
                <CuboidCollider args={[1000, 0.1, 1000]} position={[0, -0.1, 0]} />
                {/* The visual Plane for raycasting can be removed or kept separate */}
                {/* If removing, ensure raycasting targets this RigidBody or its collider */}
            </RigidBody>

             {/* Invisible Ground Plane for Raycasting (Optional, if raycasting doesn't work well on the physics body) */}
             {/* Make sure its name is different if keeping both, e.g., "raycastPlane" */}
             {/* <Plane args={[2000, 2000]} rotation={[-Math.PI / 2, 0, 0]} name="raycastPlane" visible={false}>
                <meshStandardMaterial color="white" />
             </Plane> */}
        </>
    );
}