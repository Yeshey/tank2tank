// src/components/scene/CameraRig.tsx
import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { TankRef } from '../game/Tank';
import {
    BASE_CAMERA_OFFSET,
    LOOK_AT_OFFSET,
    MAX_WORLD_PAN_DISTANCE, // This becomes the pan distance for the SHORTER screen dimension edge
    POSITION_LERP_FACTOR,
    LOOK_AT_LERP_FACTOR,
    MIN_CAMERA_Z_OFFSET_FOR_FULL_PAN,
    Z_PAN_SCALING_AT_MIN_CZO,
    USE_ASPECT_RATIO_FOR_PAN,
} from '../../constants';

const tankPositionVec = new THREE.Vector3();
const desiredBaseCameraPosition = new THREE.Vector3();
const worldPanOffset = new THREE.Vector3();
const finalDesiredCameraPosition = new THREE.Vector3();
const desiredPanLookAtTargetOnPlane = new THREE.Vector3();
const worldXAxis = new THREE.Vector3(1, 0, 0); // Not directly used in this version's pan calc but good to have
const worldZAxis = new THREE.Vector3(0, 0, 1); // Not directly used

export function CameraRig({ tankRef }: { tankRef: React.RefObject<TankRef | null> }) {
    const { camera, size } = useThree();
    const mousePosNormalized = useRef({ x: 0, y: 0 });
    const currentCameraPosition = useRef(new THREE.Vector3());
    const currentLookAt = useRef(new THREE.Vector3());
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (tankRef.current?.group && !isInitialized) {
            const tempTankPos = new THREE.Vector3();
            tankRef.current.group.getWorldPosition(tempTankPos);
            const initialCameraPos = tempTankPos.clone().add(BASE_CAMERA_OFFSET);
            camera.position.copy(initialCameraPos);
            currentCameraPosition.current.copy(initialCameraPos);
            const initialLookTarget = tempTankPos.clone().add(LOOK_AT_OFFSET);
            camera.lookAt(initialLookTarget);
            currentLookAt.current.copy(initialLookTarget);
            setIsInitialized(true);
        }
        const handleMouseMove = (event: MouseEvent) => {
            mousePosNormalized.current.x = (event.clientX / size.width) * 2 - 1;
            mousePosNormalized.current.y = -(event.clientY / size.height) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [size.width, size.height, tankRef, isInitialized, camera]);

    useFrame(() => {
        if (!isInitialized || !tankRef.current?.group) return;

        const visualGroup = tankRef.current.group;
        visualGroup.getWorldPosition(tankPositionVec);

        desiredBaseCameraPosition.copy(tankPositionVec).add(BASE_CAMERA_OFFSET);

        const normalizedMouseX = mousePosNormalized.current.x;
        const normalizedMouseY = mousePosNormalized.current.y;

        let panXMultiplier = MAX_WORLD_PAN_DISTANCE;
        let panZMultiplier = MAX_WORLD_PAN_DISTANCE;

        if (USE_ASPECT_RATIO_FOR_PAN) { // Check the new constant
            const screenAspectRatio = size.width / size.height;
            if (screenAspectRatio > 1) { // Landscape
                panZMultiplier = MAX_WORLD_PAN_DISTANCE * screenAspectRatio;
            } else if (screenAspectRatio < 1) { // Portrait
                panXMultiplier = MAX_WORLD_PAN_DISTANCE / screenAspectRatio;
            }
            // If square or USE_ASPECT_RATIO_FOR_PAN is false, multipliers remain MAX_WORLD_PAN_DISTANCE
        }
        // If USE_ASPECT_RATIO_FOR_PAN is false, panXMultiplier and panZMultiplier
        // will remain initialized to MAX_WORLD_PAN_DISTANCE, giving uniform pan reach.

        const panAmountX = normalizedMouseX * panXMultiplier;
        let panAmountZ = -normalizedMouseY * panZMultiplier;

        // Adaptive Z-Pan based on CAMERA_Z_OFFSET (using BASE_CAMERA_OFFSET.z)
        const actualCameraZOffset = BASE_CAMERA_OFFSET.z; // Ensure this uses the Z from BASE_CAMERA_OFFSET
        let zPanScale = 1.0;
        if (actualCameraZOffset < MIN_CAMERA_Z_OFFSET_FOR_FULL_PAN) {
            if (MIN_CAMERA_Z_OFFSET_FOR_FULL_PAN <= 0) {
                zPanScale = Z_PAN_SCALING_AT_MIN_CZO;
            } else {
                const t = Math.max(0, actualCameraZOffset) / MIN_CAMERA_Z_OFFSET_FOR_FULL_PAN;
                zPanScale = Z_PAN_SCALING_AT_MIN_CZO + t * (1.0 - Z_PAN_SCALING_AT_MIN_CZO);
            }
        }
        panAmountZ *= zPanScale;

        worldPanOffset.set(panAmountX, 0, panAmountZ);

        finalDesiredCameraPosition.copy(desiredBaseCameraPosition).add(worldPanOffset);

        // Adaptive Look-At Y
        let lookAtTargetY = tankPositionVec.y + LOOK_AT_OFFSET.y;
        if (normalizedMouseY < 0) {
            const yAdjustFactor = -normalizedMouseY;
            // If aspect ratio is ignored, panZMultiplier is MAX_WORLD_PAN_DISTANCE.
            // If aspect ratio is used, panZMultiplier reflects that.
            const potentialZPanForTilt = Math.abs(-normalizedMouseY * panZMultiplier);
            const yDropAmountBase = potentialZPanForTilt * 0.15;
            const yDropAmount = yDropAmountBase * zPanScale;
            lookAtTargetY -= yAdjustFactor * yDropAmount;
        }

        desiredPanLookAtTargetOnPlane
            .copy(tankPositionVec)
            .add(worldPanOffset)
            .setY(lookAtTargetY);

        currentCameraPosition.current.lerp(finalDesiredCameraPosition, POSITION_LERP_FACTOR);
        currentLookAt.current.lerp(desiredPanLookAtTargetOnPlane, LOOK_AT_LERP_FACTOR);

        camera.position.copy(currentCameraPosition.current);
        camera.lookAt(currentLookAt.current);
    });

    return null;
}