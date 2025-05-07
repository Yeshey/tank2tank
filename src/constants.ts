// src/constants.ts
import * as THREE from 'three';

export const SHOW_FPS_STATS = true; // Set to true to show FPS counter, false to hide

// =====================================================================
// World Dimensions (NEW)
// =====================================================================
export const PHYSICS_GROUND_SIDE_LENGTH = 10000; // e.g., 10km
export const RAYCAST_PLANE_SIDE_LENGTH = 10000; // e.g., 10km, can be same or larger than physics

// =====================================================================
// Tank Visual Dimensions
// =====================================================================
// ... (rest of your existing constants) ...
export const BODY_WIDTH = 1.5;
export const BODY_HEIGHT = 0.6; // Keep base height
export const BODY_DEPTH = 2.2;
export const BODY_EDGE_RADIUS = 0.15; // Added: How much to round the body edges
export const BODY_SMOOTHNESS = 2;    // Added: Segments for rounded edges

export const TURRET_RADIUS = 0.5;
export const TURRET_HEIGHT = 0.5;

// --- Barrel Changes ---
export const BARREL_RADIUS = 0.1; // *** Much smaller radius ***
export const BARREL_LENGTH = 0.45;  // Slightly shorter?
// Adjust offset if needed due to length/radius change
export const BARREL_Z_OFFSET = -(TURRET_RADIUS + BARREL_LENGTH / 2 - 0.1);

// --- Wheel Dimensions (New) ---
export const WHEEL_RADIUS = 0.25;
export const WHEEL_THICKNESS = 0.15; // How wide the wheel is
export const WHEEL_SPACING = 0.65; // Distance between centers of wheels along the side
export const WHEEL_Y_OFFSET = -(BODY_HEIGHT / 2) + WHEEL_RADIUS * 0.8; // Position wheels slightly below the body center
export const WHEEL_X_OFFSET = BODY_WIDTH / 2; // Position wheels at the edge of the body width


// =====================================================================
// Tank Movement Physics (Tweaked for "Fun")
// =====================================================================
// Increased forces for more power/responsiveness
export const MOVE_FORCE = 250; // Increased from 180
export const TURN_TORQUE = 200; // Increased from 150

// Reduced brake multipliers for more "coasting" / less abrupt stops
export const BRAKE_FORCE_MULTIPLIER = 0.3; // Reduced from 0.5
export const BRAKE_TORQUE_MULTIPLIER = 0.6; // Reduced from 0.85

// Slightly increased max speeds
export const MAX_LINEAR_VELOCITY = 12; // Increased from 11
export const MAX_ANGULAR_VELOCITY = 2.5; // Increased from 2.0

// =====================================================================
// Turret Aiming - No changes needed here
// =====================================================================
export const TURRET_ROTATE_SPEED = Math.PI * 0.5;

// =====================================================================
// Camera Settings - No changes needed unless physics changes warrant them
// =====================================================================
// ... (keep existing camera constants) ...
export const CAMERA_Y_OFFSET = 18;
export const CAMERA_Z_OFFSET = 11;
export const BASE_CAMERA_OFFSET = new THREE.Vector3(0, CAMERA_Y_OFFSET, CAMERA_Z_OFFSET);
export const LOOK_AT_OFFSET = new THREE.Vector3(0, 0.2, 0);
export const MOUSE_PAN_FACTOR = 8.0;
export const POSITION_LERP_FACTOR = 0.05;
export const LOOK_AT_LERP_FACTOR = 0.07;
export const USE_ORTHOGRAPHIC_CAMERA = false;
export const ORTHO_CAMERA_ZOOM = 50;
export const ORTHO_NEAR_CLIP = 0.1;
export const ORTHO_FAR_CLIP = 1000;


// =====================================================================
// Visual Offsets (Relative Positioning)
// =====================================================================
export const NAME_TAG_Y_OFFSET = BODY_HEIGHT + TURRET_HEIGHT + 0.5; // May need slight adjustment if body rounding affects perceived height
export const TURRET_GROUP_Y_OFFSET = BODY_HEIGHT / 2 + 0.01; // Position relative to center now body origin is center
export const TURRET_GROUP_Z_OFFSET = -0.2;
// BARREL_Z_OFFSET already defined above
export const COLLIDER_Y_OFFSET = 0; // Collider center aligns with body center