// src/gameplay/TankInputController.ts
import { PhysicsBody, Vector3, Quaternion, TransformNode, Axis } from '@babylonjs/core/Legacy/legacy';
import {
    MOVE_FORCE,
    TURN_TORQUE,
    BRAKE_FORCE_MULTIPLIER,
    BRAKE_TORQUE_MULTIPLIER,
    MAX_LINEAR_VELOCITY,
    MAX_ANGULAR_VELOCITY,
    BRAKING_LINEAR_FACTOR,
    BRAKING_ANGULAR_FACTOR
} from '../constants';

const _impulseVec = new Vector3();
const _angularImpulseVec = new Vector3();
const _worldForward = new Vector3();
const _currentLinVel = new Vector3();
const _currentAngVel = new Vector3();

export class TankInputController {
    private tankBody: PhysicsBody;
    private tankNode: TransformNode; // This is the visual mesh whose orientation dictates "forward"
    private keysPressed: { [key: string]: boolean } = {};
    private _isCurrentlyMoving: boolean = false;

    constructor(tankBody: PhysicsBody, tankNode: TransformNode) {
        this.tankBody = tankBody;
        this.tankNode = tankNode;

        // Ensure tankNode has a rotationQuaternion, physics body will use it
        if (!this.tankNode.rotationQuaternion) {
            this.tankNode.rotationQuaternion = Quaternion.FromRotationMatrix(this.tankNode.getWorldMatrix().getRotationMatrix());
        }

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        this.keysPressed[event.key.toLowerCase()] = true;
    };

    private handleKeyUp = (event: KeyboardEvent) => {
        this.keysPressed[event.key.toLowerCase()] = false;
    };

    public updateMovement(delta: number): void {
        if (!this.tankBody || !this.tankNode || delta <= 0) return;

        let applyingForce = false;
        let applyingAngularImpulse = false;

        this.tankBody.getLinearVelocityToRef(_currentLinVel);
        this.tankBody.getAngularVelocityToRef(_currentAngVel);

        // Get the tank's current world forward direction from its visual node
        this.tankNode.getDirectionToRef(Axis.Z, _worldForward); // Assumes local Z is forward

        // Forward/Backward Movement (Impulse = Force * delta)
        if (this.keysPressed['w'] || this.keysPressed['arrowup']) {
            _impulseVec.copyFrom(_worldForward).scaleInPlace(MOVE_FORCE * delta);
            this.tankBody.applyImpulse(_impulseVec, this.tankNode.getAbsolutePosition());
            applyingForce = true;
        }
        if (this.keysPressed['s'] || this.keysPressed['arrowdown']) {
            _impulseVec.copyFrom(_worldForward).scaleInPlace(-MOVE_FORCE * delta * 0.7); // Reduced reverse force
            this.tankBody.applyImpulse(_impulseVec, this.tankNode.getAbsolutePosition());
            applyingForce = true;
        }

        // Turning (Yaw) Movement (Angular Impulse = Torque * delta)
        const angularImpulseMagnitude = TURN_TORQUE * delta;

        if (this.keysPressed['d'] || this.keysPressed['arrowright']) { // Turn Right
            _angularImpulseVec.set(0, angularImpulseMagnitude, 0); // Positive Y for right turn (Babylon default)
            this.tankBody.applyAngularImpulse(_angularImpulseVec);
            applyingAngularImpulse = true;
        }
        if (this.keysPressed['a'] || this.keysPressed['arrowleft']) { // Turn Left
            _angularImpulseVec.set(0, -angularImpulseMagnitude, 0); // Negative Y for left turn
            this.tankBody.applyAngularImpulse(_angularImpulseVec);
            applyingAngularImpulse = true;
        }
        
        // Active Braking / Counter-Impulse when keys are released
        // This supplements the natural damping from physics material and body.setLinear/AngularDamping
        if (!applyingForce && _currentLinVel.lengthSquared() > 0.01) {
            _impulseVec.copyFrom(_currentLinVel).scaleInPlace(-BRAKE_FORCE_MULTIPLIER * BRAKING_LINEAR_FACTOR * delta);
            this.tankBody.applyImpulse(_impulseVec, this.tankNode.getAbsolutePosition());
        }
        if (!applyingAngularImpulse && Math.abs(_currentAngVel.y) > 0.01) {
            const angularBrakeImpulse = _currentAngVel.y * -BRAKE_TORQUE_MULTIPLIER * BRAKING_ANGULAR_FACTOR * delta;
            _angularImpulseVec.set(0, angularBrakeImpulse, 0);
            this.tankBody.applyAngularImpulse(_angularImpulseVec);
        }

        // Velocity Clamping
        // Linear Velocity
        this.tankBody.getLinearVelocityToRef(_currentLinVel); // Re-fetch after applying impulses
        if (_currentLinVel.lengthSquared() > MAX_LINEAR_VELOCITY * MAX_LINEAR_VELOCITY) {
            _currentLinVel.normalize().scaleInPlace(MAX_LINEAR_VELOCITY);
            this.tankBody.setLinearVelocity(_currentLinVel);
        }
        
        // Angular Velocity (specifically for Yaw on Y-axis)
        this.tankBody.getAngularVelocityToRef(_currentAngVel); // Re-fetch
        if (Math.abs(_currentAngVel.y) > MAX_ANGULAR_VELOCITY) {
            _currentAngVel.y = Math.sign(_currentAngVel.y) * MAX_ANGULAR_VELOCITY;
            this.tankBody.setAngularVelocity(_currentAngVel);
        }
        
        this._isCurrentlyMoving = _currentLinVel.lengthSquared() > 0.1 || Math.abs(_currentAngVel.y) > 0.1;
    }

    public isMoving(): boolean {
        return this._isCurrentlyMoving;
    }

    public dispose(): void {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.keysPressed = {};
    }
}