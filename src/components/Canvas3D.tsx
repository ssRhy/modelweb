import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  TransformControls,
  Grid,
  PerspectiveCamera,
} from "@react-three/drei";
import Model from "./Model";
import DefaultModel from "./DefaultModel";

interface Canvas3DProps {
  modelUrl: string | null;
  isEditing: boolean;
}

const Canvas3D: React.FC<Canvas3DProps> = ({ modelUrl, isEditing }) => {
  const modelRef = useRef(null);

  return (
    <div className="w-full h-full">
      <Canvas shadows>
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[0, 2, 5]} />
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={10}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Grid helper */}
        <Grid infiniteGrid cellSize={1} cellThickness={0.5} />

        {/* The 3D model */}
        {modelUrl ? (
          <>
            <Model ref={modelRef} url={modelUrl} />
            {isEditing && modelRef.current && (
              <TransformControls object={modelRef.current} mode="translate" />
            )}
          </>
        ) : (
          <>
            <DefaultModel ref={modelRef} />
            {isEditing && modelRef.current && (
              <TransformControls object={modelRef.current} mode="translate" />
            )}
          </>
        )}
      </Canvas>
    </div>
  );
};

export default Canvas3D;
