import React from 'react';
import { Text } from '@react-three/drei';
// Import constant for positioning
import { NAME_TAG_Y_OFFSET } from '../../constants'; // Adjust path if needed

interface PlayerNameTagProps {
    name: string;
    visible: boolean;
}

export function PlayerNameTag({ name, visible }: PlayerNameTagProps) {
    return (
        <Text
            // Use constant for Y position
            position={[0, NAME_TAG_Y_OFFSET, 0]}
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