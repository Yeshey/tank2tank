// src/constants.ts
import * as BABYLON from '@babylonjs/core/Legacy/legacy'; // For Vector3

// Gameplay & Visuals
export const SHOW_FPS_STATS = true;
// USE_ASPECT_RATIO_FOR_PAN might be handled differently in Babylon.js camera controls

// World Dimensions
export const PHYSICS_GROUND_SIDE_LENGTH = 10000;
export const RAYCAST_PLANE_SIDE_LENGTH = 10000; // Ground itself can be used for raycasting

// Tank Visual Dimensions
export const BODY_WIDTH = 1.5;
export const BODY_HEIGHT = 0.6;
export const BODY_DEPTH = 2.2;
// BODY_EDGE_RADIUS and BODY_SMOOTHNESS are harder to directly translate without custom geometry or advanced techniques.
// For simplicity, we'll use standard boxes.

export const TURRET_RADIUS = 0.5;
export const TURRET_HEIGHT = 0.5;
export const BARREL_RADIUS = 0.1;
export const BARREL_LENGTH = 0.45;
export const BARREL_Z_OFFSET = -(TURRET_RADIUS + BARREL_LENGTH / 2 - 0.1); // Relative to turret center

export const WHEEL_RADIUS = 0.25;
export const WHEEL_THICKNESS = 0.15;
export const WHEEL_SPACING = 0.65;
export const WHEEL_Y_OFFSET = -(BODY_HEIGHT / 2) + WHEEL_RADIUS * 0.8;
export const WHEEL_X_OFFSET = BODY_WIDTH / 2;

// Tank Movement Physics
export const MOVE_FORCE = 30000; // Increased for more acceleration
export const TURN_TORQUE = 20000; // Increased for more responsive turning, acts as base for angular impulse
export const BRAKE_FORCE_MULTIPLIER = 0.9; // Affects how quickly linear velocity is damped by braking
export const BRAKE_TORQUE_MULTIPLIER = 0.9; // Affects how quickly angular velocity is damped by braking
export const MAX_LINEAR_VELOCITY = 20; // Increased top speed
export const MAX_ANGULAR_VELOCITY = Math.PI; // Radians/sec (approx 180 deg/s), increased for faster pivoting

// Factors for active braking impulses when keys are released
export const BRAKING_LINEAR_FACTOR = 60; // Multiplier for linear braking impulse
export const BRAKING_ANGULAR_FACTOR = 30; // Multiplier for angular braking impulse


// Turret Aiming
export const TURRET_ROTATE_SPEED = Math.PI * 0.75; // Radians per second (approx 135 deg/s), this is the max constant speed

// Camera Settings (These will be adapted for Babylon.js cameras)
export const CAMERA_INITIAL_TARGET_OFFSET = new BABYLON.Vector3(0, 1, 0); // Look slightly above tank base
export const CAMERA_ALPHA = -Math.PI / 2; // Initial horizontal rotation
export const CAMERA_BETA = Math.PI / 3;   // Initial vertical rotation (angle from XZ plane)
export const CAMERA_RADIUS = 30;          // Initial distance from target
export const CAMERA_LOWER_RADIUS_LIMIT = 10;
export const CAMERA_UPPER_RADIUS_LIMIT = 50;
export const CAMERA_MIN_TARGET_DISTANCE_FOR_PAN = 2.0; // World units mouse pan can shift target

// Mouse Panning Sensitivity (adjust as needed)
export const MOUSE_PAN_SENSITIVITY_X = 0.05;
export const MOUSE_PAN_SENSITIVITY_Y = 0.05; // For Z-axis panning (inverted)


// Visual Offsets
export const NAME_TAG_Y_OFFSET = BODY_HEIGHT + TURRET_HEIGHT + 0.5;
export const TURRET_GROUP_Y_OFFSET = BODY_HEIGHT / 2 + 0.01;
export const TURRET_GROUP_Z_OFFSET = -0.2;
// COLLIDER_Y_OFFSET is not needed if physics body matches visual origin

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

// Physics
export const DEFAULT_FRICTION = 0.8; // Increased for less sliding
export const DEFAULT_RESTITUTION = 0.1; // Bounciness
export const TANK_MASS = 1500; // Kilograms
export const WALL_MASS = 0; // Static

export const BASE_CAMERA_OFFSET = new BABYLON.Vector3(
    0,  // X offset from tank (0 for centered)
    25, // Y offset (HEIGHT above tank). INCREASE THIS FOR "MORE ABOVE". Try 30, 35, 40.
    -12 // Z offset (DISTANCE behind tank). DECREASE magnitude (e.g. -10, -8) for "closer and steeper".
);

// LOOK_AT_OFFSET: Fine-tunes where the camera looks relative to the tank's origin.
// - Y: Look slightly above the tank's base (e.g., at its turret or body center).
//      If camera is very high, looking at `0` or a small positive Y on the tank is usually good.
export const LOOK_AT_OFFSET = new BABYLON.Vector3(
    0,  // X look-at offset (usually 0)
    0.5, // Y look-at offset (height on the tank to look at). Try 0, 0.5, 1.0.
    0   // Z look-at offset (usually 0, looking at the tank's XZ center)
);


export const MAX_WORLD_PAN_DISTANCE = 5.0; // Max world units mouse pan can shift view from center. Tune this.
export const USE_ASPECT_RATIO_FOR_PAN = true;

// Adaptive Z-Pan (forward/backward pan from mouse Y)
export const MIN_CAMERA_Z_OFFSET_FOR_FULL_PAN = 10.0; // If camera is closer than 10 units (abs Z), Z-pan is reduced.
export const Z_PAN_SCALING_AT_MIN_CZO = 0.3;      // At very close distances, Z-pan is scaled by this factor (e.g., 30%).

export const POSITION_LERP_FACTOR = 0.08; // Smoothing for camera position (0.01 to 0.1 is common), slightly increased for faster tank
export const LOOK_AT_LERP_FACTOR = 0.12;   // Smoothing for look-at target, slightly increased