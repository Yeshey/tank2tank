// src/gameplay/TurretAimingController.ts
import { 
    Scene, Vector3, Quaternion, TransformNode, Mesh, PointerInfo, PointerEventTypes, 
    PickingInfo, Scalar, Observer 
} from '@babylonjs/core/Legacy/legacy';
import { TURRET_ROTATE_SPEED } from '../constants';
import { Epsilon } from "@babylonjs/core/Maths/math";

const _targetPoint = new Vector3();
const _turretWorldPos = new Vector3();
const _yAxis = new Vector3(0, 1, 0);
// Temporary quaternions for calculations
const _targetWorldQuaternion = new Quaternion();
const _tankInverseWorldRotationQuaternion = new Quaternion();
const _targetLocalQuaternion = new Quaternion();


export class TurretAimingController {
    private scene: Scene;
    private turretNode: TransformNode;
    private tankBodyNode: TransformNode;
    private groundPlane: Mesh | null;

    private pointerCoords = { x: 0, y: 0 };
    private pointerMoveObserver: Observer<PointerInfo> | null = null;

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

        // Ensure turretNode has a rotationQuaternion
        if (!this.turretNode.rotationQuaternion) {
            this.turretNode.rotationQuaternion = Quaternion.Identity();
        }

        this.pointerMoveObserver = this.scene.onPointerObservable.add(this.handlePointerMove);
    }

    private handlePointerMove = (pointerInfo: PointerInfo) => {
        if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
            this.pointerCoords.x = this.scene.pointerX;
            this.pointerCoords.y = this.scene.pointerY;
        }
    };

    public updateAiming(delta: number): void {
        if (!this.turretNode || !this.tankBodyNode || !this.groundPlane || !this.scene.activeCamera) return;

        const pickResult: PickingInfo | null = this.scene.pick(
            this.pointerCoords.x,
            this.pointerCoords.y,
            (mesh) => mesh === this.groundPlane 
        );

        if (pickResult && pickResult.hit && pickResult.pickedPoint) {
            _targetPoint.copyFrom(pickResult.pickedPoint);
            _turretWorldPos.copyFrom(this.turretNode.getAbsolutePosition());

            const directionToTarget = _targetPoint.subtract(_turretWorldPos);
            directionToTarget.y = 0; // Aim on the XZ plane relative to turret's world position
            if (directionToTarget.lengthSquared() < Epsilon) return; // Too close to aim
            directionToTarget.normalize();

            // Calculate target world rotation (Yaw)
            const targetWorldYaw = Math.atan2(directionToTarget.x, directionToTarget.z);
            Quaternion.RotationAxisToRef(_yAxis, targetWorldYaw, _targetWorldQuaternion);

            // Convert target world rotation to local rotation relative to the tank body
            // Ensure tankBodyNode's absoluteRotationQuaternion is up-to-date
            this.tankBodyNode.computeWorldMatrix(true); // Force update if necessary
            const tankWorldRotation = this.tankBodyNode.absoluteRotationQuaternion;
            
            Quaternion.InverseToRef(tankWorldRotation, _tankInverseWorldRotationQuaternion);
            _tankInverseWorldRotationQuaternion.multiplyToRef(_targetWorldQuaternion, _targetLocalQuaternion);
            
            // Current local rotation of the turret
            const currentLocalRotation = this.turretNode.rotationQuaternion!; // Ensured in constructor

            // Calculate the actual angle difference between current and target local quaternions
            let dot = Quaternion.Dot(currentLocalRotation, _targetLocalQuaternion);

            // Ensure shortest path by inverting one quaternion if dot is negative
            // (targetLocalQuaternion is temporary, so modifying it is fine)
            if (dot < 0.0) {
                _targetLocalQuaternion.x *= -1;
                _targetLocalQuaternion.y *= -1;
                _targetLocalQuaternion.z *= -1;
                _targetLocalQuaternion.w *= -1;
                dot = Quaternion.Dot(currentLocalRotation, _targetLocalQuaternion);
            }
            
            // Clamp dot to avoid acos domain errors from floating point inaccuracies
            dot = Scalar.Clamp(dot, -1.0, 1.0);
            const angleDifference = 2 * Math.acos(dot);

            if (angleDifference > 0.001) { // Some small epsilon to prevent jitter
                const maxRotationThisFrame = TURRET_ROTATE_SPEED * delta;
                
                // Calculate Slerp amount for constant angular speed
                // If angleDifference is 0, slerpAmount would be NaN/Infinity, but we guard with (angleDifference > epsilon)
                let slerpAmount = maxRotationThisFrame / angleDifference;
                slerpAmount = Math.min(slerpAmount, 1.0); // Clamp to 1 to not overshoot

                Quaternion.SlerpToRef(
                    currentLocalRotation,
                    _targetLocalQuaternion, // Use the potentially inverted one for shortest path
                    slerpAmount,
                    this.turretNode.rotationQuaternion! // Update in place
                );
            } else if (angleDifference > 0) { // If very close but not zero, snap to avoid tiny slerps
                this.turretNode.rotationQuaternion!.copyFrom(_targetLocalQuaternion);
            }
            // If angleDifference is 0, they are already aligned.
        }
    }

    public dispose(): void {
        if (this.pointerMoveObserver) {
            this.scene.onPointerObservable.remove(this.pointerMoveObserver);
            this.pointerMoveObserver = null;
        }
    }
}