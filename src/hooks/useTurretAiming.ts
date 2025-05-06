import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
// Import constant
import { TURRET_ROTATE_SPEED } from '../constants'; // Adjust path if needed

// Helper vectors/quaternions (keep these)
const targetPoint = new THREE.Vector3();
const turretWorldPos = new THREE.Vector3();
const tankWorldQuat = new THREE.Quaternion();
const targetWorldQuat = new THREE.Quaternion();
const parentInverseQuat = new THREE.Quaternion();
const targetLocalQuat = new THREE.Quaternion();
const yAxis = new THREE.Vector3(0, 1, 0);
const epsilon = 1e-5; // Keep epsilon

export function useTurretAiming(
    turretRef: React.RefObject<THREE.Group | null>,
    tankVisualRef: React.RefObject<THREE.Group | null>,
    groundPlaneRef: React.RefObject<THREE.Mesh | null> // Needs to be the raycast plane mesh
) {
    const { camera, raycaster, pointer } = useThree();

    const updateAiming = useCallback((delta: number) => {
        if (!turretRef.current || !tankVisualRef.current || !groundPlaneRef.current) {
            return; // Exit if refs aren't ready
        }

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(groundPlaneRef.current);

        if (intersects.length > 0) {
            targetPoint.copy(intersects[0].point);
            turretRef.current.getWorldPosition(turretWorldPos);
            tankVisualRef.current.getWorldQuaternion(tankWorldQuat);

            const dx = targetPoint.x - turretWorldPos.x;
            const dz = targetPoint.z - turretWorldPos.z;

            // --- Correction: Add Math.PI for 180-degree offset ---
            // This assumes the barrel points down local -Z when turret rotation is 0
            const targetWorldAngleY = Math.atan2(dx, dz) + Math.PI;

            targetWorldQuat.setFromAxisAngle(yAxis, targetWorldAngleY);
            parentInverseQuat.copy(tankWorldQuat).invert();
            targetLocalQuat.copy(parentInverseQuat).multiply(targetWorldQuat);

            const step = TURRET_ROTATE_SPEED * delta;
            const currentQuat = turretRef.current.quaternion;
            const angleDiff = currentQuat.angleTo(targetLocalQuat);

            if (angleDiff > epsilon) {
                const rotateStep = Math.min(step, angleDiff); // Prevent overshooting
                currentQuat.rotateTowards(targetLocalQuat, rotateStep);
            }
        }
    }, [turretRef, tankVisualRef, groundPlaneRef, camera, raycaster, pointer]); // Dependencies

    return { updateAiming };
}