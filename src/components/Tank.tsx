import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Tank dimensions
const BODY_WIDTH = 1.5;
const BODY_HEIGHT = 0.6;
const BODY_DEPTH = 2.2;
const TURRET_RADIUS = 0.5;
const TURRET_HEIGHT = 0.5;
const BARREL_RADIUS = 0.1;
const BARREL_LENGTH = 1.5;

// Movement speeds
const MOVE_SPEED = 2.5; // units per second
const ROTATE_SPEED = 1.8; // radians per second

interface TankProps extends THREE.Group {}

export function Tank(props: TankProps) {
  const groupRef = useRef<THREE.Group>(null!); // Ref for the whole tank group
  const turretRef = useRef<THREE.Group>(null!); // Ref for the turret group (turret + barrel)

  // State for movement keys
  const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});

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

  // Animation loop for movement
  useFrame((_state, delta) => {
    if (!groupRef.current || !turretRef.current) return;

    const moveDistance = MOVE_SPEED * delta;
    const rotateAngle = ROTATE_SPEED * delta;

    // Tank Body Movement (W/S for forward/backward, A/D for rotation)
    if (keysPressed['w']) {
      groupRef.current.translateZ(-moveDistance); // Move forward along local Z
    }
    if (keysPressed['s']) {
      groupRef.current.translateZ(moveDistance); // Move backward along local Z
    }
    if (keysPressed['a']) {
      groupRef.current.rotateY(rotateAngle); // Rotate left
    }
    if (keysPressed['d']) {
      groupRef.current.rotateY(-rotateAngle); // Rotate right
    }

    // Turret Rotation (ArrowLeft/ArrowRight) - Rotates relative to the tank body
     if (keysPressed['arrowleft']) {
       turretRef.current.rotateY(rotateAngle);
     }
     if (keysPressed['arrowright']) {
       turretRef.current.rotateY(-rotateAngle);
     }
  });

  return (
    <group ref={groupRef} {...props} dispose={null}>
      {/* Tank Body */}
      <mesh castShadow receiveShadow position={[0, BODY_HEIGHT / 2, 0]}>
        <boxGeometry args={[BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH]} />
        <meshStandardMaterial color="#d95030" flatShading />
      </mesh>

      {/* Turret Group (Turret + Barrel) - Rotates together */}
      <group ref={turretRef} position={[0, BODY_HEIGHT + TURRET_HEIGHT / 2 - 0.05, -0.2]}>
        {/* Turret */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[TURRET_RADIUS, TURRET_RADIUS, TURRET_HEIGHT, 32]} />
          <meshStandardMaterial color="#e66f4f" flatShading />
        </mesh>

        {/* Barrel */}
        <mesh castShadow position={[0, 0, -(TURRET_RADIUS + BARREL_LENGTH / 2)]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[BARREL_RADIUS, BARREL_RADIUS, BARREL_LENGTH, 16]} />
          <meshStandardMaterial color="#7d8a94" flatShading />
        </mesh>
      </group>
    </group>
  );
}