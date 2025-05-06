// src/constants.ts
import * as THREE from 'three'; // <-- ADD THIS IMPORT

// Tank Dimensions
export const BODY_WIDTH = 1.5;
export const BODY_HEIGHT = 0.6;
export const BODY_DEPTH = 2.2;
export const TURRET_RADIUS = 0.5;
export const TURRET_HEIGHT = 0.5;
export const BARREL_RADIUS = 0.1;
export const BARREL_LENGTH = 1.5;

// Tank Movement Physics
export const MOVE_FORCE = 180;
export const BRAKE_FORCE_MULTIPLIER = 0.8;
export const MAX_LINEAR_VELOCITY = 5;

export const TURN_TORQUE = 150;
export const BRAKE_TORQUE_MULTIPLIER = 0.85;
export const MAX_ANGULAR_VELOCITY = 2.0;

// Turret Aiming
export const TURRET_ROTATE_SPEED = Math.PI * 1.2;

// Camera Settings
export const BASE_CAMERA_OFFSET = new THREE.Vector3(0, 12, 14); // Now THREE is defined
export const LOOK_AT_OFFSET = new THREE.Vector3(0, 0.5, 0);     // Now THREE is defined
export const MOUSE_INFLUENCE_FACTOR = 3.5;
export const POSITION_LERP_FACTOR = 0.06;
export const LOOK_AT_LERP_FACTOR = 0.08;

// Player Name Tag Offset
export const NAME_TAG_Y_OFFSET = BODY_HEIGHT + TURRET_HEIGHT + 0.5; // Calculated offset

// Turret Group Offset (relative to tank body center)
export const TURRET_GROUP_Y_OFFSET = BODY_HEIGHT + 0.01;
export const TURRET_GROUP_Z_OFFSET = -0.2;

// Barrel Offset (relative to turret center)
export const BARREL_Z_OFFSET = -(TURRET_RADIUS + BARREL_LENGTH / 2);

// Collider Offset (relative to RigidBody center)
export const COLLIDER_Y_OFFSET = BODY_HEIGHT / 2;