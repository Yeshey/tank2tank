// src/gameplay/TankInputController.ts
import { PhysicsBody, Vector3, Quaternion, TransformNode, Axis, Scalar } from '@babylonjs/core/Legacy/legacy';
import {
    TARGET_MAX_LINEAR_VELOCITY,
    TARGET_PIVOT_ANGULAR_VELOCITY,
    TARGET_MOVING_TURN_ANGULAR_VELOCITY,
    LERP_ALPHA_LINEAR,      // Corrected: Using LERP_ALPHA constants
    LERP_ALPHA_ANGULAR,     // Corrected: Using LERP_ALPHA constants
    LINEAR_DAMPING_FACTOR,
    ANGULAR_DAMPING_FACTOR,
    DAMPING_EFFECT_MULTIPLIER
} from '../constants';

// Temporary vectors
const _currentLinVel = new Vector3();
const _currentAngVel = new Vector3();
const _worldForward = new Vector3();
const _targetLinVelWorld = new Vector3(); // Target linear velocity in world space
const _newLinVel = new Vector3();
const _newAngVel = new Vector3();


export class TankInputController {
    private tankBody: PhysicsBody;
    private tankNode: TransformNode;
    private keysPressed: { [key: string]: boolean } = {};
    private _isCurrentlyMoving: boolean = false;

    constructor(tankBody: PhysicsBody, tankNode: TransformNode) {
        this.tankBody = tankBody;
        this.tankNode = tankNode;

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

        this.tankBody.getLinearVelocityToRef(_currentLinVel);
        this.tankBody.getAngularVelocityToRef(_currentAngVel);
        this.tankNode.getDirectionToRef(Axis.Z, _worldForward); // Local Z is forward

        const forwardInput = (this.keysPressed['w'] || this.keysPressed['arrowup']);
        const backwardInput = (this.keysPressed['s'] || this.keysPressed['arrowdown']);
        const rightTurnInput = (this.keysPressed['a'] || this.keysPressed['arrowleft']);
        const leftTurnInput = (this.keysPressed['d'] || this.keysPressed['arrowright']);

        let targetForwardSpeed = 0;
        if (forwardInput) {
            targetForwardSpeed = TARGET_MAX_LINEAR_VELOCITY;
        } else if (backwardInput) {
            targetForwardSpeed = -TARGET_MAX_LINEAR_VELOCITY * 0.7; // Slower reverse
        }

        // --- Linear Velocity Control (along tank's forward axis) ---
        const currentSpeedAlongForward = Vector3.Dot(_currentLinVel, _worldForward);
        
        // Interpolate current forward speed towards targetForwardSpeed using LERP_ALPHA_LINEAR
        // The LERP_ALPHA directly controls responsiveness per frame.
        // To make it frame-rate independent in feel, you might do: 1 - Math.pow(1 - LERP_ALPHA_LINEAR, delta * 60)
        // But for simplicity and direct arcade feel, a fixed alpha often works well if frame rates are reasonably stable.
        // Let's use a slightly adjusted approach for LERP alpha to make it feel like a rate.
        const effectiveLinearLerpAlpha = 1 - Math.exp(-LERP_ALPHA_LINEAR * delta * 60); // Makes LERP_ALPHA_LINEAR act more like a per-second rate

        let newSpeedAlongForward = Scalar.Lerp(
            currentSpeedAlongForward,
            targetForwardSpeed,
            effectiveLinearLerpAlpha // Use the LERP_ALPHA constant
        );

        if (!forwardInput && !backwardInput) {
            newSpeedAlongForward *= (1 - LINEAR_DAMPING_FACTOR * delta * DAMPING_EFFECT_MULTIPLIER);
        }
        
        _targetLinVelWorld.copyFrom(_worldForward).scaleInPlace(newSpeedAlongForward);

        const lateralVel = _currentLinVel.subtract(_worldForward.scale(currentSpeedAlongForward));
        lateralVel.scaleInPlace(1 - LINEAR_DAMPING_FACTOR * delta * DAMPING_EFFECT_MULTIPLIER * 0.8); 
        
        _newLinVel.copyFrom(_targetLinVelWorld).addInPlace(lateralVel);
        this.tankBody.setLinearVelocity(_newLinVel);


        // --- Angular Velocity Control (around tank's Y axis) ---
        let targetAngularSpeedY = 0;
        const isMoving = forwardInput || backwardInput;

        if (rightTurnInput) {
            targetAngularSpeedY = isMoving ? -TARGET_MOVING_TURN_ANGULAR_VELOCITY : -TARGET_PIVOT_ANGULAR_VELOCITY;
        } else if (leftTurnInput) {
            targetAngularSpeedY = isMoving ? TARGET_MOVING_TURN_ANGULAR_VELOCITY : TARGET_PIVOT_ANGULAR_VELOCITY;
        }

        const effectiveAngularLerpAlpha = 1 - Math.exp(-LERP_ALPHA_ANGULAR * delta * 60); // Makes LERP_ALPHA_ANGULAR act more like a per-second rate

        let newAngularSpeedY = Scalar.Lerp(
            _currentAngVel.y,
            targetAngularSpeedY,
            effectiveAngularLerpAlpha // Use the LERP_ALPHA constant
        );

        if (!leftTurnInput && !rightTurnInput) {
            newAngularSpeedY *= (1 - ANGULAR_DAMPING_FACTOR * delta * DAMPING_EFFECT_MULTIPLIER);
        }
        
        _newAngVel.set(
            _currentAngVel.x * (1 - ANGULAR_DAMPING_FACTOR * delta * DAMPING_EFFECT_MULTIPLIER),
            newAngularSpeedY,
            _currentAngVel.z * (1 - ANGULAR_DAMPING_FACTOR * delta * DAMPING_EFFECT_MULTIPLIER)
        );
        this.tankBody.setAngularVelocity(_newAngVel);

        this.tankBody.getLinearVelocityToRef(_currentLinVel);
        this.tankBody.getAngularVelocityToRef(_currentAngVel);
        this._isCurrentlyMoving = _currentLinVel.lengthSquared() > 0.001 || Math.abs(_currentAngVel.y) > 0.001;
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