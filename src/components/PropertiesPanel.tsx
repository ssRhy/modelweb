// src/components/PropertiesPanel.tsx
import React, { useRef, useEffect, useState } from "react";
import { Object3D, Material, Color, Mesh, MeshStandardMaterial } from "three";

interface PropertiesPanelProps {
  selectedObject: Object3D | null;
}

// Vector3 输入组件，用于编辑位置、旋转和缩放
const Vector3Input: React.FC<{
  label: string;
  value: { x: number; y: number; z: number };
  onChange: (axis: "x" | "y" | "z", value: number) => void;
  step?: number;
  convertToDegrees?: boolean;
}> = ({ label, value, onChange, step = 0.1, convertToDegrees = false }) => {
  const getValue = (axis: "x" | "y" | "z") => {
    return convertToDegrees ? (value[axis] * 180) / Math.PI : value[axis];
  };

  return (
    <div className="mb-3">
      <label className="text-xs text-gray-400 block mb-1">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="flex items-center">
            <span className="text-xs mr-2 text-gray-500">X</span>
            <input
              type="number"
              value={getValue("x")}
              onChange={(e) => onChange("x", parseFloat(e.target.value) || 0)}
              step={step}
              className="bg-gray-700 px-2 py-1 rounded w-full text-sm"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <span className="text-xs mr-2 text-gray-500">Y</span>
            <input
              type="number"
              value={getValue("y")}
              onChange={(e) => onChange("y", parseFloat(e.target.value) || 0)}
              step={step}
              className="bg-gray-700 px-2 py-1 rounded w-full text-sm"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <span className="text-xs mr-2 text-gray-500">Z</span>
            <input
              type="number"
              value={getValue("z")}
              onChange={(e) => onChange("z", parseFloat(e.target.value) || 0)}
              step={step}
              className="bg-gray-700 px-2 py-1 rounded w-full text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 材质编辑组件
const MaterialEditor: React.FC<{
  material: MeshStandardMaterial;
  onChange: (property: string, value: any) => void;
}> = ({ material, onChange }) => {
  // 获取材质当前的颜色值作为十六进制
  const getColorHex = (color: Color) => {
    return `#${color.getHexString()}`;
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-400 block mb-1">Type</label>
        <div className="bg-gray-700 px-2 py-1 rounded text-sm">
          {material.type}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">Color</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={getColorHex(material.color)}
            onChange={(e) => onChange("color", e.target.value)}
            className="bg-gray-700 rounded w-8 h-8 overflow-hidden"
          />
          <input
            type="text"
            value={getColorHex(material.color)}
            onChange={(e) => onChange("color", e.target.value)}
            className="bg-gray-700 px-2 py-1 rounded flex-1 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Roughness: {material.roughness.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={material.roughness}
          onChange={(e) => onChange("roughness", parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Metalness: {material.metalness.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={material.metalness}
          onChange={(e) => onChange("metalness", parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 flex items-center space-x-2">
          <input
            type="checkbox"
            checked={!material.transparent}
            onChange={(e) => onChange("transparent", !e.target.checked)}
          />
          <span>Opaque</span>
        </label>
      </div>

      {material.transparent && (
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Opacity: {material.opacity.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={material.opacity}
            onChange={(e) => onChange("opacity", parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      <div>
        <label className="text-xs text-gray-400 flex items-center space-x-2">
          <input
            type="checkbox"
            checked={material.wireframe}
            onChange={(e) => onChange("wireframe", e.target.checked)}
          />
          <span>Wireframe</span>
        </label>
      </div>
    </div>
  );
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
}) => {
  // 用于强制组件重新渲染的状态
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // 保持对选中对象的引用
  const objectRef = useRef<Object3D | null>(null);

  // 设置选中对象的引用
  useEffect(() => {
    objectRef.current = selectedObject;
  }, [selectedObject]);

  // 如果没有选中的对象，显示空面板
  if (!selectedObject) {
    return (
      <div className="bg-gray-800 text-white p-4 h-full overflow-auto">
        <div className="text-gray-400 text-center p-4">No object selected</div>
      </div>
    );
  }

  // 处理变换属性的变化
  const handlePositionChange = (axis: "x" | "y" | "z", value: number) => {
    if (selectedObject) {
      selectedObject.position[axis] = value;
      // 触发界面更新
      setUpdateTrigger((prev) => prev + 1);
    }
  };

  const handleRotationChange = (axis: "x" | "y" | "z", value: number) => {
    if (selectedObject) {
      // 将角度转换为弧度
      selectedObject.rotation[axis] = (value * Math.PI) / 180;
      setUpdateTrigger((prev) => prev + 1);
    }
  };

  const handleScaleChange = (axis: "x" | "y" | "z", value: number) => {
    if (selectedObject) {
      selectedObject.scale[axis] = value;
      setUpdateTrigger((prev) => prev + 1);
    }
  };

  // 处理材质属性的变化
  const handleMaterialChange = (property: string, value: any) => {
    const mesh = selectedObject as Mesh;
    if (mesh.isMesh && mesh.material) {
      // 确保我们处理的是单个材质，而不是材质数组
      const material = Array.isArray(mesh.material)
        ? mesh.material[0]
        : mesh.material;

      if (material instanceof MeshStandardMaterial) {
        // 根据属性类型设置值
        if (property === "color") {
          material.color.set(value);
        } else {
          // @ts-ignore - 动态属性赋值
          material[property] = value;
        }

        // 标记材质需要更新
        material.needsUpdate = true;
        setUpdateTrigger((prev) => prev + 1);
      }
    }
  };

  // 检查对象是否是网格
  const isMesh = selectedObject.type === "Mesh";

  // 获取可编辑的材质（确保是MeshStandardMaterial）
  const getMaterial = (): MeshStandardMaterial | null => {
    if (isMesh && (selectedObject as Mesh).material) {
      const material = (selectedObject as Mesh).material;
      if (Array.isArray(material)) {
        return material[0] instanceof MeshStandardMaterial ? material[0] : null;
      } else {
        return material instanceof MeshStandardMaterial ? material : null;
      }
    }
    return null;
  };

  const editableMaterial = getMaterial();

  return (
    <div className="bg-gray-800 text-white p-4 h-full overflow-auto">
      <h2 className="text-lg font-medium mb-4 border-b border-gray-700 pb-2">
        {selectedObject.name || selectedObject.type}
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2 text-blue-400">Transform</h3>

          {/* 位置编辑器 */}
          <Vector3Input
            label="Position"
            value={selectedObject.position}
            onChange={handlePositionChange}
          />

          {/* 旋转编辑器 */}
          <Vector3Input
            label="Rotation"
            value={selectedObject.rotation}
            onChange={handleRotationChange}
            convertToDegrees={true}
          />

          {/* 缩放编辑器 */}
          <Vector3Input
            label="Scale"
            value={selectedObject.scale}
            onChange={handleScaleChange}
          />
        </div>

        {/* 如果是网格且有可编辑的材质，显示材质编辑器 */}
        {editableMaterial && (
          <div>
            <h3 className="text-sm font-medium mb-2 text-blue-400">Material</h3>
            <MaterialEditor
              material={editableMaterial}
              onChange={handleMaterialChange}
            />
          </div>
        )}

        {/* 可见性控制 */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-blue-400">Visibility</h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedObject.visible}
              onChange={(e) => {
                selectedObject.visible = e.target.checked;
                setUpdateTrigger((prev) => prev + 1);
              }}
              className="form-checkbox"
            />
            <span className="text-xs">Visible</span>
          </label>
        </div>

        {/* 对象信息 */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-blue-400">Info</h3>
          <div className="text-xs text-gray-400">
            <div>UUID: {selectedObject.uuid.substring(0, 8)}...</div>
            <div>Type: {selectedObject.type}</div>
            {isMesh && (
              <div>
                Vertices:{" "}
                {(selectedObject as Mesh).geometry.attributes.position?.count ||
                  0}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
