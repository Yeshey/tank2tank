import { useState, useEffect, useCallback } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
// Import constants
import {
    MOVE_FORCE,
    BRAKE_FORCE_MULTIPLIER,
    MAX_LINEAR_VELOCITY,
    TURN_TORQUE,
    BRAKE_TORQUE_MULTIPLIER,
    MAX_ANGULAR_VELOCITY
} from '../constants'; // Adjust path if needed

// Helper vectors/quaternions (keep these)
const _worldQuat = new THREE.Quaternion();
const _forwardDir = new THREE.Vector3(0, 0, -1); // Local forward
const _velocity = new THREE.Vector3();
const _angVel = new THREE.Vector3();
const _impulse = new THREE.Vector3();
const _torque = new THREE.Vector3();

export function useTankControls(rigidBodyRef: React.RefObject<RapierRigidBody | null>) {
    const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({});
    const [isMoving, setIsMoving] = useState(false);

    // Keyboard event handlers (no change)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            setKeysPressed((prev) => ({ ...prev, [event.key.toLowerCase()]: true }));
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            setKeysPressed((prev) => ({ ...prev, [event.key.toLowerCase()]: false }));
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Movement logic updated for Rapier
    const updateMovement = useCallback((delta: number) => {
        const rb = rigidBodyRef.current;
        if (!rb) return;

        let applyingForce = false;
        let applyingTorque = false;

        _velocity.copy(rb.linvel());
        _angVel.copy(rb.angvel());
        _worldQuat.copy(rb.rotation());

        // Linear Movement
        if (keysPressed['w'] || keysPressed['arrowup']) {
            const worldForward = _forwardDir.clone().applyQuaternion(_worldQuat);
            // Apply impulse scaled by delta for consistency across frame rates
            _impulse.copy(worldForward).multiplyScalar(MOVE_FORCE * delta);
            rb.applyImpulse(_impulse, true);
            applyingForce = true;
        }
        if (keysPressed['s'] || keysPressed['arrowdown']) {
            const worldForward = _forwardDir.clone().applyQuaternion(_worldQuat);
            _impulse.copy(worldForward).multiplyScalar(-MOVE_FORCE * delta);
            rb.applyImpulse(_impulse, true);
            applyingForce = true;
        }

        // Angular Movement
        if (keysPressed['a'] || keysPressed['q']) {
            _torque.set(0, TURN_TORQUE * delta, 0); // Scale torque by delta
            rb.applyTorqueImpulse(_torque, true);
            applyingTorque = true;
        }
        if (keysPressed['d']) {
            _torque.set(0, -TURN_TORQUE * delta, 0); // Scale torque by delta
            rb.applyTorqueImpulse(_torque, true);
            applyingTorque = true;
        }

        // Damping
        if (!applyingForce && _velocity.lengthSq() > 0.01) {
            // Scale damping impulse by delta? Maybe not, damping can be constant resistance
            _impulse.copy(_velocity).multiplyScalar(-BRAKE_FORCE_MULTIPLIER);
            rb.applyImpulse(_impulse, true);
        }
        if (!applyingTorque && Math.abs(_angVel.y) > 0.01) {
             // Scale damping torque by delta? Maybe not
            _torque.set(0, -_angVel.y * BRAKE_TORQUE_MULTIPLIER, 0);
            rb.applyTorqueImpulse(_torque, true);
         }

         // Clamp Velocities
         _velocity.copy(rb.linvel());
         if (_velocity.length() > MAX_LINEAR_VELOCITY) {
             _velocity.normalize().multiplyScalar(MAX_LINEAR_VELOCITY);
             rb.setLinvel(_velocity, true);
         }
         _angVel.copy(rb.angvel());
         if (Math.abs(_angVel.y) > MAX_ANGULAR_VELOCITY) {
             _angVel.y = Math.sign(_angVel.y) * MAX_ANGULAR_VELOCITY;
             rb.setAngvel(_angVel, true);
         }

        setIsMoving(_velocity.lengthSq() > 0.1 || Math.abs(_angVel.y) > 0.1);

    }, [keysPressed, rigidBodyRef]);

    return { isMoving, updateMovement };
}