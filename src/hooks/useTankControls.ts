import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const MOVE_SPEED = 2.5; // units per second
const ROTATE_SPEED = 1.8; // radians per second

export function useTankControls(groupRef: React.RefObject<THREE.Group | null>) {
  const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});
  const [isMoving, setIsMoving] = useState(false);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [event.key.toLowerCase()]: true }));
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [event.key.toLowerCase()]: false }));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Movement logic extracted into a callback triggered by useFrame
  const updateMovement = useCallback((delta: number) => {
    if (!groupRef.current) return;

    const moveDistance = MOVE_SPEED * delta;
    const rotateAngle = ROTATE_SPEED * delta;
    let currentlyMoving = false;

    if (keysPressed['w'] || keysPressed['arrowup']) {
        groupRef.current.translateZ(-moveDistance);
        currentlyMoving = true;
    }
    if (keysPressed['s'] || keysPressed['arrowdown']) {
        groupRef.current.translateZ(moveDistance);
        currentlyMoving = true;
    }
    if (keysPressed['a'] || keysPressed['q']) {
      groupRef.current.rotateY(rotateAngle);
      currentlyMoving = true;
    }
    if (keysPressed['d']) {
      groupRef.current.rotateY(-rotateAngle);
      currentlyMoving = true;
    }
    setIsMoving(currentlyMoving);

  }, [keysPressed, groupRef]); // Dependencies

  return { isMoving, updateMovement };
}