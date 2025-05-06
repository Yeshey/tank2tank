// src/constants.ts
import * as THREE from 'three';

// =====================================================================
// Tank Visual Dimensions (in world units) - No changes needed here
// =====================================================================
export const BODY_WIDTH = 1.5;
export const BODY_HEIGHT = 0.6;
export const BODY_DEPTH = 2.2;
export const TURRET_RADIUS = 0.5;
export const TURRET_HEIGHT = 0.5;
export const BARREL_RADIUS = 0.1;
export const BARREL_LENGTH = 1.5;

// =====================================================================
// Tank Movement Physics (Rapier Configuration) - No changes needed here
// =====================================================================
export const MOVE_FORCE = 180;
export const BRAKE_FORCE_MULTIPLIER = 0.5;
export const MAX_LINEAR_VELOCITY = 11;
export const TURN_TORQUE = 150;
export const BRAKE_TORQUE_MULTIPLIER = 0.85;
export const MAX_ANGULAR_VELOCITY = 2.0;

// =====================================================================
// Turret Aiming - No changes needed here
// =====================================================================
export const TURRET_ROTATE_SPEED = Math.PI * 0.5; // 90 degrees per second

// =====================================================================
// Camera Settings
// =====================================================================

// --- Camera Positioning ---
// How high above the tank's base position the camera should be.
export const CAMERA_Y_OFFSET = 18; // <-- Increased height significantly
// How far back (along the Z-axis) the camera should be from the tank.
// A smaller value brings it closer to directly overhead.
export const CAMERA_Z_OFFSET = 11; // <-- Reduced distance back
// Base offset vector calculated from the above constants. Used for initial positioning.
export const BASE_CAMERA_OFFSET = new THREE.Vector3(0, CAMERA_Y_OFFSET, CAMERA_Z_OFFSET);
// An offset FROM the tank's base position where the camera should *look*.
// Lowering this slightly since the camera is higher.
export const LOOK_AT_OFFSET = new THREE.Vector3(0, 0.2, 0);

// --- Mouse Panning ---
// How much the mouse position (from center screen) influences the camera's PANNING offset.
// This now controls parallel shifting, not rotation influence. Higher = more shift.
export const MOUSE_PAN_FACTOR = 8.0; // <-- Increased panning severity

// --- Smoothness (Lerp) ---
// Value between 0 and 1. Smaller = smoother/slower follow, Larger = snappier/faster follow.
export const POSITION_LERP_FACTOR = 0.05;
// Value between 0 and 1. Smaller = smoother/slower look, Larger = snappier/faster look.
export const LOOK_AT_LERP_FACTOR = 0.07;

// --- Orthographic Camera Toggle & Settings ---
// Set to true to use Orthographic camera, false for Perspective.
export const USE_ORTHOGRAPHIC_CAMERA = false; // <-- Set to true to switch
// Zoom factor for the orthographic camera. Larger value = zooms out.
export const ORTHO_CAMERA_ZOOM = 50;
// Near and Far clipping planes for orthographic camera.
export const ORTHO_NEAR_CLIP = 0.1;
export const ORTHO_FAR_CLIP = 1000;


// =====================================================================
// Visual Offsets (Relative Positioning for Model Parts) - No changes needed here
// =====================================================================
export const NAME_TAG_Y_OFFSET = BODY_HEIGHT + TURRET_HEIGHT + 0.5;
export const TURRET_GROUP_Y_OFFSET = BODY_HEIGHT + 0.01;
export const TURRET_GROUP_Z_OFFSET = -0.2;
export const BARREL_Z_OFFSET = -(TURRET_RADIUS + BARREL_LENGTH / 2);
export const COLLIDER_Y_OFFSET = BODY_HEIGHT / 2;