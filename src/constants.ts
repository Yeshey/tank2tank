// src/constants.ts
import * as BABYLON from '@babylonjs/core/Legacy/legacy'; // For Vector3

// Gameplay & Visuals
export const SHOW_FPS_STATS = true;

// World Dimensions
export const PHYSICS_GROUND_SIDE_LENGTH = 10000;
export const RAYCAST_PLANE_SIDE_LENGTH = 10000; // Ground itself can be used for raycasting (though less critical for arcade)

// Tank Visual Dimensions (Define the look of your tank model)
export const BODY_WIDTH = 1.5;
export const BODY_HEIGHT = 0.6;
export const BODY_DEPTH = 2.2;

export const TURRET_RADIUS = 0.5;
export const TURRET_HEIGHT = 0.5;
export const BARREL_RADIUS = 0.1;
export const BARREL_LENGTH = 0.45;
// BARREL_Z_OFFSET is used in TankModel.ts if you have it, example:
// export const BARREL_Z_OFFSET = -(TURRET_RADIUS + BARREL_LENGTH / 2 - 0.1);

export const WHEEL_RADIUS = 0.25;
export const WHEEL_THICKNESS = 0.15;
export const WHEEL_SPACING = 0.65; // Distance from center to a wheel group along Z
export const WHEEL_Y_OFFSET = -(BODY_HEIGHT / 2) + WHEEL_RADIUS * 0.8; // Vertical position of wheels
export const WHEEL_X_OFFSET = BODY_WIDTH / 2; // Horizontal position of wheels from center

// --- Arcade Tank Movement ---
// Target speed for forward/backward movement
export const TARGET_MAX_LINEAR_VELOCITY = 15;       // units per second
// How quickly the tank reaches its target linear speed using Lerp.
// Higher = snappier. Typical values: 0.1 (smoother) to 0.3 (very responsive).
// This will be the 'alpha' in Scalar.Lerp(current, target, LERP_ALPHA_LINEAR)
export const LERP_ALPHA_LINEAR = 0.15; // Adjust for desired acceleration "feel"

// Target angular speed for PIVOT turns (A/D only)
export const TARGET_PIVOT_ANGULAR_VELOCITY = Math.PI * 1.8; // Radians per second (fast pivot, ~324 deg/s)
// Target angular speed when TURNING WHILE MOVING (W+A/D)
export const TARGET_MOVING_TURN_ANGULAR_VELOCITY = Math.PI * 1.5; // Radians per second (~270 deg/s)
// How quickly the tank reaches its target angular speed using Lerp.
export const LERP_ALPHA_ANGULAR = 0.20; // Adjust for desired turning "feel"


// Damping factors for when no input keys are pressed.
// These are multipliers for (1 - factor * delta * effect_multiplier)
export const LINEAR_DAMPING_FACTOR = 0.92;
export const ANGULAR_DAMPING_FACTOR = 0.90;
// General multiplier for how strong damping feels per second.
export const DAMPING_EFFECT_MULTIPLIER = 15;


// Turret Aiming
export const TURRET_ROTATE_SPEED = Math.PI * 1.5; // Radians per second for turret rotation

// Camera Settings
export const CAMERA_INITIAL_TARGET_OFFSET = new BABYLON.Vector3(0, 1, 0);
export const CAMERA_ALPHA = -Math.PI / 2;
export const CAMERA_BETA = Math.PI / 3;
export const CAMERA_RADIUS = 30;
export const CAMERA_LOWER_RADIUS_LIMIT = 10;
export const CAMERA_UPPER_RADIUS_LIMIT = 50;
export const CAMERA_MIN_TARGET_DISTANCE_FOR_PAN = 2.0;

// Mouse Panning Sensitivity (if your CameraRig uses these)
export const MOUSE_PAN_SENSITIVITY_X = 0.05;
export const MOUSE_PAN_SENSITIVITY_Y = 0.05;

// Visual Offsets for UI elements or model parts
export const NAME_TAG_Y_OFFSET = BODY_HEIGHT + TURRET_HEIGHT + 0.5;
export const TURRET_GROUP_Y_OFFSET = BODY_HEIGHT / 2 + 0.01; // Turret pivot relative to tank body center
export const TURRET_GROUP_Z_OFFSET = -0.2;                   // Turret pivot relative to tank body center

// Maze Wall Generation
export const WALL_COUNT = 75;
export const WALL_MIN_SIZE = new BABYLON.Vector3(2, 3, 2);
export const WALL_MAX_SIZE = new BABYLON.Vector3(15, 6, 15);
export const WALL_SPAWN_AREA_MIN_RADIUS = 15;
export const WALL_SPAWN_AREA_MAX_RADIUS = 150;
export const WALL_COLOR_HEX = '#6c757d';
export const WALL_MIN_DISTANCE_FROM_TANK_START = 10;

// Mini-map
export const MINIMAP_ENABLED = true;
export const MINIMAP_SIZE_PX = 160;
export const MINIMAP_VIEW_RANGE_RADIUS = 70;
export const MINIMAP_PLAYER_DOT_COLOR = '#e63946';
export const MINIMAP_PLAYER_DOT_SIZE_PX = 8;
export const MINIMAP_WALL_DOT_COLOR = '#343a40';
export const MINIMAP_WALL_DOT_MIN_SIZE_PX = 3;
export const MINIMAP_BACKGROUND_COLOR = 'rgba(220, 220, 220, 0.75)';
export const MINIMAP_BORDER_COLOR = '#495057';
export const MINIMAP_UPDATE_INTERVAL = 100; // ms

// Physics Material Properties (for collisions)
export const DEFAULT_FRICTION = 0.5;    // Friction between physics bodies
export const DEFAULT_RESTITUTION = 0.1; // Bounciness of physics bodies
export const TANK_MASS = 100;           // Mass of the tank physics body (affects collision response)
// export const WALL_MASS = 0;             // Static walls
export const WALL_MASS = 1000;             // Static walls

// Camera Rig Specific Constants (if you have a custom CameraRig.ts)
export const BASE_CAMERA_OFFSET = new BABYLON.Vector3(0, 25, -12);
export const LOOK_AT_OFFSET = new BABYLON.Vector3(0, 0.5, 0);
export const MAX_WORLD_PAN_DISTANCE = 5.0;
export const USE_ASPECT_RATIO_FOR_PAN = true;
export const MIN_CAMERA_Z_OFFSET_FOR_FULL_PAN = 10.0;
export const Z_PAN_SCALING_AT_MIN_CZO = 0.3;
export const POSITION_LERP_FACTOR = 0.10; // Smoothing for camera position
export const LOOK_AT_LERP_FACTOR = 0.15;  // Smoothing for look-at target