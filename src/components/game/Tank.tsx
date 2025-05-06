// src/components/game/Tank.tsx
import React, { useRef, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TankModel } from './TankModel';
import { PlayerNameTag } from './PlayerNameTag';
import { useTankControls } from '../../hooks/useTankControls';
import { useTurretAiming } from '../../hooks/useTurretAiming';

interface TankProps extends Omit<React.ComponentPropsWithoutRef<'group'>, 'position'> {
  name?: string;
  position?: THREE.Vector3 | [number, number, number];
}

export const Tank = forwardRef<THREE.Group, TankProps>(
    ({ name = 'Tank', position = [0, 0, 0], ...props }, ref) => {

        const groupRef = ref as React.RefObject<THREE.Group>;
        const turretRef = useRef<THREE.Group>(null);
        const { scene } = useThree();

        const groundPlaneRef = useRef<THREE.Mesh | null>(
            scene.getObjectByName('groundPlane') as THREE.Mesh ||
            scene.getObjectByName('fallbackGroundPlane') as THREE.Mesh ||
            null
        );

        const { isMoving, updateMovement } = useTankControls(groupRef);
        const { updateAiming } = useTurretAiming(turretRef, groupRef, groundPlaneRef);

        useFrame((state, delta) => {
            if (!groupRef.current) return; // Early exit if tank isn't mounted yet
            updateMovement(delta);
            updateAiming(delta);
        });

        return (
             // --- Pass PlayerNameTag as a child ---
            <TankModel ref={groupRef} turretRef={turretRef} position={position} {...props}>
                 <PlayerNameTag name={name} visible={!isMoving} />
            </TankModel>
        );
    }
);

Tank.displayName = 'Tank';