import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { TankRef } from '../game/Tank';
// Import constants
import {
    BASE_CAMERA_OFFSET,
    LOOK_AT_OFFSET,
    MOUSE_INFLUENCE_FACTOR,
    POSITION_LERP_FACTOR,
    LOOK_AT_LERP_FACTOR
} from '../../constants'; // Adjust path if needed

// Helper vectors (keep these)
const tankPositionVec = new THREE.Vector3();
const tankQuaternion = new THREE.Quaternion();
const desiredBasePosition = new THREE.Vector3();
const mouseOffsetVec = new THREE.Vector3();
const finalDesiredPosition = new THREE.Vector3();
const targetLookAtVec = new THREE.Vector3();
const viewDirection = new THREE.Vector3();
const rightDirection = new THREE.Vector3();
const upDirection = new THREE.Vector3();

export function CameraRig({ tankRef }: { tankRef: React.RefObject<TankRef | null> }) {
    const { camera, size } = useThree();
    const mousePos = useRef({ x: 0, y: 0 });
    const currentCameraPosition = useRef(new THREE.Vector3().copy(camera.position));
    const currentLookAt = useRef(new THREE.Vector3());

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mousePos.current.x = (event.clientX / size.width) * 2 - 1;
            mousePos.current.y = -(event.clientY / size.height) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [size.width, size.height]);

    useFrame(() => {
        const visualGroup = tankRef.current?.group;
        if (!visualGroup) return;

        visualGroup.getWorldPosition(tankPositionVec);
        visualGroup.getWorldQuaternion(tankQuaternion);

        // Use constants for camera positioning
        desiredBasePosition.copy(BASE_CAMERA_OFFSET).applyQuaternion(tankQuaternion).add(tankPositionVec);

        camera.getWorldDirection(viewDirection);
        rightDirection.crossVectors(camera.up, viewDirection).normalize();
        upDirection.crossVectors(viewDirection, rightDirection).normalize();

        mouseOffsetVec.copy(rightDirection).multiplyScalar(mousePos.current.x * MOUSE_INFLUENCE_FACTOR)
                      .addScaledVector(upDirection, mousePos.current.y * MOUSE_INFLUENCE_FACTOR * 0.5);

        finalDesiredPosition.copy(desiredBasePosition).add(mouseOffsetVec);

        targetLookAtVec.copy(tankPositionVec).add(LOOK_AT_OFFSET); // Use constant

        // Use constants for interpolation factors
        currentCameraPosition.current.lerp(finalDesiredPosition, POSITION_LERP_FACTOR);
        currentLookAt.current.lerp(targetLookAtVec, LOOK_AT_LERP_FACTOR);

        camera.position.copy(currentCameraPosition.current);
        camera.lookAt(currentLookAt.current);
    });

    return null;
}