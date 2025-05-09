// src/gameplay/TankInputController.ts
import { PhysicsBody, Vector3, Quaternion, TransformNode } from '@babylonjs/core/Legacy/legacy';
import {
    MOVE_FORCE, BRAKE_FORCE_MULTIPLIER, MAX_LINEAR_VELOCITY,
    TURN_TORQUE, BRAKE_TORQUE_MULTIPLIER,
} from '../constants'; // Adjusted path

const _forwardDirLocal = new Vector3(0, 0, 1);
const _impulseVec = new Vector3();
const _angularImpulseVec = new Vector3();
const _worldForward = new Vector3();
const _currentLinVel = new Vector3();
const _currentAngVel = new Vector3();

export class TankInputController {
    private tankBody: PhysicsBody;
    private tankNode: TransformNode;
    private keysPressed: { [key: string]: boolean } = {};
    private _isCurrentlyMoving: boolean = false;

    constructor(tankBody: PhysicsBody, tankNode: TransformNode) {
        this.tankBody = tankBody;
        this.tankNode = tankNode;

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
        if (!this.tankBody || !this.tankNode) return;

        let applyingForce = false;
        let applyingAngularImpulse = false;

        this.tankBody.getLinearVelocityToRef(_currentLinVel);
        this.tankBody.getAngularVelocityToRef(_currentAngVel);

        if (!this.tankNode.rotationQuaternion) {
            this.tankNode.rotationQuaternion = Quaternion.FromRotationMatrix(this.tankNode.getWorldMatrix().getRotationMatrix());
        }
        const tankRotationQuaternion = this.tankNode.rotationQuaternion;

        _forwardDirLocal.set(0, 0, 1);
        _forwardDirLocal.rotateByQuaternionToRef(tankRotationQuaternion, _worldForward);
        _worldForward.normalize();

        if (this.keysPressed['w'] || this.keysPressed['arrowup']) {
            _impulseVec.copyFrom(_worldForward).scaleInPlace(MOVE_FORCE * delta);
            this.tankBody.applyImpulse(_impulseVec, this.tankNode.getAbsolutePosition());
            applyingForce = true;
        }
        if (this.keysPressed['s'] || this.keysPressed['arrowdown']) {
            _impulseVec.copyFrom(_worldForward).scaleInPlace(-MOVE_FORCE * delta);
            this.tankBody.applyImpulse(_impulseVec, this.tankNode.getAbsolutePosition());
            applyingForce = true;
        }

        const angularImpulseMagnitude = TURN_TORQUE * delta * 0.05; 

        if (this.keysPressed['a'] || this.keysPressed['q']) {
            _angularImpulseVec.set(0, angularImpulseMagnitude, 0);
            this.tankBody.applyAngularImpulse(_angularImpulseVec);
            applyingAngularImpulse = true;
        }
        if (this.keysPressed['d']) {
            _angularImpulseVec.set(0, -angularImpulseMagnitude, 0);
            this.tankBody.applyAngularImpulse(_angularImpulseVec);
            applyingAngularImpulse = true;
        }
        
        if (!applyingForce && _currentLinVel.lengthSquared() > 0.01) {
            _impulseVec.copyFrom(_currentLinVel).scaleInPlace(-BRAKE_FORCE_MULTIPLIER * 50 * delta);
            this.tankBody.applyImpulse(_impulseVec, this.tankNode.getAbsolutePosition());
        }
        if (!applyingAngularImpulse && Math.abs(_currentAngVel.y) > 0.01) {
            const angularBrakeImpulseMagnitude = _currentAngVel.y * -BRAKE_TORQUE_MULTIPLIER * 50 * delta;
            _angularImpulseVec.set(0, angularBrakeImpulseMagnitude, 0);
            this.tankBody.applyAngularImpulse(_angularImpulseVec);
        }

        this.tankBody.getLinearVelocityToRef(_currentLinVel); // Re-fetch after applying impulses
        if (_currentLinVel.lengthSquared() > MAX_LINEAR_VELOCITY * MAX_LINEAR_VELOCITY) {
            _currentLinVel.normalize().scaleInPlace(MAX_LINEAR_VELOCITY);
            this.tankBody.setLinearVelocity(_currentLinVel);
        }
        
        this._isCurrentlyMoving = _currentLinVel.lengthSquared() > 0.1 || Math.abs(_currentAngVel.y) > 0.1;
    }

    public isMoving(): boolean {
        return this._isCurrentlyMoving;
    }

    public dispose(): void {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.keysPressed = {}; // Clear keys
    }
}