import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const TURRET_ROTATE_SPEED = Math.PI * 0.8; // Radians per second

// Reusable helper vectors (defined outside hook)
const targetPoint = new THREE.Vector3();
const turretWorldPos = new THREE.Vector3();
const tankWorldQuat = new THREE.Quaternion();
const targetWorldQuat = new THREE.Quaternion();
const parentInverseQuat = new THREE.Quaternion();
const targetLocalQuat = new THREE.Quaternion();
const yAxis = new THREE.Vector3(0, 1, 0); // Constant Y axis

export function useTurretAiming(
    turretRef: React.RefObject<THREE.Group | null>,
    tankRef: React.RefObject<THREE.Group | null>,
    groundPlaneRef: React.RefObject<THREE.Mesh | null>
) {
    const { camera, raycaster, pointer } = useThree();

    const updateAiming = useCallback((delta: number) => {
        // --- Guard Clauses ---
        if (!turretRef.current || !tankRef.current || !groundPlaneRef.current) {
            // console.log("Aiming refs not ready", { turret: !!turretRef.current, tank: !!tankRef.current, ground: !!groundPlaneRef.current });
            return;
        }

        // --- Raycasting ---
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(groundPlaneRef.current);

        if (intersects.length > 0) {
            targetPoint.copy(intersects[0].point); // Target point on the ground

            // --- World Calculations ---
            turretRef.current.getWorldPosition(turretWorldPos); // Turret's world position
            tankRef.current.getWorldQuaternion(tankWorldQuat);  // Tank's world orientation

            // --- Angle Calculation (XZ plane) ---
            const dx = targetPoint.x - turretWorldPos.x;
            const dz = targetPoint.z - turretWorldPos.z;
            // Angle required in world space to point from turret to target (relative to +Z axis)
            const targetWorldAngleY = Math.atan2(dx, dz);

            // --- Target World Quaternion ---
            // Quaternion representing the desired WORLD orientation of the turret
            targetWorldQuat.setFromAxisAngle(yAxis, targetWorldAngleY);

            // --- Convert World to Local Rotation ---
            // We need the turret's LOCAL rotation that achieves the target WORLD rotation.
            // targetWorld = tankWorld * targetLocal  =>  targetLocal = inverse(tankWorld) * targetWorld
            parentInverseQuat.copy(tankWorldQuat).invert();
            targetLocalQuat.copy(parentInverseQuat).multiply(targetWorldQuat);

            // --- Apply Rotation with Fixed Speed ---
            const step = TURRET_ROTATE_SPEED * delta;
            if (!turretRef.current.quaternion.equals(targetLocalQuat)) {
                 turretRef.current.quaternion.rotateTowards(targetLocalQuat, step);
            }

            // --- Debugging (Uncomment if needed) ---
            // console.log("Aiming:", {
            //     target: targetPoint.toArray().map(n => n.toFixed(2)),
            //     turretWorld: turretWorldPos.toArray().map(n => n.toFixed(2)),
            //     worldAngle: targetWorldAngleY.toFixed(2),
            //     currentLocalQuat: turretRef.current.quaternion.toArray().map(n => n.toFixed(2)),
            //     targetLocalQuat: targetLocalQuat.toArray().map(n => n.toFixed(2)),
            // });


        } else {
             // console.log("No intersection with ground plane");
        }

    }, [turretRef, tankRef, groundPlaneRef, camera, raycaster, pointer]); // Dependencies

    return { updateAiming };
}