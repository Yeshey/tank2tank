// src/components/game/Tank.tsx
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { TankModel } from './TankModel';
import { PlayerNameTag } from './PlayerNameTag';
import { useTankControls } from '../../hooks/useTankControls';
import { useTurretAiming } from '../../hooks/useTurretAiming';
// Import constants for dimensions
import { BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH } from '../../constants'; // Adjust path

// Props definition - remove props intended only for the group if not needed by RigidBody
interface TankProps { // Simplified props - only what the Tank logic needs
  name?: string;
  position?: THREE.Vector3 | [number, number, number];
  // Add other props explicitly if they SHOULD be passed to RigidBody, e.g., userData
}

export interface TankRef {
    rigidBody: RapierRigidBody | null;
    group: THREE.Group | null;
}

export const Tank = forwardRef<TankRef, TankProps>(
    ({ name = 'Tank', position = [0, 0.5, 0] /* Adjusted default pos */ }, ref) => { // Removed {...props}

        const rigidBodyRef = useRef<RapierRigidBody>(null);
        const visualGroupRef = useRef<THREE.Group>(null);
        const turretRef = useRef<THREE.Group>(null);
        const { scene } = useThree();

        const groundPlaneRef = useRef<THREE.Mesh | null>(
            scene.getObjectByName('groundPlane') as THREE.Mesh ||
            scene.getObjectByName('fallbackGroundPlane') as THREE.Mesh ||
            null
        );

        const { isMoving, updateMovement } = useTankControls(rigidBodyRef);
        const { updateAiming } = useTurretAiming(turretRef, visualGroupRef, groundPlaneRef);

        useImperativeHandle(ref, () => ({
            rigidBody: rigidBodyRef.current,
            group: visualGroupRef.current
        }));

        useFrame((state, delta) => {
            if (!rigidBodyRef.current) return; // Ensure rigidbody exists
            updateMovement(delta);
            updateAiming(delta);
        });

        return (
            <RigidBody
                ref={rigidBodyRef}
                colliders={false}
                position={position}
                mass={50}
                linearDamping={0.5}
                angularDamping={0.8}
                // --- Allow only Y rotation ---
                enabledRotations={[false, true, false]}
                ccd={true}
                // {...props} // --- REMOVED PROP SPREADING ---
            >
                <TankModel ref={visualGroupRef} turretRef={turretRef}>
                    <PlayerNameTag name={name} visible={!isMoving} />
                </TankModel>
                <CuboidCollider
                    args={[BODY_WIDTH / 2, BODY_HEIGHT / 2, BODY_DEPTH / 2]}
                    position={[0, BODY_HEIGHT / 2, 0]}
                />
            </RigidBody>
        );
    }
);

Tank.displayName = 'Tank';