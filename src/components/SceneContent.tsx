import React, { useRef, useState, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { TransformControls, Grid, OrbitControls } from "@react-three/drei";
import { Object3D, Vector2, Raycaster, Mesh } from "three";

interface SceneContentProps {
  selectedObject: Object3D | null;
  onSelect: (object: Object3D | null) => void;
  onSceneReady: (scene: any) => void;
  transformMode: "translate" | "rotate" | "scale";
}

const SceneContent: React.FC<SceneContentProps> = ({
  selectedObject,
  onSelect,
  onSceneReady,
  transformMode = "translate",
}) => {
  const { scene, camera, gl } = useThree();
  const orbitControlsRef = useRef<any>();
  const transformControlsRef = useRef<any>();
  const [isTransforming, setIsTransforming] = useState(false);
  const raycaster = useRef(new Raycaster());
  const pointer = useRef(new Vector2());

  // 场景准备好后通知父组件
  useEffect(() => {
    onSceneReady(scene);
  }, [scene, onSceneReady]);

  // 设置变换控制器事件
  useEffect(() => {
    const controls = transformControlsRef.current;
    if (controls) {
      // 变换开始时禁用轨道控制器
      const onDraggingChanged = (event: any) => {
        const { value } = event.target;
        setIsTransforming(value);
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = !value;
        }
      };

      controls.addEventListener("dragging-changed", onDraggingChanged);
      return () =>
        controls.removeEventListener("dragging-changed", onDraggingChanged);
    }
  }, [transformControlsRef]);

  // 处理场景点击选择对象
  const handleSceneClick = (event: any) => {
    if (isTransforming) return;

    // 计算归一化的指针位置
    pointer.current.set(
      (event.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(event.clientY / gl.domElement.clientHeight) * 2 + 1
    );

    // 设置选择射线
    raycaster.current.setFromCamera(pointer.current, camera);

    // 获取场景中可点击的对象（过滤掉辅助对象、网格等）
    const selectableObjects = scene.children.filter((child: Object3D) => {
      return (
        child.type === "Mesh" ||
        child.type === "Group" ||
        child.type === "DirectionalLight" ||
        child.type === "PointLight" ||
        child.type === "AmbientLight"
      );
    });

    // 计算射线和对象的交点
    const intersects = raycaster.current.intersectObjects(
      selectableObjects,
      true
    );

    // 选择首个交点对象，忽略辅助对象
    if (intersects.length > 0) {
      let selected = intersects[0].object;

      // 迭代查找可选父级对象（例如，如果点击了组内的网格，选择该组）
      while (selected.parent && selected.parent !== scene) {
        if (selected.parent.type === "Group") {
          selected = selected.parent;
        } else {
          break;
        }
      }

      onSelect(selected);
    } else {
      // 如果点击了空白区域，取消选择
      onSelect(null);
    }
  };

  // 添加点击监听
  useEffect(() => {
    const canvas = gl.domElement;

    canvas.addEventListener("click", handleSceneClick);
    return () => canvas.removeEventListener("click", handleSceneClick);
  }, [gl, handleSceneClick]);

  // 在每帧更新时检查并应用变换
  useFrame(() => {
    // 如果有选中对象且变换控制器存在
    if (selectedObject && transformControlsRef.current) {
      // 确保变换控制器附加到当前选中的对象
      transformControlsRef.current.attach(selectedObject);
    }
  });

  return (
    <>
      {/* 基础场景设置 */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* 网格辅助对象 */}
      <Grid
        infiniteGrid
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#4b5563"
        fadeDistance={30}
        fadeStrength={1.5}
      />

      {/* 控制器 */}
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.5}
      />

      {/* 变换控制器 */}
      {selectedObject && (
        <TransformControls
          ref={transformControlsRef}
          object={selectedObject}
          mode={transformMode}
          size={0.75}
        />
      )}
    </>
  );
};

export default SceneContent;
