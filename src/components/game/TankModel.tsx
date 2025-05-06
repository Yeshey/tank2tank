import React, { forwardRef } from 'react';
import * as THREE from 'three';

// ... (keep constants)
const BODY_WIDTH = 1.5;
const BODY_HEIGHT = 0.6;
const BODY_DEPTH = 2.2;
const TURRET_RADIUS = 0.5;
const TURRET_HEIGHT = 0.5;
const BARREL_RADIUS = 0.1;
const BARREL_LENGTH = 1.5;

// Props for the model itself
// --- Correction: Remove Omit or ensure 'children' is NOT omitted ---
// We extend the group props, which already includes children.
interface TankModelProps extends React.ComponentPropsWithoutRef<'group'> {
    turretRef: React.Ref<THREE.Group>; // Expect a ref for the turret group
}

// Using forwardRef to potentially accept refs for the main group if needed later
export const TankModel = forwardRef<THREE.Group, TankModelProps>(
    ({ turretRef, ...props }, ref) => { // props now implicitly includes children
        return (
            // Pass ref and spread the rest of the props (including children)
            <group ref={ref} {...props}>
                {/* Tank Body */}
                <mesh castShadow receiveShadow position={[0, BODY_HEIGHT / 2, 0]}>
                    <boxGeometry args={[BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH]} />
                    <meshStandardMaterial color="#d95030" flatShading />
                </mesh>

                {/* Turret Group */}
                <group ref={turretRef} position={[0, BODY_HEIGHT + 0.01, -0.2]}>
                    {/* Turret */}
                    <mesh castShadow receiveShadow position={[0, TURRET_HEIGHT / 2, 0]}>
                        <cylinderGeometry args={[TURRET_RADIUS, TURRET_RADIUS, TURRET_HEIGHT, 32]} />
                        <meshStandardMaterial color="#e66f4f" flatShading />
                    </mesh>
                    {/* Barrel */}
                    <mesh castShadow position={[0, TURRET_HEIGHT / 2, -(TURRET_RADIUS + BARREL_LENGTH / 2)]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[BARREL_RADIUS, BARREL_RADIUS, BARREL_LENGTH, 16]} />
                        <meshStandardMaterial color="#7d8a94" flatShading />
                    </mesh>
                </group>
                {/* Render children passed down from Tank.tsx */}
                {props.children}
            </group>
        );
    }
);

TankModel.displayName = 'TankModel';