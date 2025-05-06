// src/components/scene/CameraRig.tsx
import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { TankRef } from '../game/Tank';
// Import constants
import {
    BASE_CAMERA_OFFSET,
    LOOK_AT_OFFSET,
    MOUSE_PAN_FACTOR,       // Use the new panning factor constant
    POSITION_LERP_FACTOR,
    LOOK_AT_LERP_FACTOR
} from '../../constants'; // Adjust path if needed

// Helper vectors
const tankPositionVec = new THREE.Vector3();
const desiredBasePosition = new THREE.Vector3();
const mouseOffsetVec = new THREE.Vector3(); // This will be the world-space pan offset
const finalDesiredPosition = new THREE.Vector3();
const baseLookAtVec = new THREE.Vector3();  // LookAt before panning
const finalTargetLookAtVec = new THREE.Vector3(); // LookAt after panning
const worldXAxis = new THREE.Vector3(1, 0, 0); // World X direction
const worldZAxis = new THREE.Vector3(0, 0, 1); // World Z direction


export function CameraRig({ tankRef }: { tankRef: React.RefObject<TankRef | null> }) {
    const { camera, size } = useThree();
    const mousePos = useRef({ x: 0, y: 0 }); // Normalized mouse coords (-1 to 1)
    // Initialize refs with current camera state to potentially reduce initial jump
    const currentCameraPosition = useRef(new THREE.Vector3().copy(camera.position));
    const currentLookAt = useRef(new THREE.Vector3());


    useEffect(() => {
        // Only track mouse movement
        const handleMouseMove = (event: MouseEvent) => {
            mousePos.current.x = (event.clientX / size.width) * 2 - 1;
            mousePos.current.y = -(event.clientY / size.height) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [size.width, size.height]); // Rerun only if canvas size changes

    useFrame(() => {
        const visualGroup = tankRef.current?.group;
        if (!visualGroup) return; // Tank not ready

        // Get tank's current world position
        visualGroup.getWorldPosition(tankPositionVec);

        // --- Calculate Target Camera Position ---

        // 1. Base position is tank position plus the fixed world offset
        desiredBasePosition.copy(tankPositionVec).add(BASE_CAMERA_OFFSET);

        // 2. Calculate the Panning Offset in WORLD SPACE (parallel to ground)
        //    Reset the offset vector each frame
        mouseOffsetVec.set(0, 0, 0);
        // Add world X offset based on horizontal mouse position
        mouseOffsetVec.addScaledVector(worldXAxis, mousePos.current.x * MOUSE_PAN_FACTOR);
        // Add world Z offset based on vertical mouse position (Mouse Y up -> World Z negative/forward)
        // Adjust Z direction if needed based on preference (e.g., worldZAxis or negative worldZAxis)
        mouseOffsetVec.addScaledVector(worldZAxis, -mousePos.current.y * MOUSE_PAN_FACTOR * 0.5); // Less vertical pan influence


        // 3. Final camera position target = Base position + World panning offset
        finalDesiredPosition.copy(desiredBasePosition).add(mouseOffsetVec);

        // --- Calculate Camera's Look-At Target ---

        // 1. Base look-at is tank position plus a fixed vertical offset
        baseLookAtVec.copy(tankPositionVec).add(LOOK_AT_OFFSET);

        // 2. Final look-at target = Base look-at + World panning offset
        //    **Crucially, we apply the SAME pan offset to the look-at target.**
        //    This keeps the viewing direction parallel during the pan.
        finalTargetLookAtVec.copy(baseLookAtVec).add(mouseOffsetVec);


        // --- Smoothly Interpolate (Lerp) ---
        currentCameraPosition.current.lerp(finalDesiredPosition, POSITION_LERP_FACTOR);
        currentLookAt.current.lerp(finalTargetLookAtVec, LOOK_AT_LERP_FACTOR);

        // --- Apply to Camera ---
        camera.position.copy(currentCameraPosition.current);
        camera.lookAt(currentLookAt.current);
    });

    return null; // Controls camera, renders nothing
}