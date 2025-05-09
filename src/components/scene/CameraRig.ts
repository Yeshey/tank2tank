// src/components/scene/CameraRig.ts
import { Scene, ArcRotateCamera, Vector3, TransformNode, PointerEventTypes } from '@babylonjs/core/Legacy/legacy';
import type { Nullable } from '@babylonjs/core/types'; // For type-only import
import {
    CAMERA_ALPHA, CAMERA_BETA, CAMERA_RADIUS,
    CAMERA_LOWER_RADIUS_LIMIT, CAMERA_UPPER_RADIUS_LIMIT,
    MOUSE_PAN_SENSITIVITY_X, MOUSE_PAN_SENSITIVITY_Y, CAMERA_MIN_TARGET_DISTANCE_FOR_PAN
} from '../../constants';

export class CameraRig {
    public camera: ArcRotateCamera;
    private scene: Scene;
    // private canvas: HTMLCanvasElement; // Unused, can be removed
    private targetNode: Nullable<TransformNode> = null;
    private panOffset: Vector3 = new Vector3(0,0,0);
    private isPointerDown: boolean = false;
    private lastPointerX: number = 0;
    private lastPointerY: number = 0;

    constructor(scene: Scene, canvas: HTMLCanvasElement) { // canvas is used for attachControl
        this.scene = scene;
        // this.canvas = canvas; // Store if needed for other things

        this.camera = new ArcRotateCamera(
            "camera",
            CAMERA_ALPHA,
            CAMERA_BETA,
            CAMERA_RADIUS,
            new Vector3(0, 1, 0),
            scene
        );

        this.camera.attachControl(canvas, true, false); // last arg prevents default right click pan
        this.camera.lowerRadiusLimit = CAMERA_LOWER_RADIUS_LIMIT;
        this.camera.upperRadiusLimit = CAMERA_UPPER_RADIUS_LIMIT;
        this.camera.panningSensibility = 0; 
        this.camera.wheelPrecision = 50;

        this.scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN:
                    // Check for right mouse button (button index 2) for panning
                    if (pointerInfo.event.button === 2) {
                        this.isPointerDown = true;
                        this.lastPointerX = pointerInfo.event.clientX;
                        this.lastPointerY = pointerInfo.event.clientY;
                        pointerInfo.event.preventDefault(); // Prevent context menu
                    }
                    break;
                case PointerEventTypes.POINTERUP:
                    if (pointerInfo.event.button === 2) {
                        this.isPointerDown = false;
                    }
                    break;
                case PointerEventTypes.POINTERMOVE:
                    if (!this.isPointerDown || !this.targetNode) break;

                    const dx = pointerInfo.event.clientX - this.lastPointerX;
                    const dy = pointerInfo.event.clientY - this.lastPointerY;

                    const cameraWorldMatrix = this.camera.getWorldMatrix();
                    const cameraRight = Vector3.TransformNormal(new Vector3(1, 0, 0), cameraWorldMatrix);
                    const cameraUp = Vector3.TransformNormal(new Vector3(0,1,0), cameraWorldMatrix); // Use camera's up for Y-pan

                    // Pan for X mouse movement (along camera's right)
                    this.panOffset.addInPlace(cameraRight.scale(dx * MOUSE_PAN_SENSITIVITY_X * -1));
                    
                    // Pan for Y mouse movement (along camera's up, effectively moving target on XZ-like plane from camera view)
                    // We want to pan the *target*, so moving mouse UP (negative dy) should move target UP (positive along cameraUp)
                    this.panOffset.addInPlace(cameraUp.scale(dy * MOUSE_PAN_SENSITIVITY_Y * 1));


                    if (this.panOffset.lengthSquared() > CAMERA_MIN_TARGET_DISTANCE_FOR_PAN * CAMERA_MIN_TARGET_DISTANCE_FOR_PAN) {
                        this.panOffset.normalize().scaleInPlace(CAMERA_MIN_TARGET_DISTANCE_FOR_PAN);
                    }

                    this.lastPointerX = pointerInfo.event.clientX;
                    this.lastPointerY = pointerInfo.event.clientY;
                    break;
            }
        });
        
        // Prevent context menu on right click for the canvas
        canvas.addEventListener('contextmenu', (event) => event.preventDefault());


        scene.onBeforeRenderObservable.add(() => {
            if (this.targetNode) {
                const desiredTargetPosition = this.targetNode.getAbsolutePosition().add(this.panOffset);
                this.camera.target = Vector3.Lerp(this.camera.target, desiredTargetPosition, 0.1);
            }
        });
    }

    public setTarget(node: TransformNode): void {
        this.targetNode = node;
    }

    public dispose(): void {
        this.camera.dispose();
    }
}