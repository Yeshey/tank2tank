import React, { forwardRef } from 'react';
import * as THREE from 'three';
// Import constants
import {
    BODY_WIDTH,
    BODY_HEIGHT,
    BODY_DEPTH,
    TURRET_RADIUS,
    TURRET_HEIGHT,
    BARREL_RADIUS,
    BARREL_LENGTH,
    TURRET_GROUP_Y_OFFSET,
    TURRET_GROUP_Z_OFFSET,
    BARREL_Z_OFFSET,
    COLLIDER_Y_OFFSET // Though collider is separate, keep height constant reference consistent
} from '../../constants'; // Adjust path if needed

interface TankModelProps extends React.ComponentPropsWithoutRef<'group'> {
    turretRef: React.Ref<THREE.Group>;
}

export const TankModel = forwardRef<THREE.Group, TankModelProps>(
    ({ turretRef, ...props }, ref) => {
        return (
            <group ref={ref} {...props}>
                {/* Tank Body */}
                {/* Position offset is handled by the parent RigidBody/Group now */}
                <mesh castShadow receiveShadow position={[0, BODY_HEIGHT / 2, 0]}>
                    <boxGeometry args={[BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH]} />
                    <meshStandardMaterial color="#d95030" flatShading />
                </mesh>

                {/* Turret Group */}
                {/* Use constants for positioning relative to the main group's origin */}
                <group ref={turretRef} position={[0, TURRET_GROUP_Y_OFFSET, TURRET_GROUP_Z_OFFSET]}>
                    {/* Turret */}
                    <mesh castShadow receiveShadow position={[0, TURRET_HEIGHT / 2, 0]}>
                        <cylinderGeometry args={[TURRET_RADIUS, TURRET_RADIUS, TURRET_HEIGHT, 32]} />
                        <meshStandardMaterial color="#e66f4f" flatShading />
                    </mesh>
                    {/* Barrel */}
                    <mesh castShadow position={[0, TURRET_HEIGHT / 2, BARREL_Z_OFFSET]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[BARREL_RADIUS, BARREL_RADIUS, BARREL_LENGTH, 16]} />
                        <meshStandardMaterial color="#7d8a94" flatShading />
                    </mesh>
                </group>
                {/* Render children passed down */}
                {props.children}
            </group>
        );
    }
);

TankModel.displayName = 'TankModel';