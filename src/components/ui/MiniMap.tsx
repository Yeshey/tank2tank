// src/components/ui/MiniMap.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { TankRef } from '../game/Tank';
import type { WallObjectData } from '../GameScene'; // Import WallData type from GameScene
import {
    MINIMAP_SIZE_PX,
    MINIMAP_VIEW_RANGE_RADIUS,
    MINIMAP_PLAYER_DOT_COLOR,
    MINIMAP_PLAYER_DOT_SIZE_PX,
    MINIMAP_WALL_DOT_COLOR,
    MINIMAP_WALL_DOT_MIN_SIZE_PX,
    MINIMAP_BACKGROUND_COLOR,
    MINIMAP_BORDER_COLOR,
    MINIMAP_UPDATE_INTERVAL,
} from '../../constants';
import './MiniMap.css'; // We'll create this CSS file

interface MiniMapProps {
  tankRef: React.RefObject<TankRef | null>;
  walls: WallObjectData[];
}

interface MapDot {
  id: string;
  x: number; // pixel coordinate on map
  y: number; // pixel coordinate on map
  size: number; // pixel size of dot
  color: string;
  isPlayer: boolean;
}

const tankWorldPosVec = new THREE.Vector3(); // Reusable vector for tank's world position
const wallCenterWorldPosVec = new THREE.Vector3(); // Reusable vector for wall's center

export function MiniMap({ tankRef, walls }: MiniMapProps) {
  const [mapDots, setMapDots] = useState<MapDot[]>([]);
  const lastUpdateTime = useRef(0);

  const mapRadiusPx = MINIMAP_SIZE_PX / 2;

  const calculateMapDots = useCallback(() => {
    const tank = tankRef.current;
    if (!tank || !tank.group) {
      return;
    }

    tank.group.getWorldPosition(tankWorldPosVec);
    const newDots: MapDot[] = [];

    // Player dot (always at the center of the minimap)
    newDots.push({
      id: 'player',
      x: mapRadiusPx,
      y: mapRadiusPx,
      size: MINIMAP_PLAYER_DOT_SIZE_PX,
      color: MINIMAP_PLAYER_DOT_COLOR,
      isPlayer: true,
    });

    // Wall dots
    for (const wall of walls) {
      wallCenterWorldPosVec.copy(wall.position); // Walls are positioned by their center already

      // Calculate wall's position relative to the tank on the XZ plane
      const relX = wallCenterWorldPosVec.x - tankWorldPosVec.x;
      const relZ = wallCenterWorldPosVec.z - tankWorldPosVec.z;

      // Check if wall is within minimap's view range (distance check)
      const distanceToWallSq = relX * relX + relZ * relZ;
      const wallMaxDim = Math.max(wall.size.x, wall.size.z) / 2; // half of max horizontal dimension
      if (distanceToWallSq < (MINIMAP_VIEW_RANGE_RADIUS + wallMaxDim) ** 2) {
        // Convert relative world coords to map pixel coords
        // World +X (right) is Map +X
        // World +Z (forward/away from camera at start) is Map +Y (down on map)
        const mapX = mapRadiusPx + (relX / MINIMAP_VIEW_RANGE_RADIUS) * mapRadiusPx;
        const mapY = mapRadiusPx + (relZ / MINIMAP_VIEW_RANGE_RADIUS) * mapRadiusPx;

        // Calculate size of wall dot on map (proportional to its world size)
        const wallMapSizeX = (wall.size.x / MINIMAP_VIEW_RANGE_RADIUS) * mapRadiusPx;
        const wallMapSizeZ = (wall.size.z / MINIMAP_VIEW_RANGE_RADIUS) * mapRadiusPx;
        // For a dot, we can take an average or max, let's use max for visibility
        const dotSize = Math.max(MINIMAP_WALL_DOT_MIN_SIZE_PX, (wallMapSizeX + wallMapSizeZ) / 2 * 0.7); // 0.7 factor to make them a bit smaller

        // Ensure the dot itself is somewhat within the circular boundary to avoid harsh clips
        const distFromMapCenterSq = (mapX - mapRadiusPx)**2 + (mapY - mapRadiusPx)**2;
        if (distFromMapCenterSq < (mapRadiusPx - dotSize / 2)**2) {
           newDots.push({
            id: wall.id,
            x: mapX,
            y: mapY,
            size: dotSize,
            color: MINIMAP_WALL_DOT_COLOR,
            isPlayer: false,
          });
        }
      }
    }
    setMapDots(newDots);
  }, [tankRef, walls, mapRadiusPx]);


  useEffect(() => {
    const updateLoop = () => {
        const now = performance.now();
        if (now - lastUpdateTime.current > MINIMAP_UPDATE_INTERVAL) {
            calculateMapDots();
            lastUpdateTime.current = now;
        }
        animationFrameId.current = requestAnimationFrame(updateLoop);
    };

    let animationFrameId = { current: requestAnimationFrame(updateLoop) }; // Keep as object for closure

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [calculateMapDots]);


  return (
    <div
      className="minimap-container"
      style={{
        width: `${MINIMAP_SIZE_PX}px`,
        height: `${MINIMAP_SIZE_PX}px`,
        backgroundColor: MINIMAP_BACKGROUND_COLOR,
        borderColor: MINIMAP_BORDER_COLOR,
      }}
    >
      {mapDots.map(dot => (
        <div
          key={dot.id}
          className="minimap-dot"
          style={{
            left: `${dot.x - dot.size / 2}px`, // Center the dot
            top: `${dot.y - dot.size / 2}px`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            backgroundColor: dot.color,
            borderRadius: dot.isPlayer ? '50%' : '2px', // Player is circle, walls are squares
            zIndex: dot.isPlayer ? 10 : 5,
          }}
        />
      ))}
    </div>
  );
}