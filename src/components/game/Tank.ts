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
    // TransformNode, 
} from '@babylonjs/core/Legacy/legacy';
import { TankModel } from './TankModel';
import { TankInputController } from '../../gameplay/TankInputController';
import { TurretAimingController } from '../../gameplay/TurretAimingController';
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
    private aimingController: TurretAimingController;

    private unregisterObservables: () => void;

    constructor(scene: Scene, name: string, initialPosition: Vector3, shadowGenerator?: ShadowGenerator) {
        this.scene = scene;
        this.model = new TankModel(name, scene, shadowGenerator);
        this.model.rootMesh.position = initialPosition.clone();

        this.body = new PhysicsBody(
            this.model.rootMesh,
            PhysicsMotionType.DYNAMIC,
            false,
            scene
        );

        const tankShape = new PhysicsShapeBox(
            Vector3.Zero(),
            Quaternion.Identity(),
            new Vector3(BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH),
            scene
        );
        this.body.shape = tankShape;

        this.body.setMassProperties({
            mass: TANK_MASS,
            // You might want to define inertia to make it harder to flip and easier to yaw.
            // For a box with dimensions w, h, d:
            // Ix = (m/12)*(h^2+d^2)
            // Iy = (m/12)*(w^2+d^2)  <- Axis of rotation for yaw
            // Iz = (m/12)*(w^2+h^2)
            // To make yaw easier, Iy should be relatively smaller than Ix, Iz, or
            // ensure external torques are primarily around Y.
            // For now, default inertia is fine, but consider this for advanced tuning.
        });

        this.body.setLinearDamping(0.5);
        // --- REDUCE ANGULAR DAMPING SIGNIFICANTLY ---
        this.body.setAngularDamping(0.2); // Previously 0.8. Try 0.1 or 0.2. Max is 1.0.

        tankShape.material = {
            friction: DEFAULT_FRICTION,
            restitution: DEFAULT_RESTITUTION,
        };

        this.inputController = new TankInputController(this.body, this.model.rootMesh);

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

        let lastTime = performance.now();
        const beforeRenderObserver = this.scene.onBeforeRenderObservable.add(() => {
            const currentTime = performance.now();
            const delta = Math.min(0.1, (currentTime - lastTime) / 1000);
            lastTime = currentTime;
            if (delta <= 0) return;

            this.inputController.updateMovement(delta);
            this.aimingController.updateAiming(delta);
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
        this.aimingController.dispose();
        if (this.body) {
            this.body.dispose();
        }
        this.model.dispose();
    }
}