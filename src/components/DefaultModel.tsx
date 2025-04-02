import React, { forwardRef } from "react";
import { Box, Sphere, Cone } from "@react-three/drei";

interface DefaultModelProps {}

const DefaultModel = forwardRef<THREE.Group, DefaultModelProps>(
  (props, ref) => {
    return (
      <group ref={ref}>
        {/* Base cube */}
        <Box position={[0, -0.5, 0]} args={[2, 0.5, 2]}>
          <meshStandardMaterial color="#3a86ff" />
        </Box>

        {/* Sphere */}
        <Sphere position={[0, 0.8, 0]} args={[0.8, 16, 16]}>
          <meshStandardMaterial
            color="#ff006e"
            metalness={0.4}
            roughness={0.2}
          />
        </Sphere>

        {/* Cone */}
        <Cone position={[0, 2.2, 0]} args={[0.5, 1, 16]}>
          <meshStandardMaterial color="#ffbe0b" />
        </Cone>
      </group>
    );
  }
);

DefaultModel.displayName = "DefaultModel";

export default DefaultModel;
