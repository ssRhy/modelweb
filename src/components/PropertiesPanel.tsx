// src/components/PropertiesPanel.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Object3D,
  Material,
  Color,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  Euler,
} from "three";
import {
  CommandHistory,
  MoveCommand,
  RotateCommand,
  ScaleCommand,
  SetMaterialValueCommand,
  SetVisibilityCommand,
} from "../lib/CommandHistory";

interface PropertiesPanelProps {
  selectedObject: Object3D | null;
  commandHistory?: CommandHistory;
}

// Vector3 输入组件，用于编辑位置、旋转和缩放
const Vector3Input: React.FC<{
  label: string;
  value: { x: number; y: number; z: number };
  onChange: (axis: "x" | "y" | "z", value: number) => void;
  onComplete?: (newValue: Vector3 | Euler) => void;
  step?: number;
  convertToDegrees?: boolean;
}> = ({
  label,
  value,
  onChange,
  onComplete,
  step = 0.1,
  convertToDegrees = false,
}) => {
  // 保存初始值，用于onComplete回调
  const initialValueRef = useRef<Vector3 | Euler | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化初始值
  useEffect(() => {
    initialValueRef.current = null;
  }, [value]);

  const getValue = (axis: "x" | "y" | "z") => {
    return convertToDegrees ? (value[axis] * 180) / Math.PI : value[axis];
  };

  // 处理输入变化，添加防抖
  const handleInputChange = (axis: "x" | "y" | "z", newValue: number) => {
    // 保存第一次变化前的初始值
    if (!initialValueRef.current) {
      initialValueRef.current = convertToDegrees
        ? new Euler(value.x, value.y, value.z)
        : new Vector3(value.x, value.y, value.z);
    }

    // 更新值
    onChange(axis, newValue);

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置新的定时器，在用户停止输入后触发onComplete
    timeoutRef.current = setTimeout(() => {
      if (onComplete && initialValueRef.current) {
        // 传递当前的新值
        const newVector = convertToDegrees
          ? new Euler(value.x, value.y, value.z)
          : new Vector3(value.x, value.y, value.z);
        onComplete(newVector);
        // 重置初始值
        initialValueRef.current = null;
      }
    }, 500); // 500ms防抖
  };

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
              onChange={(e) =>
                handleInputChange("x", parseFloat(e.target.value) || 0)
              }
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
              onChange={(e) =>
                handleInputChange("y", parseFloat(e.target.value) || 0)
              }
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
              onChange={(e) =>
                handleInputChange("z", parseFloat(e.target.value) || 0)
              }
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
  onComplete?: (property: string, value: any) => void;
}> = ({ material, onChange, onComplete }) => {
  // 保存初始值，用于onComplete回调
  const initialValuesRef = useRef<Map<string, any>>(new Map());
  const timeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 获取材质当前的颜色值作为十六进制
  const getColorHex = (color: Color) => {
    return `#${color.getHexString()}`;
  };

  // 处理属性变化，添加防抖
  const handlePropertyChange = (property: string, value: any) => {
    // 保存第一次变化前的初始值
    if (!initialValuesRef.current.has(property)) {
      if (property === "color") {
        initialValuesRef.current.set(property, material.color.clone());
      } else {
        initialValuesRef.current.set(property, (material as any)[property]);
      }
    }

    // 更新属性值
    onChange(property, value);

    // 清除之前的定时器
    if (timeoutRef.current.has(property)) {
      clearTimeout(timeoutRef.current.get(property)!);
    }

    // 设置新的定时器，在用户停止输入后触发onComplete
    const timeout = setTimeout(() => {
      if (onComplete && initialValuesRef.current.has(property)) {
        onComplete(property, value);
        // 重置初始值
        initialValuesRef.current.delete(property);
      }
    }, 500); // 500ms防抖

    timeoutRef.current.set(property, timeout);
  };

  // 组件卸载时清除所有定时器
  useEffect(() => {
    return () => {
      timeoutRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

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
            onChange={(e) => handlePropertyChange("color", e.target.value)}
            className="bg-gray-700 rounded w-8 h-8 overflow-hidden"
          />
          <input
            type="text"
            value={getColorHex(material.color)}
            onChange={(e) => handlePropertyChange("color", e.target.value)}
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
          onChange={(e) =>
            handlePropertyChange("roughness", parseFloat(e.target.value))
          }
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
          onChange={(e) =>
            handlePropertyChange("metalness", parseFloat(e.target.value))
          }
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 flex items-center space-x-2">
          <input
            type="checkbox"
            checked={!material.transparent}
            onChange={(e) =>
              handlePropertyChange("transparent", !e.target.checked)
            }
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
            onChange={(e) =>
              handlePropertyChange("opacity", parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>
      )}

      <div>
        <label className="text-xs text-gray-400 flex items-center space-x-2">
          <input
            type="checkbox"
            checked={material.wireframe}
            onChange={(e) =>
              handlePropertyChange("wireframe", e.target.checked)
            }
          />
          <span>Wireframe</span>
        </label>
      </div>
    </div>
  );
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  commandHistory,
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
        <div className="text-gray-400 text-center p-4">未选择任何对象</div>
      </div>
    );
  }

  // 处理变换属性的变化 - 实时更新
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

  // 处理变换完成时的命令记录
  const handleTransformComplete = (
    type: "position" | "rotation" | "scale",
    newValue: Vector3 | Euler
  ) => {
    if (selectedObject && commandHistory) {
      let command;

      switch (type) {
        case "position":
          command = new MoveCommand(selectedObject, newValue as Vector3);
          break;
        case "rotation":
          command = new RotateCommand(selectedObject, newValue as Euler);
          break;
        case "scale":
          command = new ScaleCommand(selectedObject, newValue as Vector3);
          break;
      }

      if (command) {
        commandHistory.execute(command);
      }
    }
  };

  // 处理材质属性的变化 - 实时更新
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

  // 处理材质属性变化完成时的命令记录
  const handleMaterialChangeComplete = (property: string, value: any) => {
    const mesh = selectedObject as Mesh;
    if (mesh.isMesh && mesh.material && commandHistory) {
      const material = Array.isArray(mesh.material)
        ? mesh.material[0]
        : mesh.material;

      if (material instanceof MeshStandardMaterial) {
        const command = new SetMaterialValueCommand(material, property, value);
        commandHistory.execute(command);
      }
    }
  };

  // 处理可见性变化
  const handleVisibilityChange = (visible: boolean) => {
    if (selectedObject) {
      selectedObject.visible = visible;
      setUpdateTrigger((prev) => prev + 1);

      // 记录命令
      if (commandHistory) {
        const command = new SetVisibilityCommand(selectedObject, visible);
        commandHistory.execute(command);
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
          <h3 className="text-sm font-medium mb-2 text-blue-400">变换</h3>

          {/* 位置编辑器 */}
          <Vector3Input
            label="位置"
            value={selectedObject.position}
            onChange={handlePositionChange}
            onComplete={(newValue) =>
              handleTransformComplete("position", newValue)
            }
          />

          {/* 旋转编辑器 */}
          <Vector3Input
            label="旋转"
            value={selectedObject.rotation}
            onChange={handleRotationChange}
            onComplete={(newValue) =>
              handleTransformComplete("rotation", newValue)
            }
            convertToDegrees={true}
          />

          {/* 缩放编辑器 */}
          <Vector3Input
            label="缩放"
            value={selectedObject.scale}
            onChange={handleScaleChange}
            onComplete={(newValue) =>
              handleTransformComplete("scale", newValue)
            }
          />
        </div>

        {/* 如果是网格且有可编辑的材质，显示材质编辑器 */}
        {editableMaterial && (
          <div>
            <h3 className="text-sm font-medium mb-2 text-blue-400">材质</h3>
            <MaterialEditor
              material={editableMaterial}
              onChange={handleMaterialChange}
              onComplete={handleMaterialChangeComplete}
            />
          </div>
        )}

        {/* 可见性控制 */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-blue-400">可见性</h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedObject.visible}
              onChange={(e) => handleVisibilityChange(e.target.checked)}
              className="form-checkbox"
            />
            <span className="text-xs">可见</span>
          </label>
        </div>

        {/* 对象信息 */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-blue-400">信息</h3>
          <div className="text-xs text-gray-400">
            <div>UUID: {selectedObject.uuid.substring(0, 8)}...</div>
            <div>类型: {selectedObject.type}</div>
            {isMesh && (
              <div>
                顶点数:{" "}
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
