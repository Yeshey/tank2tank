// src/constants.ts
import * as THREE from 'three';

// =====================================================================
// Tank Visual Dimensions (in world units)
// =====================================================================
export const BODY_WIDTH = 1.5;          // How wide the main tank chassis is
export const BODY_HEIGHT = 0.6;         // How tall the main tank chassis is
export const BODY_DEPTH = 2.2;          // How long the main tank chassis is
export const TURRET_RADIUS = 0.5;       // Radius of the cylindrical turret
export const TURRET_HEIGHT = 0.5;       // Height of the cylindrical turret
export const BARREL_RADIUS = 0.1;       // Radius of the cylindrical barrel
export const BARREL_LENGTH = 1.5;       // Length of the cylindrical barrel

// =====================================================================
// Tank Movement Physics (Rapier Configuration)
// =====================================================================
// --- Linear Movement (Forward/Backward) ---
export const MOVE_FORCE = 180;          // Force applied when W/S is pressed. Higher = faster acceleration.
export const BRAKE_FORCE_MULTIPLIER = 0.8; // Multiplier for the opposing force applied when movement keys are released. Higher = stops faster.
export const MAX_LINEAR_VELOCITY = 5;   // Maximum speed the tank can reach. Prevents excessive velocity buildup.

// --- Angular Movement (Turning) ---
export const TURN_TORQUE = 150;         // Torque impulse applied when A/D is pressed. Higher = faster turning acceleration.
export const BRAKE_TORQUE_MULTIPLIER = 0.85;// Multiplier for the opposing torque applied when turning keys are released. Higher = stops turning faster.
export const MAX_ANGULAR_VELOCITY = 2.0; // Maximum turning speed (radians/second). Prevents uncontrollable spinning.

// =====================================================================
// Turret Aiming
// =====================================================================
// Turret rotation speed towards the mouse cursor (radians per second)
// Math.PI is 180 degrees, so Math.PI * 0.5 is 90 degrees per second.
// Decrease this value to make the turret turn slower.
export const TURRET_ROTATE_SPEED = Math.PI * 0.5; // <-- Decreased as requested

// =====================================================================
// Camera Settings
// =====================================================================
// Base offset of the camera FROM the tank's position IN WORLD SPACE.
// (X, Y, Z) - Y controls height, Z controls distance behind.
// Increased Y and Z for a higher and more distant view.
export const BASE_CAMERA_OFFSET = new THREE.Vector3(0, 18, 20); // <-- Increased Y & Z

// An offset FROM the tank's position where the camera should look.
// (0, 0.5, 0) means look slightly above the tank's base position.
export const LOOK_AT_OFFSET = new THREE.Vector3(0, 0.5, 0);

// How much the mouse position (from center screen) influences the camera's PANNING offset.
// Higher value means the camera view shifts more drastically as the mouse moves.
export const MOUSE_INFLUENCE_FACTOR = 5.5; // <-- Increased as requested

// Smoothness factor for camera position interpolation (Lerp).
// Value between 0 and 1. Smaller = smoother/slower follow, Larger = snappier/faster follow.
export const POSITION_LERP_FACTOR = 0.05; // Slightly smoother

// Smoothness factor for camera look-at target interpolation (Lerp).
// Value between 0 and 1. Smaller = smoother/slower look, Larger = snappier/faster look.
export const LOOK_AT_LERP_FACTOR = 0.07; // Slightly smoother

// =====================================================================
// Visual Offsets (Relative Positioning for Model Parts)
// =====================================================================
// Y-Offset for the player name tag relative to the tank's base (0,0,0).
export const NAME_TAG_Y_OFFSET = BODY_HEIGHT + TURRET_HEIGHT + 0.5;

// Position of the Turret Group relative to the tank's main group origin.
export const TURRET_GROUP_Y_OFFSET = BODY_HEIGHT + 0.01; // Slightly above body
export const TURRET_GROUP_Z_OFFSET = -0.2;             // Slightly towards the back

// Position of the Barrel mesh relative to the Turret Group's origin.
export const BARREL_Z_OFFSET = -(TURRET_RADIUS + BARREL_LENGTH / 2);

// Y-Position of the tank's physics collider relative to the RigidBody's origin.
// Assumes RigidBody origin is at the tank's base center.
export const COLLIDER_Y_OFFSET = BODY_HEIGHT / 2;