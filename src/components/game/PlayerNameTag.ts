// src/components/game/PlayerNameTag.ts
import { Scene, TransformNode } from '@babylonjs/core/Legacy/legacy'; // Removed unused Vector3
import { AdvancedDynamicTexture, TextBlock, Control } from '@babylonjs/gui'; // Corrected import path

export class PlayerNameTag {
    private texture: AdvancedDynamicTexture;
    private textBlock: TextBlock;
    // private parentNode: TransformNode; // Not strictly needed if only used in constructor
    // private yOffset: number; // Not strictly needed if only used in constructor

    constructor(name: string, scene: Scene, parentNode: TransformNode, yOffset: number) {
        // this.parentNode = parentNode; // Store if needed for updates
        // this.yOffset = yOffset; // Store if needed for updates

        this.texture = AdvancedDynamicTexture.CreateFullscreenUI(`PlayerNameTagUI_${parentNode.name}`, true, scene);

        this.textBlock = new TextBlock(`nameTagText_${parentNode.name}`);
        this.textBlock.text = name;
        this.textBlock.color = "black";
        this.textBlock.fontSize = 18;
        this.textBlock.fontWeight = "bold";
        this.textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        this.texture.addControl(this.textBlock);
        this.textBlock.linkWithMesh(parentNode);
        // The yOffset for GUI linkOffsetY is in pixels on the 2D GUI plane.
        // A positive value moves it down, negative up.
        // The scaling factor depends on your desired visual offset in 3D projected to 2D.
        // You might need to experiment. Let's try a scaling factor.
        // A common approach is to use a small invisible plane above the tank and link to that.
        // For simplicity:
        this.textBlock.linkOffsetY = -yOffset * 20; // Adjust this multiplier (e.g., 20, 30)

        this.setVisible(true);
    }

    public setVisible(visible: boolean): void {
        this.textBlock.isVisible = visible;
    }

    public updateText(newName: string): void {
        this.textBlock.text = newName;
    }

    public dispose(): void {
        this.textBlock.dispose();
        this.texture.dispose(); // Dispose texture if it's unique per tag
    }
}