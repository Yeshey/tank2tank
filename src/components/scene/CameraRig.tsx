import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Camera settings
const baseCameraOffset = new THREE.Vector3(0, 12, 14); // Increased Y and Z for higher/further view
const lookAtOffset = new THREE.Vector3(0, 0.5, 0);     // Point slightly above tank base
const mouseInfluenceFactor = 3.5;                     // Panning sensitivity
const positionLerpFactor = 0.06;                      // Camera position smoothness (smaller = smoother)
const lookAtLerpFactor = 0.08;                        // Camera lookAt smoothness

// Helper vectors
const tankPositionVec = new THREE.Vector3();
const tankQuaternion = new THREE.Quaternion();
const desiredBasePosition = new THREE.Vector3();
const mouseOffsetVec = new THREE.Vector3();
const finalDesiredPosition = new THREE.Vector3();
const targetLookAtVec = new THREE.Vector3();
const viewDirection = new THREE.Vector3();
const rightDirection = new THREE.Vector3();
const upDirection = new THREE.Vector3();


// Accepts the potentially null ref type
export function CameraRig({ tankRef }: { tankRef: React.RefObject<THREE.Group | null> }) {
  const { camera, size } = useThree();
  const mousePos = useRef({ x: 0, y: 0 });
  // Initialize refs with current camera state to avoid jump on first frame if possible
  const currentCameraPosition = useRef(new THREE.Vector3().copy(camera.position));
  const currentLookAt = useRef(new THREE.Vector3()); // Will be set based on tank pos


  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePos.current.x = (event.clientX / size.width) * 2 - 1;
      mousePos.current.y = -(event.clientY / size.height) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [size.width, size.height]); // Dependencies only size

  useFrame(() => {
    if (!tankRef.current) return; // Don't update if tank doesn't exist yet

    // --- Get Tank State ---
    tankRef.current.getWorldPosition(tankPositionVec);
    tankRef.current.getWorldQuaternion(tankQuaternion);

    // --- Calculate Target Camera Position ---
    // 1. Base position relative to tank orientation
    desiredBasePosition.copy(baseCameraOffset).applyQuaternion(tankQuaternion).add(tankPositionVec);

    // 2. Panning offset based on mouse position
    //    Calculate based on *current* camera orientation for screen-relative panning
    camera.getWorldDirection(viewDirection);
    rightDirection.crossVectors(camera.up, viewDirection).normalize();
    upDirection.crossVectors(viewDirection, rightDirection).normalize(); // Use camera's local up

    mouseOffsetVec.copy(rightDirection).multiplyScalar(mousePos.current.x * mouseInfluenceFactor)
                  .addScaledVector(upDirection, mousePos.current.y * mouseInfluenceFactor * 0.5); // Less Y influence

    // 3. Final desired position = base + mouse pan offset
    finalDesiredPosition.copy(desiredBasePosition).add(mouseOffsetVec);

    // --- Calculate Target LookAt --- (Relative to tank, not affected by panning)
    targetLookAtVec.copy(tankPositionVec).add(lookAtOffset);

    // --- Smooth Interpolation ---
    currentCameraPosition.current.lerp(finalDesiredPosition, positionLerpFactor);
    currentLookAt.current.lerp(targetLookAtVec, lookAtLerpFactor);

    // --- Apply to Camera ---
    camera.position.copy(currentCameraPosition.current);
    camera.lookAt(currentLookAt.current);
  });

  return null; // Component manages camera, doesn't render anything itself
}