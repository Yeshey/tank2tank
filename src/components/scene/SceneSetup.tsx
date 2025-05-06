import React from 'react';
import { Grid, Environment, Plane } from '@react-three/drei';

export function SceneSetup() {
    return (
        <>
            {/* Lighting */}
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
             {/* Environment lighting */}
            <Environment preset="city" background={false} />

            {/* Grid */}
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

            {/* Invisible Ground Plane for Raycasting */}
            <Plane args={[2000, 2000]} rotation={[-Math.PI / 2, 0, 0]} name="groundPlane" visible={false}>
                <meshStandardMaterial color="white" />
            </Plane>
        </>
    );
}