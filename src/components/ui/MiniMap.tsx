// src/components/ui/MiniMap.tsx
import { useState, useEffect, useRef, useCallback } from 'react'; // Removed unused React import
import { Vector3, TransformNode, Scene } from '@babylonjs/core/Legacy/legacy';
import type { WallObjectData } from '../game/MazeWall';
import {
    MINIMAP_SIZE_PX, MINIMAP_VIEW_RANGE_RADIUS, MINIMAP_PLAYER_DOT_COLOR,
    MINIMAP_PLAYER_DOT_SIZE_PX, MINIMAP_WALL_DOT_COLOR, MINIMAP_WALL_DOT_MIN_SIZE_PX,
    MINIMAP_BACKGROUND_COLOR, MINIMAP_BORDER_COLOR, MINIMAP_UPDATE_INTERVAL,
} from '../../constants';
import './MiniMap.css';

interface MiniMapProps {
  tankNode: TransformNode | null;
  walls: WallObjectData[];
  scene: Scene | null;
}

interface MapDot {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  isPlayer: boolean;
}

const tankWorldPosVec = new Vector3();

export function MiniMap({ tankNode, walls, scene }: MiniMapProps) {
  const [mapDots, setMapDots] = useState<MapDot[]>([]);
  const lastUpdateTime = useRef(0);
  const animationFrameId = useRef<number>(0);

  const mapRadiusPx = MINIMAP_SIZE_PX / 2;

  const calculateMapDots = useCallback(() => {
    if (!tankNode) {
      setMapDots([]);
      return;
    }

    // Corrected: Use getAbsolutePosition() to get world position
    tankWorldPosVec.copyFrom(tankNode.getAbsolutePosition());
    const newDots: MapDot[] = [];

    newDots.push({
      id: 'player',
      x: mapRadiusPx,
      y: mapRadiusPx,
      size: MINIMAP_PLAYER_DOT_SIZE_PX,
      color: MINIMAP_PLAYER_DOT_COLOR,
      isPlayer: true,
    });

    for (const wall of walls) {
      const relX = wall.position.x - tankWorldPosVec.x;
      const relZ = wall.position.z - tankWorldPosVec.z;

      const distanceToWallSq = relX * relX + relZ * relZ;
      const wallMaxDim = Math.max(wall.size.x, wall.size.z) / 2;

      if (distanceToWallSq < (MINIMAP_VIEW_RANGE_RADIUS + wallMaxDim) ** 2) {
        const mapX = mapRadiusPx + (relX / MINIMAP_VIEW_RANGE_RADIUS) * mapRadiusPx;
        const mapY = mapRadiusPx + (relZ / MINIMAP_VIEW_RANGE_RADIUS) * mapRadiusPx;

        const wallMapSizeX = (wall.size.x / MINIMAP_VIEW_RANGE_RADIUS) * mapRadiusPx;
        const wallMapSizeZ = (wall.size.z / MINIMAP_VIEW_RANGE_RADIUS) * mapRadiusPx;
        const dotSize = Math.max(MINIMAP_WALL_DOT_MIN_SIZE_PX, (wallMapSizeX + wallMapSizeZ) / 2 * 0.7);

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
  }, [tankNode, walls, mapRadiusPx]);

  useEffect(() => {
    if (!scene) return;

    const updateLoop = () => {
        const now = performance.now();
        if (now - lastUpdateTime.current > MINIMAP_UPDATE_INTERVAL) {
            calculateMapDots();
            lastUpdateTime.current = now;
        }
        animationFrameId.current = requestAnimationFrame(updateLoop);
    };

    animationFrameId.current = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [calculateMapDots, scene]);

  if (!tankNode) return null;

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
            left: `${dot.x - dot.size / 2}px`,
            top: `${dot.y - dot.size / 2}px`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            backgroundColor: dot.color,
            borderRadius: dot.isPlayer ? '50%' : '2px',
            zIndex: dot.isPlayer ? 10 : 5,
          }}
        />
      ))}
    </div>
  );
}