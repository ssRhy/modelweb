import React, { useRef, useState, useEffect, forwardRef } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Box3, Vector3 } from "three";

interface ModelProps {
  url: string;
}

const Model = forwardRef<THREE.Group, ModelProps>(({ url }, ref) => {
  const gltf = useLoader(GLTFLoader, url);
  const { scene } = useThree();
  const [scaleRatio, setScaleRatio] = useState(1);

  useEffect(() => {
    if (gltf) {
      // Create a clone of the loaded model
      const modelClone = gltf.scene.clone();

      // Calculate bounding box to normalize scale
      const box = new Box3().setFromObject(modelClone);
      const size = box.getSize(new Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z);

      // Normalize model to a reasonable size
      const newScale = 2 / maxDimension;
      setScaleRatio(newScale);

      // Center model
      const center = box.getCenter(new Vector3());
      modelClone.position.x = -center.x;
      modelClone.position.y = -center.y;
      modelClone.position.z = -center.z;
    }
  }, [gltf]);

  return (
    <group ref={ref} scale={[scaleRatio, scaleRatio, scaleRatio]}>
      <primitive object={gltf.scene} />
    </group>
  );
});

Model.displayName = "Model";

export default Model;
