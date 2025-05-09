// src/components/BabylonSceneComponent.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core/Legacy/legacy';
// We need HavokPlugin from core
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
// And HavokPhysics from @babylonjs/havok for manual WASM loading
import HavokPhysics from '@babylonjs/havok'; // Make sure this is imported

import { Tank } from './game/Tank';
import type { TankHandle } from './game/Tank';
import { createMazeWalls } from './game/MazeWall';
import type { WallObjectData } from './game/MazeWall';
import { setupSceneEnvironment } from './scene/SceneSetup';
import { CameraRig } from './scene/CameraRig';
import { MiniMap } from './ui/MiniMap';

import {
    SHOW_FPS_STATS,
    WALL_COUNT,
    WALL_MIN_SIZE,
    WALL_MAX_SIZE,
    WALL_SPAWN_AREA_MIN_RADIUS,
    WALL_SPAWN_AREA_MAX_RADIUS,
    WALL_MIN_DISTANCE_FROM_TANK_START,
    MINIMAP_ENABLED,
} from '../constants';

// This will hold the instance from HavokPhysics (the low-level WASM bindings)
let havokInstance: Awaited<ReturnType<typeof HavokPhysics>>;

interface BabylonSceneComponentProps {
  playerName: string;
}

export const BabylonSceneComponent: React.FC<BabylonSceneComponentProps> = ({ playerName }) => {
  const reactCanvas = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<BABYLON.Engine | null>(null);
  const [scene, setScene] = useState<BABYLON.Scene | null>(null);
  const [wallsData, setWallsData] = useState<WallObjectData[]>([]);
  const tankRef = useRef<TankHandle | null>(null);
  // We don't need a state for the plugin if we create it within the effect that uses it
  const [physicsInitialized, setPhysicsInitialized] = useState(false);


  useEffect(() => {
    const setupPhysicsAndScene = async () => {
      if (!reactCanvas.current || engine) return; // Already initialized or canvas not ready

      try {
        console.log("[BabylonSceneComponent] Starting physics and scene setup...");

        // Step 1: Load Havok WASM manually using HavokPhysics from @babylonjs/havok
        console.log("[BabylonSceneComponent] Loading Havok WASM manually...");
        
        // Vite serves files from 'public' directory at the base path.
        // import.meta.env.BASE_URL handles the '/tank2tank/' part.
        const wasmUrl = `${import.meta.env.BASE_URL}HavokPhysics.wasm`.replace(/\/\//g, '/');
        console.log(`[BabylonSceneComponent] locateFile will return: ${wasmUrl}`);

        havokInstance = await HavokPhysics({
            locateFile: (file: string) => {
                // 'file' argument is typically 'HavokPhysics.wasm'
                console.log(`[HavokPhysics] locateFile called with: ${file}. Returning: ${wasmUrl}`);
                return wasmUrl;
            }
        });
        console.log("[BabylonSceneComponent] Havok WASM loaded successfully via HavokPhysics and locateFile.");
        setPhysicsInitialized(true);

        // Step 2: Initialize Babylon Engine and Scene
        const babylonEngine = new BABYLON.Engine(reactCanvas.current, true, {
          preserveDrawingBuffer: true,
          stencil: true,
          antialias: true,
        });
        const babylonScene = new BABYLON.Scene(babylonEngine);

        // Step 3: Create HavokPlugin (from @babylonjs/core) and pass the loaded WASM instance
        console.log("[BabylonSceneComponent] Creating HavokPlugin and passing the loaded havokInstance.");
        const havokPlugin = new HavokPlugin(true, havokInstance); // Pass true if needed, and the havokInstance

        // Step 4: Enable physics on the scene
        console.log("[BabylonSceneComponent] Enabling physics on the scene.");
        babylonScene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), havokPlugin);
        console.log("[BabylonSceneComponent] Physics enabled on scene.");

        setEngine(babylonEngine);
        setScene(babylonScene);

        const resize = () => babylonEngine.resize();
        window.addEventListener('resize', resize);

        babylonEngine.runRenderLoop(() => {
          if (babylonScene.activeCamera) {
              babylonScene.render();
          }
          if (SHOW_FPS_STATS) {
              const fpsDiv = document.getElementById('fps');
              if (fpsDiv) fpsDiv.innerHTML = babylonEngine.getFps().toFixed() + " fps";
          }
        });

        // Cleanup function for this effect
        return () => {
          console.log("[BabylonSceneComponent] Cleaning up engine and scene.");
          window.removeEventListener('resize', resize);
          // The HavokPlugin might have its own dispose, but scene.dispose should handle it.
          // if (havokPlugin && typeof (havokPlugin as any).dispose === 'function') {
          //     (havokPlugin as any).dispose();
          // }
          babylonEngine.dispose(); // Disposes scene as well
          setEngine(null);
          setScene(null);
          setPhysicsInitialized(false);
        };

      } catch (e) {
        console.error("[BabylonSceneComponent] Error during physics or scene setup:", e);
         if (e instanceof Error && (e.message.includes("magic number") || e.message.includes("HK is not defined") || e.message.includes("ವಾಮಾಚಾರದ"))) {
            const wasmFileExpected = `${import.meta.env.BASE_URL}HavokPhysics.wasm`.replace(/\/\//g, '/');
            console.error(
              "Hint: This error often means the WASM file ('HavokPhysics.wasm') was not found or loaded correctly. " +
              `The system tried to load it from a path resolving to '${wasmFileExpected}'. ` +
              "Check the Network tab in your browser's developer tools: " +
              "1. Was 'HavokPhysics.wasm' requested? " +
              "2. What was the full URL and status code? (Should be 200) " +
              "3. If 200, is the response content actual WASM binary or an HTML error page? " +
              "Ensure 'public/HavokPhysics.wasm' exists and is correctly served by Vite."
            );
        }
      }
    };

    // Call the async setup function
    setupPhysicsAndScene();

    // The return from setupPhysicsAndScene is the cleanup function,
    // which useEffect will call on unmount or if dependencies change.
    // However, since we want it to run once, and the async function itself
    // returns a promise of the cleanup, we need to handle this slightly differently
    // if we were to re-run this effect. For a one-time setup, this structure is okay,
    // but let's make it explicit that we return the promise of cleanup.
    // For simplicity now, the cleanup is returned from within the try block.

  }, []); // Run once on mount

  // Scene content setup (walls, tank, etc.) - depends on scene and engine
  useEffect(() => {
    if (scene && engine && physicsInitialized) {
      console.log("[BabylonSceneComponent] Physics initialized, setting up scene content (ground, tank, walls).");
      const sceneEnv = setupSceneEnvironment(scene);
      const cameraRig = new CameraRig(scene, reactCanvas.current!);

      const generatedWalls: WallObjectData[] = [];
      const tankInitialPos = new BABYLON.Vector3(0, 2, 0);

      for (let i = 0; i < WALL_COUNT; i++) {
        let newWallPosition: BABYLON.Vector3;
        let newWallSize: BABYLON.Vector3;
        let distToTankStart: number;
        let attempts = 0;
        do {
            const angle = Math.random() * Math.PI * 2;
            const radius = WALL_SPAWN_AREA_MIN_RADIUS + Math.random() * (WALL_SPAWN_AREA_MAX_RADIUS - WALL_SPAWN_AREA_MIN_RADIUS);
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            newWallSize = new BABYLON.Vector3(
                BABYLON.Scalar.RandomRange(WALL_MIN_SIZE.x, WALL_MAX_SIZE.x),
                BABYLON.Scalar.RandomRange(WALL_MIN_SIZE.y, WALL_MAX_SIZE.y),
                BABYLON.Scalar.RandomRange(WALL_MIN_SIZE.z, WALL_MAX_SIZE.z)
            );
            newWallPosition = new BABYLON.Vector3(x, newWallSize.y / 2, z);
            const clearanceRadius = Math.max(newWallSize.x, newWallSize.z) / 2;
            const tempWallPosXZ = new BABYLON.Vector3(newWallPosition.x, 0, newWallPosition.z);
            const tempTankPosXZ = new BABYLON.Vector3(tankInitialPos.x, 0, tankInitialPos.z);
            distToTankStart = BABYLON.Vector3.Distance(tempWallPosXZ, tempTankPosXZ) - clearanceRadius;
            attempts++;
        } while (distToTankStart < WALL_MIN_DISTANCE_FROM_TANK_START && attempts < 20);

        if (distToTankStart >= WALL_MIN_DISTANCE_FROM_TANK_START) {
            generatedWalls.push({
                id: `wall-${i}-${Date.now()}`,
                position: newWallPosition,
                size: newWallSize,
            });
        }
      }
      setWallsData(generatedWalls);
      createMazeWalls(scene, generatedWalls, sceneEnv.shadowGenerator);

      const tank = new Tank(scene, playerName, tankInitialPos, sceneEnv.shadowGenerator);
      tankRef.current = tank;
      if (tank.getVisualMesh()) {
        cameraRig.setTarget(tank.getVisualMesh());
      }

      return () => {
        console.log("[BabylonSceneComponent] Cleaning up scene content (tank, walls).");
        tank.dispose();
        generatedWalls.forEach(data => {
            const wallMesh = scene.getMeshByName(data.id);
            if (wallMesh) {
                wallMesh.dispose(); // Ensure impostors/bodies are disposed too
            }
        });
        // sceneEnv.ground.dispose(); // Ground is part of sceneEnv, might be disposed by engine.dispose()
      };
    }
  }, [scene, engine, playerName, physicsInitialized]); // Add physicsInitialized dependency

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={reactCanvas} style={{ width: '100%', height: '100%', outline: 'none' }} />
      {SHOW_FPS_STATS && <div id="fps" style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px' }}></div>}
      {MINIMAP_ENABLED && scene && tankRef.current && tankRef.current.getVisualMesh() && wallsData.length > 0 && (
        <MiniMap
            tankNode={tankRef.current.getVisualMesh()}
            walls={wallsData}
            scene={scene}
        />
      )}
      {!physicsInitialized && <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', backgroundColor: 'rgba(0,0,0,0.7)', padding: '20px', borderRadius: '5px', zIndex: 1000}}>Initializing Physics... Please wait.</div>}
    </div>
  );
};