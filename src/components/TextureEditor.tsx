import React, { useState, useEffect, ChangeEvent } from "react";
import {
  MeshStandardMaterial,
  Texture,
  RepeatWrapping,
  MirroredRepeatWrapping,
  ClampToEdgeWrapping,
  NearestFilter,
  LinearFilter,
  Wrapping,
  TextureFilter,
  MinificationTextureFilter,
  MagnificationTextureFilter,
} from "three";
import {
  TextureManager,
  TextureType,
  WrapMode,
  FilterMode,
  TextureSettings,
} from "../lib/TextureManager";

interface TextureEditorProps {
  material: MeshStandardMaterial;
  onClose: () => void;
}

// 纹理类型显示名称
const textureTypeLabels: Record<TextureType, string> = {
  [TextureType.MAP]: "颜色贴图",
  [TextureType.NORMAL_MAP]: "法线贴图",
  [TextureType.ROUGHNESS_MAP]: "粗糙度贴图",
  [TextureType.METALNESS_MAP]: "金属度贴图",
  [TextureType.AO_MAP]: "环境光遮蔽贴图",
  [TextureType.EMISSIVE_MAP]: "发光贴图",
  [TextureType.ALPHA_MAP]: "透明度贴图",
  [TextureType.ENV_MAP]: "环境贴图",
  [TextureType.LIGHT_MAP]: "光照贴图",
  [TextureType.DISPLACEMENT_MAP]: "置换贴图",
};

// 包装模式选项
const wrapModeOptions = [
  { label: "重复", value: WrapMode.REPEAT },
  { label: "镜像重复", value: WrapMode.MIRROR },
  { label: "边缘箝制", value: WrapMode.CLAMP },
];

// 过滤模式选项
const filterModeOptions = [
  { label: "线性", value: FilterMode.LINEAR },
  { label: "最近点", value: FilterMode.NEAREST },
];

// 从WrapMode枚举获取对应的Three.js值
function getWrapModeValue(mode: WrapMode): Wrapping {
  switch (mode) {
    case WrapMode.REPEAT:
      return RepeatWrapping;
    case WrapMode.MIRROR:
      return MirroredRepeatWrapping;
    case WrapMode.CLAMP:
      return ClampToEdgeWrapping;
    default:
      return RepeatWrapping;
  }
}

// 从FilterMode枚举获取对应的Three.js值(最小过滤模式)
function getMinFilterModeValue(mode: FilterMode): MinificationTextureFilter {
  switch (mode) {
    case FilterMode.NEAREST:
      return NearestFilter;
    case FilterMode.LINEAR:
      return LinearFilter;
    default:
      return LinearFilter;
  }
}

// 从FilterMode枚举获取对应的Three.js值(最大过滤模式)
function getMagFilterModeValue(mode: FilterMode): MagnificationTextureFilter {
  switch (mode) {
    case FilterMode.NEAREST:
      return NearestFilter;
    case FilterMode.LINEAR:
      return LinearFilter;
    default:
      return LinearFilter;
  }
}

const TextureEditor: React.FC<TextureEditorProps> = ({ material, onClose }) => {
  const [textureManager] = useState(() => new TextureManager());
  const [selectedTextureType, setSelectedTextureType] = useState<TextureType>(
    TextureType.MAP
  );
  const [textureSettings, setTextureSettings] = useState<TextureSettings>({
    repeat: [1, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: WrapMode.REPEAT,
    wrapT: WrapMode.REPEAT,
    minFilter: FilterMode.LINEAR,
    magFilter: FilterMode.LINEAR,
  });

  // 获取当前选中的纹理
  const getCurrentTexture = (): Texture | null => {
    return (material as any)[selectedTextureType] as Texture | null;
  };

  // 从当前纹理初始化设置
  useEffect(() => {
    const texture = getCurrentTexture();
    if (texture) {
      setTextureSettings({
        repeat: [texture.repeat.x, texture.repeat.y],
        offset: [texture.offset.x, texture.offset.y],
        rotation: texture.rotation,
        wrapS: getWrapModeFromValue(texture.wrapS),
        wrapT: getWrapModeFromValue(texture.wrapT),
        minFilter: getFilterModeFromValue(texture.minFilter),
        magFilter: getFilterModeFromValue(texture.magFilter),
      });
    } else {
      // 重置为默认设置
      setTextureSettings({
        repeat: [1, 1],
        offset: [0, 0],
        rotation: 0,
        wrapS: WrapMode.REPEAT,
        wrapT: WrapMode.REPEAT,
        minFilter: FilterMode.LINEAR,
        magFilter: FilterMode.LINEAR,
      });
    }
  }, [selectedTextureType, material]);

  // 从纹理的枚举值获取包装模式
  const getWrapModeFromValue = (value: Wrapping): WrapMode => {
    if (value === RepeatWrapping) return WrapMode.REPEAT;
    if (value === MirroredRepeatWrapping) return WrapMode.MIRROR;
    if (value === ClampToEdgeWrapping) return WrapMode.CLAMP;
    return WrapMode.REPEAT;
  };

  // 从纹理的枚举值获取过滤模式
  const getFilterModeFromValue = (value: TextureFilter): FilterMode => {
    if (value === NearestFilter) return FilterMode.NEAREST;
    if (value === LinearFilter) return FilterMode.LINEAR;
    return FilterMode.LINEAR;
  };

  // 处理纹理上传
  const handleTextureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const imageUrl = URL.createObjectURL(file);

    textureManager.loadTexture(imageUrl, (texture) => {
      // 应用当前设置
      applySettingsToTexture(texture);

      // 设置到材质
      (material as any)[selectedTextureType] = texture;
      material.needsUpdate = true;

      // 释放URL
      URL.revokeObjectURL(imageUrl);
    });
  };

  // 应用设置到纹理
  const applySettingsToTexture = (texture: Texture) => {
    if (!texture) return;

    if (textureSettings.repeat) {
      texture.repeat.set(textureSettings.repeat[0], textureSettings.repeat[1]);
    }

    if (textureSettings.offset) {
      texture.offset.set(textureSettings.offset[0], textureSettings.offset[1]);
    }

    if (textureSettings.rotation !== undefined) {
      texture.rotation = textureSettings.rotation;
    }

    if (textureSettings.wrapS) {
      texture.wrapS = getWrapModeValue(textureSettings.wrapS);
    }

    if (textureSettings.wrapT) {
      texture.wrapT = getWrapModeValue(textureSettings.wrapT);
    }

    if (textureSettings.minFilter) {
      texture.minFilter = getMinFilterModeValue(textureSettings.minFilter);
    }

    if (textureSettings.magFilter) {
      texture.magFilter = getMagFilterModeValue(textureSettings.magFilter);
    }

    texture.needsUpdate = true;
  };

  // 更新纹理设置
  const updateTextureSettings = (key: keyof TextureSettings, value: any) => {
    setTextureSettings((prev) => {
      const newSettings = { ...prev, [key]: value };

      // 立即应用到当前纹理
      const texture = getCurrentTexture();
      if (texture) {
        if (key === "wrapS") {
          texture.wrapS = getWrapModeValue(value as WrapMode);
        } else if (key === "wrapT") {
          texture.wrapT = getWrapModeValue(value as WrapMode);
        } else if (key === "minFilter") {
          texture.minFilter = getMinFilterModeValue(value as FilterMode);
        } else if (key === "magFilter") {
          texture.magFilter = getMagFilterModeValue(value as FilterMode);
        } else if (key === "rotation") {
          texture.rotation = value;
        }
        texture.needsUpdate = true;
        material.needsUpdate = true;
      }

      return newSettings;
    });
  };

  // 更新矢量设置 (repeat, offset)
  const updateVectorSetting = (
    key: "repeat" | "offset",
    index: 0 | 1,
    value: number
  ) => {
    setTextureSettings((prev) => {
      const vector = [...(prev[key] || [1, 1])];
      vector[index] = value;

      const newSettings = { ...prev, [key]: vector };

      // 立即应用到当前纹理
      const texture = getCurrentTexture();
      if (texture) {
        if (key === "repeat") {
          texture.repeat.set(vector[0], vector[1]);
        } else if (key === "offset") {
          texture.offset.set(vector[0], vector[1]);
        }
        texture.needsUpdate = true;
        material.needsUpdate = true;
      }

      return newSettings;
    });
  };

  // 移除当前纹理
  const removeCurrentTexture = () => {
    const texture = getCurrentTexture();
    if (texture) {
      texture.dispose();
      (material as any)[selectedTextureType] = null;
      material.needsUpdate = true;
    }
  };

  // 渲染纹理类型选择器
  const renderTextureTypeSelector = () => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">纹理类型</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(TextureType).map((type) => (
            <button
              key={type}
              className={`px-2 py-1 rounded text-xs ${
                selectedTextureType === type
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => setSelectedTextureType(type)}
            >
              {textureTypeLabels[type]}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 渲染纹理预览和上传
  const renderTexturePreviewAndUpload = () => {
    const texture = getCurrentTexture();

    return (
      <div className="mb-4 border border-gray-700 rounded p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">
            {textureTypeLabels[selectedTextureType]}
          </h3>
          {texture && (
            <button
              className="text-xs text-red-400 hover:text-red-300"
              onClick={removeCurrentTexture}
            >
              移除
            </button>
          )}
        </div>

        {texture ? (
          <div className="relative h-32 bg-gray-900 rounded overflow-hidden mb-2 flex items-center justify-center">
            <img
              src={texture.image?.src || ""}
              alt="Texture preview"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="h-32 bg-gray-900 rounded flex items-center justify-center mb-2">
            <span className="text-gray-500 text-sm">无纹理</span>
          </div>
        )}

        <label className="block w-full">
          <span className="sr-only">选择纹理文件</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleTextureUpload}
            className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white hover:file:bg-gray-600"
          />
        </label>
      </div>
    );
  };

  // 渲染纹理设置
  const renderTextureSettings = () => {
    const texture = getCurrentTexture();
    if (!texture) return null;

    return (
      <div className="mb-4 border border-gray-700 rounded p-3">
        <h3 className="text-sm font-medium mb-2">纹理设置</h3>

        <div className="space-y-3">
          {/* 重复设置 */}
          <div>
            <label className="text-xs block mb-1">重复 (X, Y)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={textureSettings.repeat?.[0] || 1}
                onChange={(e) =>
                  updateVectorSetting(
                    "repeat",
                    0,
                    parseFloat(e.target.value) || 1
                  )
                }
                step="0.1"
                min="0.1"
                className="bg-gray-700 px-2 py-1 rounded w-full text-sm"
              />
              <input
                type="number"
                value={textureSettings.repeat?.[1] || 1}
                onChange={(e) =>
                  updateVectorSetting(
                    "repeat",
                    1,
                    parseFloat(e.target.value) || 1
                  )
                }
                step="0.1"
                min="0.1"
                className="bg-gray-700 px-2 py-1 rounded w-full text-sm"
              />
            </div>
          </div>

          {/* 偏移设置 */}
          <div>
            <label className="text-xs block mb-1">偏移 (X, Y)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={textureSettings.offset?.[0] || 0}
                onChange={(e) =>
                  updateVectorSetting(
                    "offset",
                    0,
                    parseFloat(e.target.value) || 0
                  )
                }
                step="0.1"
                className="bg-gray-700 px-2 py-1 rounded w-full text-sm"
              />
              <input
                type="number"
                value={textureSettings.offset?.[1] || 0}
                onChange={(e) =>
                  updateVectorSetting(
                    "offset",
                    1,
                    parseFloat(e.target.value) || 0
                  )
                }
                step="0.1"
                className="bg-gray-700 px-2 py-1 rounded w-full text-sm"
              />
            </div>
          </div>

          {/* 旋转设置 */}
          <div>
            <label className="text-xs block mb-1">
              旋转:{" "}
              {(
                Number(textureSettings.rotation || 0) *
                (180 / Math.PI)
              ).toFixed(1)}
              °
            </label>
            <input
              type="range"
              min="0"
              max={Math.PI * 2}
              step="0.01"
              value={textureSettings.rotation || 0}
              onChange={(e) =>
                updateTextureSettings("rotation", parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>

          {/* 包装模式设置 */}
          <div>
            <label className="text-xs block mb-1">水平包装模式</label>
            <select
              value={textureSettings.wrapS}
              onChange={(e) => {
                const numValue = Number(e.target.value);
                // 安全地将数字转换为枚举
                if (
                  numValue === WrapMode.REPEAT ||
                  numValue === WrapMode.MIRROR ||
                  numValue === WrapMode.CLAMP
                ) {
                  updateTextureSettings("wrapS", numValue);
                }
              }}
              className="bg-gray-700 px-2 py-1 rounded w-full text-sm"
            >
              {wrapModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs block mb-1">垂直包装模式</label>
            <select
              value={textureSettings.wrapT}
              onChange={(e) => {
                const numValue = Number(e.target.value);
                // 安全地将数字转换为枚举
                if (
                  numValue === WrapMode.REPEAT ||
                  numValue === WrapMode.MIRROR ||
                  numValue === WrapMode.CLAMP
                ) {
                  updateTextureSettings("wrapT", numValue);
                }
              }}
              className="bg-gray-700 px-2 py-1 rounded w-full text-sm"
            >
              {wrapModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 过滤模式设置 */}
          <div>
            <label className="text-xs block mb-1">缩小过滤</label>
            <select
              value={textureSettings.minFilter}
              onChange={(e) => {
                const numValue = Number(e.target.value);
                // 安全地将数字转换为枚举
                if (
                  numValue === FilterMode.LINEAR ||
                  numValue === FilterMode.NEAREST
                ) {
                  updateTextureSettings("minFilter", numValue);
                }
              }}
              className="bg-gray-700 px-2 py-1 rounded w-full text-sm"
            >
              {filterModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs block mb-1">放大过滤</label>
            <select
              value={textureSettings.magFilter}
              onChange={(e) => {
                const numValue = Number(e.target.value);
                // 安全地将数字转换为枚举
                if (
                  numValue === FilterMode.LINEAR ||
                  numValue === FilterMode.NEAREST
                ) {
                  updateTextureSettings("magFilter", numValue);
                }
              }}
              className="bg-gray-700 px-2 py-1 rounded w-full text-sm"
            >
              {filterModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
          纹理编辑器
        </h2>

        {renderTextureTypeSelector()}
        {renderTexturePreviewAndUpload()}
        {renderTextureSettings()}

        {/* 按钮区域 */}
        <div className="flex justify-end space-x-2 border-t border-gray-700 pt-4">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextureEditor;
