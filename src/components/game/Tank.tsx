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
  ({ name = 'Tank', position = [0, 0.5, 0], groundPlaneRef }, ref) => { // Removed props spread

      const rigidBodyRef = useRef<RapierRigidBody>(null);
      const visualGroupRef = useRef<THREE.Group>(null);
      const turretRef = useRef<THREE.Group>(null);
      // ... hooks ...
      const { isMoving, updateMovement } = useTankControls(rigidBodyRef);
      const { updateAiming } = useTurretAiming(turretRef, visualGroupRef, groundPlaneRef);


      useImperativeHandle(ref, () => ({
          rigidBody: rigidBodyRef.current,
          group: visualGroupRef.current
      }));

      useFrame((_state, delta) => {
          if (!rigidBodyRef.current) return;
          updateMovement(delta);
          updateAiming(delta);
      });

      return (
          <RigidBody
              ref={rigidBodyRef}
              colliders={false} // We provide the collider explicitly
              position={position} // Initial position
              mass={50} // Keep mass or adjust if needed
              // Consider slightly adjusting damping based on new physics constants
              linearDamping={0.5} // Keep or tweak (e.g., slightly lower for more slide?)
              angularDamping={0.8} // Keep or tweak (e.g., slightly lower for more drift?)
              enabledRotations={[false, true, false]}
              ccd={true}
          >
              {/* TankModel now includes wheels */}
              <TankModel ref={visualGroupRef} turretRef={turretRef}>
                  {/* Make sure name tag is positioned correctly relative to new model origin */}
                  <PlayerNameTag name={name} visible={!isMoving} />
              </TankModel>

              {/* Cuboid Collider - Use updated COLLIDER_Y_OFFSET */}
              <CuboidCollider
                  args={[BODY_WIDTH / 2, BODY_HEIGHT / 2, BODY_DEPTH / 2]}
                  // Position is relative to the RigidBody's center, which is the visual model's center
                  position={[0, COLLIDER_Y_OFFSET, 0]} // COLLIDER_Y_OFFSET is 0
              />
          </RigidBody>
      );
  }
);

Tank.displayName = 'Tank';