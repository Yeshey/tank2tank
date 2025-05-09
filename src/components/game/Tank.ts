// src/components/game/Tank.ts
import {
    Scene,
    Vector3,
    ShadowGenerator,
    Mesh,
    Quaternion,
    PhysicsBody,
    PhysicsShapeBox,
    PhysicsMotionType,
    // TransformNode, // Only if needed beyond Mesh
} from '@babylonjs/core/Legacy/legacy';
import { TankModel } from './TankModel';
import { TankInputController } from '../../gameplay/TankInputController';
// import { useTurretAiming_Babylon } from '../../hooks/useTurretAiming'; // REMOVE THIS
import { TurretAimingController } from '../../gameplay/TurretAimingController'; // IMPORT THE NEW CONTROLLER
import {
    TANK_MASS, DEFAULT_FRICTION, DEFAULT_RESTITUTION,
    BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH,
    MAX_ANGULAR_VELOCITY
} from '../../constants';

export interface TankHandle {
    getVisualMesh: () => Mesh;
    getPhysicsBody: () => PhysicsBody | undefined;
}

export class Tank implements TankHandle {
    public scene: Scene;
    public model: TankModel;
    public body!: PhysicsBody;
    private inputController: TankInputController;
    private aimingController: TurretAimingController; // Instance for aiming

    private unregisterObservables: () => void;

    constructor(scene: Scene, name: string, initialPosition: Vector3, shadowGenerator?: ShadowGenerator) {
        this.scene = scene;
        this.model = new TankModel(name, scene, shadowGenerator);
        this.model.rootMesh.position = initialPosition.clone();

        // Physics Body Setup (as before)
        this.body = new PhysicsBody(this.model.rootMesh, PhysicsMotionType.DYNAMIC, false, scene);
        const tankShape = new PhysicsShapeBox( Vector3.Zero(), Quaternion.Identity(), new Vector3(BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH), scene);
        this.body.shape = tankShape;
        this.body.setMassProperties({ mass: TANK_MASS });
        this.body.setLinearDamping(0.5);
        this.body.setAngularDamping(0.8);
        tankShape.material = { friction: DEFAULT_FRICTION, restitution: DEFAULT_RESTITUTION };

        // Input Controller
        this.inputController = new TankInputController(this.body, this.model.rootMesh);

        // Aiming Controller
        const groundPlaneAbstract = scene.getMeshByName("ground");
        let groundPlaneMesh: Mesh | null = null;
        if (groundPlaneAbstract instanceof Mesh) {
            groundPlaneMesh = groundPlaneAbstract;
        } else {
            console.warn("Ground plane mesh not found or not a Mesh instance for Tank aiming!");
        }
        this.aimingController = new TurretAimingController(
            scene,
            this.model.getTurret(),
            this.model.rootMesh,
            groundPlaneMesh
        );

        // Render Loop
        let lastTime = performance.now();
        const beforeRenderObserver = this.scene.onBeforeRenderObservable.add(() => {
            const currentTime = performance.now();
            const delta = Math.min(0.1, (currentTime - lastTime) / 1000);
            lastTime = currentTime;
            if (delta <= 0) return;

            this.inputController.updateMovement(delta);
            this.aimingController.updateAiming(delta); // Use the aiming controller
            this.model.NameTagVisibility = !this.inputController.isMoving();

            const angVel = this.body.getAngularVelocity();
            if (angVel && Math.abs(angVel.y) > MAX_ANGULAR_VELOCITY) {
                 this.body.setAngularVelocity(new Vector3(angVel.x, Math.sign(angVel.y) * MAX_ANGULAR_VELOCITY, angVel.z));
            }
        });
        
        this.unregisterObservables = () => {
            if(this.scene.onBeforeRenderObservable.hasObservers()) {
                this.scene.onBeforeRenderObservable.remove(beforeRenderObserver);
            }
        };
    }

    public getVisualMesh(): Mesh {
        return this.model.getVisualMesh();
    }

    public getPhysicsBody(): PhysicsBody | undefined {
        return this.body;
    }

    public dispose() {
        this.unregisterObservables();
        this.inputController.dispose();
        this.aimingController.dispose(); // Dispose aiming controller
        if (this.body) {
            this.body.dispose();
        }
        this.model.dispose();
    }
}