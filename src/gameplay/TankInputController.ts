// src/gameplay/TankInputController.ts
import { PhysicsBody, Vector3, Quaternion, TransformNode } from '@babylonjs/core/Legacy/legacy';
import {
    MOVE_FORCE, BRAKE_FORCE_MULTIPLIER, MAX_LINEAR_VELOCITY,
    TURN_TORQUE, BRAKE_TORQUE_MULTIPLIER, // TURN_TORQUE will be re-evaluated
} from '../constants';

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
        if (!this.tankBody || !this.tankNode || delta <= 0) return;

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

        // Forward/Backward Movement
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

        // Turning (Yaw) Movement
        // Let's derive angularImpulseMagnitude from a target angular acceleration.
        // Assume TANK_MASS and body dimensions are available from constants.
        // Moment of inertia around Y (Iy) for a box: (m/12)*(w^2+d^2)
        // const tankWidth = 1.5; // From BODY_WIDTH
        // const tankDepth = 2.2; // From BODY_DEPTH
        // const tankMass = 1500; // From TANK_MASS
        // const Iy = (tankMass / 12) * (tankWidth * tankWidth + tankDepth * tankDepth); // approx 886

        // Let's define a more direct turning strength.
        // This value will be the angular impulse applied per second of holding the key.
        // Adjust TANK_YAW_IMPULSE_PER_SECOND for desired turn rate.
        const TANK_YAW_IMPULSE_PER_SECOND = 250; // New constant - units: kg*m^2/s^2 or N*m*s / s = N*m (effective torque)
                                                // Actually, this should be kg*m^2/s (angular momentum units) applied per second.
                                                // Let's treat this as the target angular impulse strength if key held for 1 sec.
                                                // So, for a frame, it's this * delta.
        
        // A simpler approach: define a target change in angular velocity per frame.
        // Let's say we want to change angular velocity by 0.1 rad/s each second if key is pressed.
        // Target Δω per second = 1.5 rad/s (approx 90 deg/s)
        // Angular Impulse = I * Δω.
        // If target Δω for this frame is (1.5 rad/s * delta), then
        // AngularImpulse for this frame = Iy * (1.5 * delta).
        // Given Iy ~ 886, this would be 886 * 1.5 * delta = 1329 * delta.
        // This is similar to using the TURN_TORQUE constant if it represented actual torque.
        
        // Let's use the TURN_TORQUE constant but with a revised scaling factor.
        // TURN_TORQUE was 10000.
        // If TURN_TORQUE represents a desired "torque strength", then impulse = Torque * delta.
        const angularImpulseMagnitude = TURN_TORQUE * delta * 0.02; // PREVIOUSLY: 0.05. Try 0.02 or even lower if TURN_TORQUE is too high.
                                                                  // Or, significantly increase if it was too low. Let's increase. Try 0.2
        // const angularImpulseMagnitude = TURN_TORQUE * delta * 0.20; // Test with a larger factor
        // Let's try an even simpler, more direct value for the impulse per frame.
        // const effectiveFrameImpulse = 50; // units: kg*m^2/s (angular momentum) - TRY THIS
        // const angularImpulseMagnitude = effectiveFrameImpulse * delta; // No, impulse is already "per frame effect" if scaled by delta
        const ANGULAR_IMPULSE_STRENGTH = 5000; // <<<< MASSIVELY INCREASED for testing (was 80)

        if (this.keysPressed['d']) { // Turn Left
            _angularImpulseVec.set(0, ANGULAR_IMPULSE_STRENGTH * delta, 0);
            this.tankBody.applyAngularImpulse(_angularImpulseVec);
            applyingAngularImpulse = true;
            console.log(`TRYING Turn Left Impulse: ${_angularImpulseVec.y.toFixed(3)}, Delta: ${delta.toFixed(4)}`);
            const angVel = this.tankBody.getAngularVelocity();
            if(angVel) console.log(`  Current AngVelY: ${angVel.y.toFixed(3)}`);
        }
        if (this.keysPressed['a']) { // Turn Right
            _angularImpulseVec.set(0, -ANGULAR_IMPULSE_STRENGTH * delta, 0);
            this.tankBody.applyAngularImpulse(_angularImpulseVec);
            applyingAngularImpulse = true;
            console.log(`TRYING Turn Right Impulse: ${_angularImpulseVec.y.toFixed(3)}, Delta: ${delta.toFixed(4)}`);
            const angVel = this.tankBody.getAngularVelocity();
            if(angVel) console.log(`  Current AngVelY: ${angVel.y.toFixed(3)}`);
        }
        
        // Braking
        if (!applyingForce && _currentLinVel.lengthSquared() > 0.01) {
            _impulseVec.copyFrom(_currentLinVel).scaleInPlace(-BRAKE_FORCE_MULTIPLIER * 50 * delta);
            this.tankBody.applyImpulse(_impulseVec, this.tankNode.getAbsolutePosition());
        }
        if (!applyingAngularImpulse && Math.abs(_currentAngVel.y) > 0.01) {
            const angularBrakeImpulseMagnitude = _currentAngVel.y * -BRAKE_TORQUE_MULTIPLIER * 20 * delta; // Reduced braking factor
            _angularImpulseVec.set(0, angularBrakeImpulseMagnitude, 0);
            this.tankBody.applyAngularImpulse(_angularImpulseVec);
        }

        // Velocity Clamping
        this.tankBody.getLinearVelocityToRef(_currentLinVel); // Re-fetch after applying impulses
        if (_currentLinVel.lengthSquared() > MAX_LINEAR_VELOCITY * MAX_LINEAR_VELOCITY) {
            _currentLinVel.normalize().scaleInPlace(MAX_LINEAR_VELOCITY);
            this.tankBody.setLinearVelocity(_currentLinVel);
        }
        
        this._isCurrentlyMoving = _currentLinVel.lengthSquared() > 0.1 || Math.abs(this.tankBody.getAngularVelocity().y) > 0.1; // Get live ang vel
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