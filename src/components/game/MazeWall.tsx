// src/components/game/MazeWall.tsx
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three'; // Not strictly needed here but good practice if you add more THREE features
import { WALL_COLOR } from '../../constants';

interface MazeWallProps {
  position: [number, number, number];
  size: [number, number, number]; // width, height, depth
}

export function MazeWall({ position, size }: MazeWallProps) {
  return (
    <RigidBody
      type="fixed" // Walls don't move
      colliders={false} // We'll define one explicitly
      position={position}
      userData={{ type: 'wall' }} // Optional: for raycasting or collision specific logic
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
            color={WALL_COLOR}
            metalness={0.2} // Less shiny than tank
            roughness={0.8} // More rough
        />
      </mesh>
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
    </RigidBody>
  );
}