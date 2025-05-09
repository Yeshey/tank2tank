// src/components/scene/CameraRig.ts
import {
    Scene,
    UniversalCamera,
    Vector3,
    TransformNode,
    AbstractEngine,
    Observer, // Import Observer type
    Observable // For type hint if needed
} from '@babylonjs/core/Legacy/legacy';
import type { Nullable } from '@babylonjs/core/types';
import {
    BASE_CAMERA_OFFSET,
    LOOK_AT_OFFSET,
    MAX_WORLD_PAN_DISTANCE,
    POSITION_LERP_FACTOR,
    LOOK_AT_LERP_FACTOR,
    USE_ASPECT_RATIO_FOR_PAN,
    MIN_CAMERA_Z_OFFSET_FOR_FULL_PAN,
    Z_PAN_SCALING_AT_MIN_CZO,
} from '../../constants';

const tankPositionVec = new Vector3();
const desiredBaseCameraPosition = new Vector3();
const worldPanOffset = new Vector3();
const finalDesiredCameraPosition = new Vector3();
const desiredLookAtTarget = new Vector3();

export class CameraRig {
    public camera: UniversalCamera;
    private scene: Scene;
    private engine: AbstractEngine;
    private canvas: HTMLCanvasElement;
    private targetNode: Nullable<TransformNode> = null;

    private normalizedMousePosition = { x: 0, y: 0 };

    private currentCameraPosition: Vector3;
    private currentLookAt: Vector3;

    private isInitialized = false;
    private beforeRenderObserver: Nullable<Observer<Scene>> = null; // Store the observer

    constructor(scene: Scene, canvas: HTMLCanvasElement) {
        this.scene = scene;
        this.engine = scene.getEngine();
        this.canvas = canvas;

        this.camera = new UniversalCamera("playerCamera", Vector3.Zero(), scene);
        this.camera.rotation.x = Math.PI / 5;
        this.camera.rotation.y = 0;
        this.camera.detachControl();

        this.currentCameraPosition = Vector3.Zero();
        this.currentLookAt = new Vector3(0, 0, 1);

        window.addEventListener('pointermove', this.handlePointerMove);
        // Store the observer when adding the callback
        this.beforeRenderObserver = this.scene.onBeforeRenderObservable.add(this.updateCamera);
    }

    private initializePositions = () => {
        if (this.targetNode && !this.isInitialized) {
            tankPositionVec.copyFrom(this.targetNode.getAbsolutePosition());

            desiredBaseCameraPosition.copyFrom(tankPositionVec).addInPlace(BASE_CAMERA_OFFSET);
            this.camera.position.copyFrom(desiredBaseCameraPosition);
            this.currentCameraPosition.copyFrom(this.camera.position);

            desiredLookAtTarget.copyFrom(tankPositionVec).addInPlace(LOOK_AT_OFFSET);
            this.camera.setTarget(desiredLookAtTarget);
            this.currentLookAt.copyFrom(desiredLookAtTarget);

            this.isInitialized = true;
            console.log("[CameraRig] Initialized camera position and look-at.");
        }
    }

    private handlePointerMove = (event: PointerEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        this.normalizedMousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.normalizedMousePosition.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    private updateCamera = () => {
        if (!this.targetNode) {
            return;
        }
        if (!this.isInitialized) {
            this.initializePositions();
            if (!this.isInitialized) return;
        }

        tankPositionVec.copyFrom(this.targetNode.getAbsolutePosition());

        desiredBaseCameraPosition.copyFrom(tankPositionVec).addInPlace(BASE_CAMERA_OFFSET);

        let panXMultiplier = MAX_WORLD_PAN_DISTANCE;
        let panZMultiplier = MAX_WORLD_PAN_DISTANCE;

        const screenAspectRatio = this.engine.getScreenAspectRatio();

        if (USE_ASPECT_RATIO_FOR_PAN) {
            if (screenAspectRatio > 1) { 
                panZMultiplier = MAX_WORLD_PAN_DISTANCE * screenAspectRatio;
            } else { 
                 panXMultiplier = MAX_WORLD_PAN_DISTANCE / screenAspectRatio;
            }
        }

        const panAmountX = this.normalizedMousePosition.x * panXMultiplier;
        let panAmountZ = this.normalizedMousePosition.y * panZMultiplier;

        const cameraDistanceAlongZActual = Math.abs(BASE_CAMERA_OFFSET.z);
        let zPanScale = 1.0;

        if (cameraDistanceAlongZActual < MIN_CAMERA_Z_OFFSET_FOR_FULL_PAN) {
            if (MIN_CAMERA_Z_OFFSET_FOR_FULL_PAN <= 0.01) {
                zPanScale = Z_PAN_SCALING_AT_MIN_CZO;
            } else {
                const t = Math.min(1, Math.max(0, cameraDistanceAlongZActual / MIN_CAMERA_Z_OFFSET_FOR_FULL_PAN));
                zPanScale = Z_PAN_SCALING_AT_MIN_CZO + t * (1.0 - Z_PAN_SCALING_AT_MIN_CZO);
            }
        }
        panAmountZ *= zPanScale;

        worldPanOffset.set(panAmountX, 0, panAmountZ);

        finalDesiredCameraPosition.copyFrom(desiredBaseCameraPosition).addInPlace(worldPanOffset);

        desiredLookAtTarget.copyFrom(tankPositionVec).addInPlace(LOOK_AT_OFFSET);
        desiredLookAtTarget.x += worldPanOffset.x;
        desiredLookAtTarget.z += worldPanOffset.z;

        const verticalLookAtShiftFactor = 0.03; 
        desiredLookAtTarget.y += this.normalizedMousePosition.y * panZMultiplier * verticalLookAtShiftFactor * zPanScale;

        Vector3.LerpToRef(this.currentCameraPosition, finalDesiredCameraPosition, POSITION_LERP_FACTOR, this.currentCameraPosition);
        Vector3.LerpToRef(this.currentLookAt, desiredLookAtTarget, LOOK_AT_LERP_FACTOR, this.currentLookAt);

        this.camera.position.copyFrom(this.currentCameraPosition);
        this.camera.setTarget(this.currentLookAt);
    };

    public setTarget(node: Nullable<TransformNode>): void {
        if (this.targetNode !== node) {
            this.targetNode = node;
            this.isInitialized = false; 
            if (this.targetNode) {
                this.initializePositions();
            }
        }
    }

    public dispose(): void {
        window.removeEventListener('pointermove', this.handlePointerMove);
        // Use remove() with the stored observer
        if (this.beforeRenderObserver) {
            this.scene.onBeforeRenderObservable.remove(this.beforeRenderObserver);
            this.beforeRenderObserver = null; // Clear the stored observer
        }
        if (!this.camera.isDisposed()) { // Check if camera is already disposed
            this.camera.dispose();
        }
        console.log("[CameraRig] Disposed.");
    }
}