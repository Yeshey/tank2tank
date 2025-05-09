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

        // Ensure the root mesh has a quaternion for physics body orientation
        if (!this.model.rootMesh.rotationQuaternion) {
            this.model.rootMesh.rotationQuaternion = Quaternion.Identity();
        }

        this.body = new PhysicsBody(
            this.model.rootMesh,
            PhysicsMotionType.DYNAMIC,
            false,
            scene
        );

        const tankShape = new PhysicsShapeBox(
            Vector3.Zero(), // Center of shape in mesh's local space
            Quaternion.Identity(), // Rotation of shape in mesh's local space
            new Vector3(BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH), // Extents
            scene
        );
        this.body.shape = tankShape;

        this.body.setMassProperties({
            mass: TANK_MASS,
            // inertia: new Vector3(ix, iy, iz) // Optional: define principal moments of inertia if needed for specific rotational behavior
            // For now, let Havok compute inertia from shape and mass.
        });

        // --- DAMPING ---
        // Linear damping reduces velocity over time (like air resistance or friction).
        // Higher values mean more "sluggish" movement but less drifting.
        this.body.setLinearDamping(0.9); // Increased significantly to reduce drift

        // Angular damping reduces angular velocity over time.
        // Low values make turning responsive; high values make it sluggish.
        this.body.setAngularDamping(0.5); // Slightly increased to prevent excessive spinning, but still responsive.

        tankShape.material = {
            friction: DEFAULT_FRICTION, // Defined in constants, e.g., 0.8
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
            this.model.rootMesh, // tank body node
            groundPlaneMesh
        );

        let lastTime = performance.now();
        const beforeRenderObserver = this.scene.onBeforeRenderObservable.add(() => {
            const currentTime = performance.now();
            const delta = Math.min(0.1, (currentTime - lastTime) / 1000); // Clamp delta
            lastTime = currentTime;
            if (delta <= 0) return;

            this.inputController.updateMovement(delta);
            this.aimingController.updateAiming(delta);
            this.model.NameTagVisibility = !this.inputController.isMoving();

            // Clamp angular velocity (already in TankInputController, but can be a safeguard here too)
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
            this.body.dispose(); // This should also dispose the shape
        }
        this.model.dispose();
    }
}