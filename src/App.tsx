import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { Tank } from './components/Tank'; // Adjust path if needed
import './App.css'; // Keep or modify existing styles

function App() {
  return (
    <>
      {/* Optional: Add traditional HTML UI elements here if needed */}
      {/* <h1 style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1 }}>Tank2Tank</h1> */}

      <Canvas
        shadows // Enable shadows
        camera={{ position: [5, 5, 10], fov: 50 }} // Set camera position and field of view
        style={{ background: '#ffffff' }} // White background
      >
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* Use Environment for nice ambient lighting and reflections (optional but looks good) */}
        <Environment preset="sunset" background={false}/>


        {/* Grid */}
        <Grid
          infiniteGrid // Make the grid infinite
          cellSize={0.5} // Size of each grid cell
          cellThickness={0.5} // Thickness of the grid lines
          cellColor="#cccccc" // Light grey color for the cells
          sectionSize={2} // Size of the major grid sections
          sectionThickness={1} // Thickness of the major grid lines
          sectionColor="#aaaaaa" // Darker grey color for the sections
          fadeDistance={50} // Distance at which the grid starts to fade
          fadeStrength={1} // How quickly the grid fades
        />

        {/* Tank - Use Suspense for potential async loading later */}
        <Suspense fallback={null}>
          <Tank position={[0, 0, 0]} />
        </Suspense>

        {/* Controls - Allows mouse dragging to orbit the camera */}
        <OrbitControls makeDefault />
      </Canvas>
    </>
  );
}

export default App;