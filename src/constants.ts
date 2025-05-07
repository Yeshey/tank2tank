// src/constants.ts
import * as THREE from 'three';

export const SHOW_FPS_STATS = true; // Set to true to show FPS counter, false to hide
export const USE_ASPECT_RATIO_FOR_PAN = true; // NEW: Set to false to ignore aspect ratio for panning reach

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
// src/constants.ts

// =====================================================================
// Camera Settings
// =====================================================================
export const CAMERA_Y_OFFSET = 25; // Your new value
export const CAMERA_Z_OFFSET = 7;  // Your new value
export const BASE_CAMERA_OFFSET = new THREE.Vector3(0, CAMERA_Y_OFFSET, CAMERA_Z_OFFSET);
export const LOOK_AT_OFFSET = new THREE.Vector3(0, 0.2, 0); // Vertical offset for look-at target from tank base

export const MIN_CAMERA_Z_OFFSET_FOR_FULL_PAN = 8.0; // Below this CZO, Z-pan will be scaled down.
export const Z_PAN_SCALING_AT_MIN_CZO = 0.5;     // At CZO=0 (or very small), Z-pan is scaled by this (e.g., 50%)

// export const MOUSE_PAN_FACTOR = 8.0; // We'll replace this simple factor
export const MAX_WORLD_PAN_DISTANCE = 2.0; // NEW: Max distance (world units) mouse pan can shift the view center.

export const POSITION_LERP_FACTOR = 0.05; // Smoothing for camera position
export const LOOK_AT_LERP_FACTOR = 0.07;  // Smoothing for look-at target

export const USE_ORTHOGRAPHIC_CAMERA = false;
export const ORTHO_CAMERA_ZOOM = 50;
export const ORTHO_NEAR_CLIP = 0.1;
export const ORTHO_FAR_CLIP = 1000;

// ... (rest of constants)

// NEW PANNING CONSTANTS
export const MAX_PAN_DISTANCE_HORIZONTAL = 12.0;      // Max world units to pan left/right
export const MAX_PAN_DISTANCE_VERTICAL_FORWARD = 18.0; // Max world units to pan "forward" (mouse down)
export const MAX_PAN_DISTANCE_VERTICAL_BACKWARD = 6.0; // Max world units to pan "backward" (mouse up)
export const REFERENCE_ASPECT_RATIO = 16 / 9;        // e.g., 1920x1080

// =====================================================================
// Visual Offsets (Relative Positioning)
// =====================================================================
export const NAME_TAG_Y_OFFSET = BODY_HEIGHT + TURRET_HEIGHT + 0.5; // May need slight adjustment if body rounding affects perceived height
export const TURRET_GROUP_Y_OFFSET = BODY_HEIGHT / 2 + 0.01; // Position relative to center now body origin is center
export const TURRET_GROUP_Z_OFFSET = -0.2;
// BARREL_Z_OFFSET already defined above
export const COLLIDER_Y_OFFSET = 0; // Collider center aligns with body center


// =====================================================================
// Maze Wall Generation (NEW)
// =====================================================================
export const WALL_COUNT = 75; // Number of walls to generate
export const WALL_MIN_SIZE = new THREE.Vector3(2, 3, 2); // Min width, height, depth of a wall segment
export const WALL_MAX_SIZE = new THREE.Vector3(15, 6, 15); // Max width, height, depth
export const WALL_SPAWN_AREA_MIN_RADIUS = 15; // Min distance from origin (0,0,Z) to start spawning walls
export const WALL_SPAWN_AREA_MAX_RADIUS = 150; // Max distance from origin for initial wall spawn
export const WALL_COLOR = '#6c757d'; // A medium grey color for walls
export const WALL_MIN_DISTANCE_FROM_TANK_START = 10; // Min distance walls should be from tank's initial position

// =====================================================================
// Mini-map (NEW)
// =====================================================================
export const MINIMAP_ENABLED = true;
export const MINIMAP_SIZE_PX = 160; // Diameter of the mini-map in pixels
export const MINIMAP_VIEW_RANGE_RADIUS = 70; // World units visible from the center of the map to its edge
export const MINIMAP_PLAYER_DOT_COLOR = '#e63946'; // A distinct color for the player
export const MINIMAP_PLAYER_DOT_SIZE_PX = 8;
export const MINIMAP_WALL_DOT_COLOR = '#343a40';   // Dark grey for walls on map
export const MINIMAP_WALL_DOT_MIN_SIZE_PX = 3;
export const MINIMAP_BACKGROUND_COLOR = 'rgba(220, 220, 220, 0.75)'; // Semi-transparent light grey
export const MINIMAP_BORDER_COLOR = '#495057';
export const MINIMAP_UPDATE_INTERVAL = 100; // ms, how often to update map positions (for performance)
