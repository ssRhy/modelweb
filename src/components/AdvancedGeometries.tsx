import React, { useState } from "react";
import {
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  ConeGeometry,
  TorusGeometry,
  TorusKnotGeometry,
  OctahedronGeometry,
  TetrahedronGeometry,
  IcosahedronGeometry,
  DodecahedronGeometry,
  PlaneGeometry,
  CircleGeometry,
  RingGeometry,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshNormalMaterial,
  MeshLambertMaterial,
  MeshToonMaterial,
  Color,
} from "three";

// 几何体选项
const geometryOptions = [
  { name: "立方体", value: "box" },
  { name: "球体", value: "sphere" },
  { name: "圆柱体", value: "cylinder" },
  { name: "圆锥体", value: "cone" },
  { name: "圆环", value: "torus" },
  { name: "扭结环", value: "torusKnot" },
  { name: "八面体", value: "octahedron" },
  { name: "四面体", value: "tetrahedron" },
  { name: "二十面体", value: "icosahedron" },
  { name: "十二面体", value: "dodecahedron" },
  { name: "平面", value: "plane" },
  { name: "圆形", value: "circle" },
  { name: "圆环面", value: "ring" },
];

// 材质选项
const materialOptions = [
  { name: "标准 (Standard)", value: "standard" },
  { name: "基础 (Basic)", value: "basic" },
  { name: "Phong", value: "phong" },
  { name: "物理 (Physical)", value: "physical" },
  { name: "法线 (Normal)", value: "normal" },
  { name: "Lambert", value: "lambert" },
  { name: "卡通 (Toon)", value: "toon" },
];

interface AdvancedGeometriesProps {
  onAddObject: (object: Mesh) => void;
  onClose: () => void;
}

const AdvancedGeometries: React.FC<AdvancedGeometriesProps> = ({
  onAddObject,
  onClose,
}) => {
  const [selectedGeometry, setSelectedGeometry] = useState("box");
  const [selectedMaterial, setSelectedMaterial] = useState("standard");
  const [materialColor, setMaterialColor] = useState("#808080");
  const [wireframe, setWireframe] = useState(false);
  const [metalness, setMetalness] = useState(0.5);
  const [roughness, setRoughness] = useState(0.5);
  const [opacity, setOpacity] = useState(1);
  const [transparent, setTransparent] = useState(false);

  // 创建几何体
  const createGeometry = () => {
    switch (selectedGeometry) {
      case "box":
        return new BoxGeometry(1, 1, 1);
      case "sphere":
        return new SphereGeometry(0.5, 32, 32);
      case "cylinder":
        return new CylinderGeometry(0.5, 0.5, 1, 32);
      case "cone":
        return new ConeGeometry(0.5, 1, 32);
      case "torus":
        return new TorusGeometry(0.5, 0.2, 16, 32);
      case "torusKnot":
        return new TorusKnotGeometry(0.5, 0.2, 64, 16);
      case "octahedron":
        return new OctahedronGeometry(0.5);
      case "tetrahedron":
        return new TetrahedronGeometry(0.5);
      case "icosahedron":
        return new IcosahedronGeometry(0.5);
      case "dodecahedron":
        return new DodecahedronGeometry(0.5);
      case "plane":
        return new PlaneGeometry(1, 1);
      case "circle":
        return new CircleGeometry(0.5, 32);
      case "ring":
        return new RingGeometry(0.3, 0.5, 32);
      default:
        return new BoxGeometry(1, 1, 1);
    }
  };

  // 创建材质
  const createMaterial = () => {
    const materialProps = {
      color: new Color(materialColor),
      wireframe,
    };

    switch (selectedMaterial) {
      case "standard":
        return new MeshStandardMaterial({
          ...materialProps,
          metalness,
          roughness,
          transparent,
          opacity,
        });
      case "basic":
        return new MeshBasicMaterial({
          ...materialProps,
          transparent,
          opacity,
        });
      case "phong":
        return new MeshPhongMaterial({
          ...materialProps,
          shininess: 30,
          transparent,
          opacity,
        });
      case "physical":
        return new MeshPhysicalMaterial({
          ...materialProps,
          metalness,
          roughness,
          clearcoat: 0.2,
          clearcoatRoughness: 0.3,
          transparent,
          opacity,
        });
      case "normal":
        return new MeshNormalMaterial({
          wireframe,
        });
      case "lambert":
        return new MeshLambertMaterial({
          ...materialProps,
          transparent,
          opacity,
        });
      case "toon":
        return new MeshToonMaterial({
          ...materialProps,
          transparent,
          opacity,
        });
      default:
        return new MeshStandardMaterial(materialProps);
    }
  };

  // 添加对象到场景
  const handleAddObject = () => {
    const geometry = createGeometry();
    const material = createMaterial();
    const mesh = new Mesh(geometry, material);

    // 设置对象名称
    mesh.name = `${
      geometryOptions.find((opt) => opt.value === selectedGeometry)?.name ||
      "模型"
    }_${Date.now().toString().slice(-4)}`;

    onAddObject(mesh);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
          添加高级几何体
        </h2>

        {/* 几何体选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">几何体类型</label>
          <div className="grid grid-cols-3 gap-2">
            {geometryOptions.map((option) => (
              <button
                key={option.value}
                className={`px-2 py-1 rounded text-xs ${
                  selectedGeometry === option.value
                    ? "bg-blue-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => setSelectedGeometry(option.value)}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        {/* 材质选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">材质类型</label>
          <div className="grid grid-cols-2 gap-2">
            {materialOptions.map((option) => (
              <button
                key={option.value}
                className={`px-2 py-1 rounded text-xs ${
                  selectedMaterial === option.value
                    ? "bg-blue-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => setSelectedMaterial(option.value)}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        {/* 材质属性 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">材质属性</label>

          <div className="space-y-3">
            {/* 颜色选择器 */}
            <div>
              <label className="text-xs block mb-1">颜色</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={materialColor}
                  onChange={(e) => setMaterialColor(e.target.value)}
                  className="w-8 h-8 rounded overflow-hidden bg-gray-700"
                />
                <input
                  type="text"
                  value={materialColor}
                  onChange={(e) => setMaterialColor(e.target.value)}
                  className="flex-1 bg-gray-700 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* 线框模式 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="wireframe"
                checked={wireframe}
                onChange={(e) => setWireframe(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="wireframe" className="text-xs">
                线框模式
              </label>
            </div>

            {/* 金属度和粗糙度 (仅限标准/物理材质) */}
            {(selectedMaterial === "standard" ||
              selectedMaterial === "physical") && (
              <>
                <div>
                  <label className="text-xs block mb-1">
                    金属度: {metalness.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={metalness}
                    onChange={(e) => setMetalness(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs block mb-1">
                    粗糙度: {roughness.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={roughness}
                    onChange={(e) => setRoughness(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </>
            )}

            {/* 透明度选项 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="transparent"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="transparent" className="text-xs">
                透明
              </label>
            </div>

            {/* 不透明度滑块 */}
            {transparent && (
              <div>
                <label className="text-xs block mb-1">
                  不透明度: {opacity.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="flex justify-end space-x-2 border-t border-gray-700 pt-4">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
            onClick={handleAddObject}
          >
            添加
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedGeometries;
