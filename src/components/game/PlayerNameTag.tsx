import React from 'react';
import { Text } from '@react-three/drei';

// Keep constants here or import
const BODY_HEIGHT = 0.6;
const TURRET_HEIGHT = 0.5;

interface PlayerNameTagProps {
    name: string;
    visible: boolean;
}

export function PlayerNameTag({ name, visible }: PlayerNameTagProps) {
    return (
        <Text
            position={[0, BODY_HEIGHT + TURRET_HEIGHT + 0.5, 0]}
            fontSize={0.4}
            color="black"
            anchorX="center"
            anchorY="middle"
            visible={visible}
        >
            {name}
        </Text>
    );
}