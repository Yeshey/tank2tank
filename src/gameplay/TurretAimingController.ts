// src/gameplay/TurretAimingController.ts
import { Scene, Vector3, Quaternion, TransformNode, Mesh, PointerInfo, PointerEventTypes, PickingInfo } from '@babylonjs/core/Legacy/legacy';
import { TURRET_ROTATE_SPEED } from '../constants'; // Adjusted path
import * as BABYLON from '@babylonjs/core/Legacy/legacy';

const _targetPoint = new Vector3();
const _turretWorldPos = new Vector3();
const _yAxis = new Vector3(0, 1, 0);

export class TurretAimingController {
    private scene: Scene;
    private turretNode: TransformNode;
    private tankBodyNode: TransformNode;
    private groundPlane: Mesh | null; // Can be null if not found

    private pointerCoords = { x: 0, y: 0 };
    private pointerMoveObserver: BABYLON.Observer<PointerInfo> | null = null;

    constructor(
        scene: Scene,
        turretNode: TransformNode,
        tankBodyNode: TransformNode,
        groundPlane: Mesh | null
    ) {
        this.scene = scene;
        this.turretNode = turretNode;
        this.tankBodyNode = tankBodyNode;
        this.groundPlane = groundPlane;

        this.pointerMoveObserver = this.scene.onPointerObservable.add(this.handlePointerMove);
    }

    private handlePointerMove = (pointerInfo: PointerInfo) => {
        if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
            this.pointerCoords.x = this.scene.pointerX;
            this.pointerCoords.y = this.scene.pointerY;
        }
    };

    public updateAiming(delta: number): void {
        if (!this.turretNode || !this.tankBodyNode || !this.groundPlane) return;

        const pickResult: PickingInfo | null = this.scene.pick(
            this.pointerCoords.x,
            this.pointerCoords.y,
            (mesh) => mesh === this.groundPlane // Predicate to pick only the ground
        );

        if (pickResult && pickResult.hit && pickResult.pickedPoint) {
            _targetPoint.copyFrom(pickResult.pickedPoint);
            _turretWorldPos.copyFrom(this.turretNode.getAbsolutePosition());

            const directionToTarget = _targetPoint.subtract(_turretWorldPos);
            directionToTarget.y = 0; // Aim on the XZ plane
            if (directionToTarget.lengthSquared() < 0.0001) return;
            directionToTarget.normalize();

            // Target rotation in world space
            const targetWorldYaw = Math.atan2(directionToTarget.x, directionToTarget.z);
            const targetWorldQuaternion = Quaternion.RotationAxis(_yAxis, targetWorldYaw);

            // Convert target world rotation to local rotation relative to the tank body
            if (!this.tankBodyNode.absoluteRotationQuaternion) { // Ensure it exists
                 this.tankBodyNode.computeWorldMatrix(true); // Force update if necessary
            }
            const tankInverseWorldRotationQuaternion = Quaternion.Inverse(this.tankBodyNode.absoluteRotationQuaternion.clone());
            const targetLocalQuaternion = tankInverseWorldRotationQuaternion.multiply(targetWorldQuaternion);
            
            if (!this.turretNode.rotationQuaternion) {
                this.turretNode.rotationQuaternion = Quaternion.Identity();
            }

            // Slerp towards the target local rotation
            const slerpFactor = Math.min(TURRET_ROTATE_SPEED * delta * 10, 1); // Adjust multiplier for responsiveness
            Quaternion.SlerpToRef(
                this.turretNode.rotationQuaternion,
                targetLocalQuaternion,
                slerpFactor,
                this.turretNode.rotationQuaternion // Update in place
            );
        }
    }

    public dispose(): void {
        if (this.pointerMoveObserver) {
            this.scene.onPointerObservable.remove(this.pointerMoveObserver);
            this.pointerMoveObserver = null;
        }
    }
}