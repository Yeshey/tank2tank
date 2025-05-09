// src/components/game/TankModel.ts
import {
    Mesh,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Vector3,
    Scene,
    // TransformNode, // Removed as Mesh covers its usage here
    // PhysicsImpostor, // V1 - Removed
    ShadowGenerator,
} from '@babylonjs/core/Legacy/legacy';
// import type { Nullable } from '@babylonjs/core/types'; // Nullable might still be useful for getPhysicsImpostor if kept temporarily
import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import {
    BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH,
    TURRET_RADIUS, TURRET_HEIGHT, BARREL_RADIUS, BARREL_LENGTH,
    TURRET_GROUP_Y_OFFSET, TURRET_GROUP_Z_OFFSET,
    WHEEL_RADIUS, WHEEL_THICKNESS, WHEEL_SPACING, WHEEL_Y_OFFSET, WHEEL_X_OFFSET,
    NAME_TAG_Y_OFFSET
} from '../../constants';
import { PlayerNameTag } from './PlayerNameTag';

export class TankModel { // Added export
    public scene: Scene;
    public rootMesh: Mesh;
    public visualParent: BABYLON.TransformNode; // TransformNode is still used for visualParent
    public turretMesh: Mesh; // Turret is a Mesh
    public barrelMesh: Mesh; // Barrel is a Mesh
    public wheels: Mesh[] = [];
    private nameTag: PlayerNameTag | null = null;

    constructor(name: string, scene: Scene, shadowGenerator?: ShadowGenerator) {
        this.scene = scene;

        this.rootMesh = MeshBuilder.CreateBox(name + "_bodyRoot", {
            width: BODY_WIDTH,
            height: BODY_HEIGHT,
            depth: BODY_DEPTH
        }, scene);
        this.rootMesh.isVisible = true;

        const bodyMaterial = new StandardMaterial(name + "_bodyMat", scene);
        bodyMaterial.diffuseColor = new Color3(0.85, 0.31, 0.19);
        this.rootMesh.material = bodyMaterial;

        // visualParent is a TransformNode, so its import is needed
        this.visualParent = new BABYLON.TransformNode(name + "_visuals", scene);
        this.visualParent.parent = this.rootMesh;

        this.turretMesh = MeshBuilder.CreateCylinder(name + "_turret", {
            diameter: TURRET_RADIUS * 2,
            height: TURRET_HEIGHT,
            tessellation: 24
        }, scene);
        const turretMaterial = new StandardMaterial(name + "_turretMat", scene);
        turretMaterial.diffuseColor = new Color3(0.9, 0.44, 0.31);
        this.turretMesh.material = turretMaterial;
        this.turretMesh.position = new Vector3(0, TURRET_GROUP_Y_OFFSET, TURRET_GROUP_Z_OFFSET);
        this.turretMesh.parent = this.visualParent;

        this.barrelMesh = MeshBuilder.CreateCylinder(name + "_barrel", {
            diameter: BARREL_RADIUS * 2,
            height: BARREL_LENGTH,
            tessellation: 16
        }, scene);
        const barrelMaterial = new StandardMaterial(name + "_barrelMat", scene);
        barrelMaterial.diffuseColor = new Color3(0.49, 0.54, 0.58);
        this.barrelMesh.material = barrelMaterial;
        this.barrelMesh.rotation.x = Math.PI / 2;
        this.barrelMesh.position = new Vector3(0, 0, BARREL_LENGTH / 2 + TURRET_RADIUS * 0.3);
        this.barrelMesh.parent = this.turretMesh;


        const wheelMaterial = new StandardMaterial(name + "_wheelMat", scene);
        wheelMaterial.diffuseColor = new Color3(0.33, 0.33, 0.33);
        const wheelZPositions = [-WHEEL_SPACING, 0, WHEEL_SPACING];

        wheelZPositions.forEach((zPos, index) => {
            const wheelL = this.createWheel(`${name}_wheelL_${index}`, scene, wheelMaterial);
            wheelL.position = new Vector3(-WHEEL_X_OFFSET, WHEEL_Y_OFFSET, zPos);
            this.wheels.push(wheelL);

            const wheelR = this.createWheel(`${name}_wheelR_${index}`, scene, wheelMaterial);
            wheelR.position = new Vector3(WHEEL_X_OFFSET, WHEEL_Y_OFFSET, zPos);
            this.wheels.push(wheelR);
        });

        if (shadowGenerator) {
            shadowGenerator.addShadowCaster(this.rootMesh);
            shadowGenerator.addShadowCaster(this.turretMesh);
            shadowGenerator.addShadowCaster(this.barrelMesh);
        }
        this.rootMesh.receiveShadows = true;

        this.nameTag = new PlayerNameTag(name, scene, this.rootMesh, NAME_TAG_Y_OFFSET);
    }

    private createWheel(name: string, scene: Scene, material: StandardMaterial): Mesh {
        const wheel = MeshBuilder.CreateCylinder(name, { // Corrected from _CreateCylinder
            diameter: WHEEL_RADIUS * 2,
            height: WHEEL_THICKNESS,
            tessellation: 12
        }, scene);
        wheel.material = material;
        wheel.rotation.z = Math.PI / 2;
        wheel.parent = this.visualParent;
        return wheel;
    }

    public getTurret(): Mesh { // Turret is a Mesh
        return this.turretMesh;
    }

    public getVisualMesh(): Mesh {
        return this.rootMesh;
    }

    // V1 physics remnant - can be removed if not needed for any compatibility.
    // public getPhysicsImpostor(): Nullable<PhysicsImpostor> {
    //     return this.rootMesh.physicsImpostor;
    // }
    
    public set NameTagVisibility(visible: boolean) {
        if (this.nameTag) {
            this.nameTag.setVisible(visible);
        }
    }

    public dispose() {
        this.nameTag?.dispose();
        this.wheels.forEach(w => {
            if (w.material) w.material.dispose(); // Dispose wheel material if unique
            w.dispose();
        });
        if (this.barrelMesh.material && this.barrelMesh.material !== this.turretMesh.material) this.barrelMesh.material.dispose();
        if (this.turretMesh.material) this.turretMesh.material.dispose();
        if (this.rootMesh.material) this.rootMesh.material.dispose();
        
        this.barrelMesh.dispose();
        this.turretMesh.dispose();
        this.visualParent.dispose(); // Dispose TransformNode
        this.rootMesh.dispose();
    }
}