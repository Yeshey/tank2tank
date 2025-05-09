// src/gameplay/TankInputController.ts
import { PhysicsBody, Vector3, Quaternion, TransformNode, Axis, Scalar } from '@babylonjs/core/Legacy/legacy';
import {
    TANK_TOTAL_FORWARD_FORCE,
    TANK_PIVOT_TRACK_FORCE,
    MOVING_TURN_DIFFERENTIAL_FORCE,
    ACTIVE_LINEAR_BRAKING_FACTOR,
    ACTIVE_ANGULAR_BRAKING_FACTOR,
    MAX_LINEAR_VELOCITY,
    MAX_ANGULAR_VELOCITY,
    ANTI_DRIFT_FACTOR,
    MIN_SPEED_FOR_ANTI_DRIFT,
    MAX_ANTI_DRIFT_IMPULSE_PER_FRAME, // New constant
    WHEEL_X_OFFSET,
} from '../constants';

// Temporary vectors
const _linVel = new Vector3();
const _angVel = new Vector3();
const _worldForward = new Vector3();
const _worldRight = new Vector3();
const _impulse = new Vector3();
const _angularImpulse = new Vector3();

const _leftTrackLocalOffset = new Vector3(-WHEEL_X_OFFSET, 0, 0);
const _rightTrackLocalOffset = new Vector3(WHEEL_X_OFFSET, 0, 0);
const _leftTrackWorldPos = new Vector3();
const _rightTrackWorldPos = new Vector3();
const _antiDriftImpulseApplied = new Vector3(); // To apply the limited impulse

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

        this.tankBody.getLinearVelocityToRef(_linVel);
        this.tankBody.getAngularVelocityToRef(_angVel);

        this.tankNode.getDirectionToRef(Axis.Z, _worldForward);
        this.tankNode.getDirectionToRef(Axis.X, _worldRight);

        Vector3.TransformCoordinatesToRef(_leftTrackLocalOffset, this.tankNode.getWorldMatrix(), _leftTrackWorldPos);
        Vector3.TransformCoordinatesToRef(_rightTrackLocalOffset, this.tankNode.getWorldMatrix(), _rightTrackWorldPos);

        let leftTrackForceMagnitude = 0;
        let rightTrackForceMagnitude = 0;
        let isMovingForwardOrBackward = false;
        let isTurning = false;

        const forwardInput = (this.keysPressed['w'] || this.keysPressed['arrowup']) ? 1 : 0;
        const backwardInput = (this.keysPressed['s'] || this.keysPressed['arrowdown']) ? 1 : 0;
        const leftTurnInput = (this.keysPressed['a'] || this.keysPressed['arrowleft']) ? 1 : 0;
        const rightTurnInput = (this.keysPressed['d'] || this.keysPressed['arrowright']) ? 1 : 0;

        const baseForwardForcePerTrack = TANK_TOTAL_FORWARD_FORCE / 2;

        if (forwardInput) {
            leftTrackForceMagnitude += baseForwardForcePerTrack;
            rightTrackForceMagnitude += baseForwardForcePerTrack;
            isMovingForwardOrBackward = true;
        }
        if (backwardInput) {
            leftTrackForceMagnitude -= baseForwardForcePerTrack * 0.7;
            rightTrackForceMagnitude -= baseForwardForcePerTrack * 0.7;
            isMovingForwardOrBackward = true;
        }

        // --- Turning Logic ---
        const currentSpeed = _linVel.length();
        // Refined speed factor: less aggressive scaling, starts a bit later.
        // Max scaling factor is 1.0 to prevent over-strengthening the base differential.
        const speedFactorForTurning = Scalar.Clamp(currentSpeed / (MAX_LINEAR_VELOCITY * 0.66), 0.6, 1.0);
        const effectiveMovingTurnDifferential = MOVING_TURN_DIFFERENTIAL_FORCE * speedFactorForTurning;

        if (rightTurnInput) { 
            if (isMovingForwardOrBackward) {
                leftTrackForceMagnitude += effectiveMovingTurnDifferential / 2;
                rightTrackForceMagnitude -= effectiveMovingTurnDifferential / 2;
            } else { 
                leftTrackForceMagnitude += TANK_PIVOT_TRACK_FORCE;
                rightTrackForceMagnitude -= TANK_PIVOT_TRACK_FORCE;
            }
            isTurning = true;
        }
        if (leftTurnInput) { 
            if (isMovingForwardOrBackward) {
                rightTrackForceMagnitude += effectiveMovingTurnDifferential / 2;
                leftTrackForceMagnitude -= effectiveMovingTurnDifferential / 2;
            } else { 
                rightTrackForceMagnitude += TANK_PIVOT_TRACK_FORCE;
                leftTrackForceMagnitude -= TANK_PIVOT_TRACK_FORCE;
            }
            isTurning = true;
        }
        
        if (Math.abs(leftTrackForceMagnitude) > 0.01) {
            _impulse.copyFrom(_worldForward).scaleInPlace(leftTrackForceMagnitude * delta);
            this.tankBody.applyImpulse(_impulse, _leftTrackWorldPos);
        }
        if (Math.abs(rightTrackForceMagnitude) > 0.01) {
            _impulse.copyFrom(_worldForward).scaleInPlace(rightTrackForceMagnitude * delta);
            this.tankBody.applyImpulse(_impulse, _rightTrackWorldPos);
        }

        // --- Anti-Drift Mechanism ---
        const currentSpeedSq = _linVel.lengthSquared();
        if (currentSpeedSq > MIN_SPEED_FOR_ANTI_DRIFT * MIN_SPEED_FOR_ANTI_DRIFT) {
            const lateralVelocity = Vector3.Dot(_linVel, _worldRight);
            
            // Calculate desired anti-drift impulse for this frame
            _antiDriftImpulseApplied.copyFrom(_worldRight).scaleInPlace(-lateralVelocity * ANTI_DRIFT_FACTOR * delta);
            
            // Limit the magnitude of the anti-drift impulse per frame
            const impulseMagnitudeSq = _antiDriftImpulseApplied.lengthSquared();
            const maxImpulseSq = (MAX_ANTI_DRIFT_IMPULSE_PER_FRAME * delta) * (MAX_ANTI_DRIFT_IMPULSE_PER_FRAME * delta);

            if (impulseMagnitudeSq > maxImpulseSq && maxImpulseSq > 0) {
                _antiDriftImpulseApplied.normalize().scaleInPlace(Math.sqrt(maxImpulseSq));
            }
            
            this.tankBody.applyImpulse(_antiDriftImpulseApplied, this.tankNode.getAbsolutePosition());
        }

        // --- Active Braking ---
        if (!isMovingForwardOrBackward && currentSpeedSq > 0.01) {
            _impulse.copyFrom(_linVel).scaleInPlace(-ACTIVE_LINEAR_BRAKING_FACTOR * delta);
            this.tankBody.applyImpulse(_impulse, this.tankNode.getAbsolutePosition());
        }
        if (!isTurning && Math.abs(_angVel.y) > 0.01) {
            _angularImpulse.set(0, _angVel.y * -ACTIVE_ANGULAR_BRAKING_FACTOR * delta, 0);
            this.tankBody.applyAngularImpulse(_angularImpulse);
        }

        // --- Velocity Clamping ---
        this.tankBody.getLinearVelocityToRef(_linVel);
        if (_linVel.lengthSquared() > MAX_LINEAR_VELOCITY * MAX_LINEAR_VELOCITY) {
            _linVel.normalize().scaleInPlace(MAX_LINEAR_VELOCITY);
            this.tankBody.setLinearVelocity(_linVel);
        }
        
        this.tankBody.getAngularVelocityToRef(_angVel);
        if (Math.abs(_angVel.y) > MAX_ANGULAR_VELOCITY) {
            _angVel.y = Math.sign(_angVel.y) * MAX_ANGULAR_VELOCITY;
            this.tankBody.setAngularVelocity(new Vector3(_angVel.x, _angVel.y, _angVel.z));
        }
        
        this._isCurrentlyMoving = _linVel.lengthSquared() > 0.1 || Math.abs(_angVel.y) > 0.1;
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