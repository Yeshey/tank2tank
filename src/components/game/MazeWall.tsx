// src/components/game/MazeWall.tsx (Corrected file extension if it was .ts)
import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  // PhysicsImpostor, // Remove V1
  ShadowGenerator,
  Quaternion,         // V2 API
  PhysicsBody,        // V2 API
  PhysicsShapeBox,    // V2 API
  PhysicsMotionType   // V2 API
} from '@babylonjs/core/Legacy/legacy';
import { WALL_COLOR_HEX, WALL_MASS, DEFAULT_FRICTION, DEFAULT_RESTITUTION } from '../../constants';

export interface WallObjectData {
  id: string;
  position: Vector3;
  size: Vector3;
}

export function createMazeWalls(scene: Scene, wallsData: WallObjectData[], shadowGenerator?: ShadowGenerator): void {
  const wallMaterial = new StandardMaterial("wallMat", scene);
  wallMaterial.diffuseColor = Color3.FromHexString(WALL_COLOR_HEX);

  wallsData.forEach(data => {
      const wallMesh = MeshBuilder.CreateBox(data.id, {
          width: data.size.x,
          height: data.size.y,
          depth: data.size.z,
      }, scene);
      wallMesh.position = data.position;
      wallMesh.material = wallMaterial;

      // --- Physics V2 for Wall ---
      const wallBody = new PhysicsBody(wallMesh, WALL_MASS === 0 ? PhysicsMotionType.STATIC : PhysicsMotionType.DYNAMIC, false, scene);
      const wallShape = new PhysicsShapeBox(
          Vector3.Zero(),
          Quaternion.Identity(),
          data.size.clone(), // Use the wall's size for the extents
          scene
      );
      wallBody.shape = wallShape;
      if (WALL_MASS > 0) {
        wallBody.setMassProperties({ mass: WALL_MASS });
      } else {
        wallBody.setMassProperties({ mass: 0 }); // Ensure static if WALL_MASS is 0
      }
      wallShape.material = { friction: DEFAULT_FRICTION, restitution: DEFAULT_RESTITUTION };
      // --- End Physics V2 for Wall ---

      // V1 Impostor - REMOVE THIS:
      // wallMesh.physicsImpostor = new PhysicsImpostor(
      //     wallMesh,
      //     PhysicsImpostor.BoxImpostor,
      //     { mass: WALL_MASS, friction: DEFAULT_FRICTION, restitution: DEFAULT_RESTITUTION },
      //     scene
      // );
      wallMesh.receiveShadows = true;
      if (shadowGenerator) {
          shadowGenerator.addShadowCaster(wallMesh);
      }
  });
}