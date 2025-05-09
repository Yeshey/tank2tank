// src/components/scene/SceneSetup.tsx
import {
    ShadowGenerator,
    Vector3,
    HemisphericLight,
    DirectionalLight,
    MeshBuilder,
    StandardMaterial,
    Color3,
    // PhysicsImpostor, // Remove V1 Impostor
    Scene,
    Mesh,
    PhysicsBody,        // V2 API
    PhysicsShapeBox,    // V2 API
    PhysicsMotionType,   // V2 API
    Quaternion
} from '@babylonjs/core/Legacy/legacy';
import { GridMaterial } from '@babylonjs/materials/grid';
import { PHYSICS_GROUND_SIDE_LENGTH, DEFAULT_FRICTION, DEFAULT_RESTITUTION } from '../../constants';

export interface SceneEnvironment {
    ground: Mesh;
    shadowGenerator: ShadowGenerator;
}

export function setupSceneEnvironment(scene: Scene): SceneEnvironment {
    const ambientLight = new HemisphericLight("hemilight", new Vector3(0.1, 1, 0.1), scene);
    ambientLight.intensity = 0.6;

    const directionalLight = new DirectionalLight("dir01", new Vector3(-0.5, -0.8, -0.3), scene);
    directionalLight.position = new Vector3(25, 30, 15);
    directionalLight.intensity = 0.8;

    const shadowGenerator = new ShadowGenerator(2048, directionalLight);
    shadowGenerator.useExponentialShadowMap = true;
    shadowGenerator.darkness = 0.3;

    const ground = MeshBuilder.CreateGround("ground", {
        width: PHYSICS_GROUND_SIDE_LENGTH,
        height: PHYSICS_GROUND_SIDE_LENGTH,
    }, scene);

    const useGridMaterial = true;
    if (useGridMaterial) {
        const gridMaterial = new GridMaterial("gridMat", scene);
        gridMaterial.majorUnitFrequency = 5;
        gridMaterial.minorUnitVisibility = 0.45;
        gridMaterial.gridRatio = 1;
        gridMaterial.mainColor = new Color3(0.7, 0.7, 0.7);
        gridMaterial.lineColor = new Color3(0.2, 0.2, 0.2);
        gridMaterial.opacity = 1;
        ground.material = gridMaterial;
    } else {
        const groundMaterial = new StandardMaterial("groundMat", scene);
        groundMaterial.diffuseColor = new Color3(0.5, 0.55, 0.5);
        groundMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
        ground.material = groundMaterial;
    }

    // --- Physics V2 for Ground ---
    // Create a physics body for the ground
    const groundBody = new PhysicsBody(ground, PhysicsMotionType.STATIC, false, scene);
    // Create a box shape for the ground. The ground mesh is thin, so a small height for the physics shape is fine.
    // Dimensions are full extents.
    const groundShape = new PhysicsShapeBox(
        Vector3.Zero(), // Center of the shape relative to the mesh
        Quaternion.Identity(), // Rotation of the shape relative to the mesh
        new Vector3(PHYSICS_GROUND_SIDE_LENGTH, 0.1, PHYSICS_GROUND_SIDE_LENGTH), // Extents (full width, small height, full depth)
        scene
    );
    groundBody.shape = groundShape;
    // Set material properties for physics (friction, restitution)
    groundBody.setMassProperties({ mass: 0 }); // Mass 0 makes it static
    groundShape.material = { friction: DEFAULT_FRICTION, restitution: DEFAULT_RESTITUTION };
    // --- End Physics V2 for Ground ---

    // V1 Impostor - REMOVE THIS:
    // ground.physicsImpostor = new PhysicsImpostor(
    //     ground,
    //     PhysicsImpostor.BoxImpostor,
    //     { mass: 0, friction: DEFAULT_FRICTION, restitution: DEFAULT_RESTITUTION },
    //     scene
    // );
    ground.receiveShadows = true;

    return { ground, shadowGenerator };
}