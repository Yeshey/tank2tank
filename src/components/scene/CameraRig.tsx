// src/components/scene/CameraRig.tsx
import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { TankRef } from '../game/Tank';
// Import constants (ensure path is correct)
import {
    BASE_CAMERA_OFFSET,
    LOOK_AT_OFFSET,
    MOUSE_INFLUENCE_FACTOR,
    POSITION_LERP_FACTOR,
    LOOK_AT_LERP_FACTOR
} from '../../constants';

// Helper vectors (no change needed)
const tankPositionVec = new THREE.Vector3();
const tankQuaternion = new THREE.Quaternion(); // Still need this for applying BASE_CAMERA_OFFSET correctly if it's meant to be relative initially
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

    // Effect to track mouse position (normalized)
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mousePos.current.x = (event.clientX / size.width) * 2 - 1; // -1 (left) to +1 (right)
            mousePos.current.y = -(event.clientY / size.height) * 2 + 1; // -1 (bottom) to +1 (top)
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [size.width, size.height]);

    useFrame(() => {
        const visualGroup = tankRef.current?.group;
        if (!visualGroup) return; // Tank not ready yet

        // Get current world position of the tank's visual representation
        visualGroup.getWorldPosition(tankPositionVec);

        // --- Calculate Camera's Target Position ---

        // 1. Determine the base position: Tank Position + Fixed Offset
        //    This offset keeps the camera at a consistent distance and height
        //    relative to the world, following the tank.
        desiredBasePosition.copy(tankPositionVec).add(BASE_CAMERA_OFFSET);

        // 2. Calculate the panning offset based on the mouse position
        //    This offset shifts the camera view *parallel* to the screen plane.
        camera.getWorldDirection(viewDirection); // Where the camera is currently looking
        // Calculate the camera's local "right" vector in world space
        rightDirection.crossVectors(camera.up, viewDirection).normalize();
        // Calculate the camera's local "up" vector in world space (orthogonal to view and right)
        upDirection.crossVectors(viewDirection, rightDirection).normalize();

        // Calculate the offset vector: Move along the camera's right/up based on mouse coords
        mouseOffsetVec
            .copy(rightDirection) // Start with camera's right direction
            .multiplyScalar(mousePos.current.x * MOUSE_INFLUENCE_FACTOR) // Scale by horizontal mouse pos & factor
            .addScaledVector(upDirection, mousePos.current.y * MOUSE_INFLUENCE_FACTOR * 0.5); // Add camera's up direction scaled by vertical mouse pos (less vertical influence)

        // 3. Final target position = Base position + Mouse panning offset
        finalDesiredPosition.copy(desiredBasePosition).add(mouseOffsetVec);

        // --- Calculate Camera's Look-At Target ---
        // This target ONLY depends on the tank's position and a fixed vertical offset.
        // It is NOT influenced by the mouse panning offset.
        targetLookAtVec.copy(tankPositionVec).add(LOOK_AT_OFFSET);

        // --- Smoothly Interpolate (Lerp) ---
        // Move the camera's current position towards the final desired position
        currentCameraPosition.current.lerp(finalDesiredPosition, POSITION_LERP_FACTOR);
        // Move the camera's current look-at point towards the target look-at point
        currentLookAt.current.lerp(targetLookAtVec, LOOK_AT_LERP_FACTOR);

        // --- Apply to Camera ---
        camera.position.copy(currentCameraPosition.current);
        camera.lookAt(currentLookAt.current); // Make the camera look at the interpolated target
    });

    return null; // This component only controls the camera
}