import React, { forwardRef } from 'react';
import * as THREE from 'three';
// Import the RoundedBox *component* from Drei
import { RoundedBox } from '@react-three/drei';

// Import constants
import {
    BODY_WIDTH,
    BODY_HEIGHT,
    BODY_DEPTH,
    BODY_EDGE_RADIUS,
    BODY_SMOOTHNESS, // Corresponds to 'segments' arg in RoundedBox
    TURRET_RADIUS,
    TURRET_HEIGHT,
    BARREL_RADIUS,
    BARREL_LENGTH,
    TURRET_GROUP_Y_OFFSET,
    TURRET_GROUP_Z_OFFSET,
    BARREL_Z_OFFSET,
    WHEEL_RADIUS,
    WHEEL_THICKNESS,
    WHEEL_SPACING,
    WHEEL_Y_OFFSET,
    WHEEL_X_OFFSET
} from '../../constants';

interface TankModelProps extends React.ComponentPropsWithoutRef<'group'> {
    turretRef: React.Ref<THREE.Group>;
}

// Wheel component remains the same
function Wheel(props: React.ComponentPropsWithoutRef<'mesh'>) {
    return (
        <mesh castShadow receiveShadow {...props}>
            <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_THICKNESS, 12]} />
            <meshLambertMaterial color="#555555" />
        </mesh>
    );
}


export const TankModel = forwardRef<THREE.Group, TankModelProps>(
    ({ turretRef, ...props }, ref) => {

        const wheelZPositions = [ -WHEEL_SPACING, 0, WHEEL_SPACING ];

        return (
            <group ref={ref} {...props}>
                {/* Tank Body - Use Drei's RoundedBox component */}
                <RoundedBox
                    args={[BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH]} // Geometry args: width, height, depth
                    radius={BODY_EDGE_RADIUS}                   // Geometry arg: radius
                    smoothness={BODY_SMOOTHNESS}                // Geometry arg: segments
                    castShadow
                    receiveShadow
                    position={[0, 0, 0]}                        // Mesh position
                >
                    {/* Material props are passed as children or directly */}
                    <meshStandardMaterial
                        color="#d95030"
                        flatShading={false}
                        metalness={0.3}
                        roughness={0.7}
                    />
                </RoundedBox>

        {/* Temporarily comment out wheels */}
         {wheelZPositions.map((zPos, index) => (
            <Wheel key={`wheel-left-${index}`} position={[-WHEEL_X_OFFSET, WHEEL_Y_OFFSET, zPos]} rotation={[0, 0, Math.PI / 2]} />
        ))}
        {wheelZPositions.map((zPos, index) => (
            <Wheel key={`wheel-right-${index}`} position={[WHEEL_X_OFFSET, WHEEL_Y_OFFSET, zPos]} rotation={[0, 0, Math.PI / 2]} />
        ))}


                {/* Turret Group */}
                <group ref={turretRef} position={[0, TURRET_GROUP_Y_OFFSET, TURRET_GROUP_Z_OFFSET]}>
                    <mesh castShadow receiveShadow position={[0, 0, 0]}>
                        <cylinderGeometry args={[TURRET_RADIUS, TURRET_RADIUS, TURRET_HEIGHT, 32]} />
                        <meshStandardMaterial color="#e66f4f" flatShading={false} metalness={0.4} roughness={0.6} />
                    </mesh>
                    <mesh castShadow position={[0, 0, BARREL_Z_OFFSET]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[BARREL_RADIUS, BARREL_RADIUS, BARREL_LENGTH, 16]} />
                        <meshStandardMaterial color="#7d8a94" flatShading={false} metalness={0.6} roughness={0.5} />
                    </mesh>
                </group>

                {props.children}
            </group>
        );
    }
);

TankModel.displayName = 'TankModel';