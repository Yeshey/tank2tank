import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber'; // Removed useThree here
import * as THREE from 'three';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { TankModel } from './TankModel';
import { PlayerNameTag } from './PlayerNameTag';
import { useTankControls } from '../../hooks/useTankControls';
import { useTurretAiming } from '../../hooks/useTurretAiming';
import { BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH, COLLIDER_Y_OFFSET } from '../../constants'; // Added COLLIDER_Y_OFFSET

// Update Props to accept the ground plane ref
interface TankProps {
  name?: string;
  position?: THREE.Vector3 | [number, number, number];
  groundPlaneRef: React.RefObject<THREE.Mesh | null>; // Add this prop
}

export interface TankRef {
    rigidBody: RapierRigidBody | null;
    group: THREE.Group | null;
}

export const Tank = forwardRef<TankRef, TankProps>(
    ({ name = 'Tank', position = [0, 0.5, 0], groundPlaneRef }, ref) => { // Destructure groundPlaneRef

        const rigidBodyRef = useRef<RapierRigidBody>(null);
        const visualGroupRef = useRef<THREE.Group>(null);
        const turretRef = useRef<THREE.Group>(null);
        // Removed useThree and the logic to find plane by name

        const { isMoving, updateMovement } = useTankControls(rigidBodyRef);
        // Pass the prop groundPlaneRef to the aiming hook
        const { updateAiming } = useTurretAiming(turretRef, visualGroupRef, groundPlaneRef);

        useImperativeHandle(ref, () => ({
            rigidBody: rigidBodyRef.current,
            group: visualGroupRef.current
        }));

        useFrame((_state, delta) => { // <-- Use underscore prefix
          if (!rigidBodyRef.current) return;
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
                enabledRotations={[false, true, false]}
                ccd={true}
                // {...props} // Keep props spread removed
            >
                <TankModel ref={visualGroupRef} turretRef={turretRef}>
                    <PlayerNameTag name={name} visible={!isMoving} />
                </TankModel>
                <CuboidCollider
                    args={[BODY_WIDTH / 2, BODY_HEIGHT / 2, BODY_DEPTH / 2]}
                    // Use constant for collider offset
                    position={[0, COLLIDER_Y_OFFSET, 0]}
                />
            </RigidBody>
        );
    }
);

Tank.displayName = 'Tank';