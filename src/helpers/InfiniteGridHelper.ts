// src/helpers/InfiniteGridHelper.ts
import * as THREE from 'three';

export class InfiniteGridHelper extends THREE.Mesh {

    constructor ( size1?: number, size2?: number, color?: THREE.Color | string | number, distance?: number, axes = 'xzy' ) {
        // ... (constructor setup code: color, size, distance, planeAxes, geometry) ...
        color = new THREE.Color( color !== undefined ? color : 'white' );
        size1 = size1 !== undefined ? size1 : 10;
        size2 = size2 !== undefined ? size2 : 100;
        distance = distance !== undefined ? distance : 8000;

        const planeAxes = axes.substring( 0, 2 );
        const geometry = new THREE.PlaneGeometry( 2, 2, 1, 1 );


        const material = new THREE.ShaderMaterial( {

            side: THREE.DoubleSide,

            uniforms: {
                uSize1: { value: size1 },
                uSize2: { value: size2 },
                uColor: { value: color },
                uDistance: { value: distance }
            },
            transparent: true,
            vertexShader: `
                // ... (vertex shader code) ...
                varying vec3 worldPosition;
                uniform float uDistance;
                void main() {
                    vec3 pos = position.${axes} * uDistance;
                    pos.${planeAxes} += cameraPosition.${planeAxes};
                    worldPosition = pos;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
                `,
            fragmentShader: `
                // ... (fragment shader code) ...
                 varying vec3 worldPosition;
                 uniform float uSize1;
                 uniform float uSize2;
                 uniform vec3 uColor;
                 uniform float uDistance;
                 float getGrid(float size) {
                    vec2 r = worldPosition.${planeAxes} / size;
                    vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
                    float line = min(grid.x, grid.y);
                    return 1.0 - min(line, 1.0);
                 }
                 void main() {
                    float d = 1.0 - min(distance(cameraPosition.${planeAxes}, worldPosition.${planeAxes}) / uDistance, 1.0);
                    float g1 = getGrid(uSize1);
                    float g2 = getGrid(uSize2);
                    gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
                    gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
                    if ( gl_FragColor.a <= 0.0 ) discard;
                 }
                `,

            // Add type assertion here to bypass incorrect type inference
            extensions: {
                derivatives: true // Needed for fwidth()
            } as any // <-- Add type assertion here

        } );

        super( geometry, material );

        this.name = 'InfiniteGridHelper';
        this.frustumCulled = false;
    }

    // ... (updateUniforms method if you kept it) ...
     updateUniforms(options: { size1?: number; size2?: number; color?: THREE.Color | string | number; distance?: number }) {
        const material = this.material as THREE.ShaderMaterial;
        if (options.size1 !== undefined) material.uniforms.uSize1.value = options.size1;
        if (options.size2 !== undefined) material.uniforms.uSize2.value = options.size2;
        if (options.color !== undefined) material.uniforms.uColor.value.set(options.color);
        if (options.distance !== undefined) material.uniforms.uDistance.value = options.distance;
    }
}