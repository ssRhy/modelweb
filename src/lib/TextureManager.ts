import {
  Texture,
  TextureLoader,
  RepeatWrapping,
  MirroredRepeatWrapping,
  ClampToEdgeWrapping,
  NearestFilter,
  LinearFilter,
  MeshStandardMaterial,
  Wrapping,
  MinificationTextureFilter,
  MagnificationTextureFilter,
} from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";

// 纹理类型枚举
export enum TextureType {
  MAP = "map",
  NORMAL_MAP = "normalMap",
  ROUGHNESS_MAP = "roughnessMap",
  METALNESS_MAP = "metalnessMap",
  AO_MAP = "aoMap",
  EMISSIVE_MAP = "emissiveMap",
  ALPHA_MAP = "alphaMap",
  ENV_MAP = "envMap",
  LIGHT_MAP = "lightMap",
  DISPLACEMENT_MAP = "displacementMap",
}

// 纹理包装模式
export enum WrapMode {
  REPEAT = "repeat",
  CLAMP = "clamp",
  MIRROR = "mirror",
}

// 纹理过滤模式
export enum FilterMode {
  NEAREST = "nearest",
  LINEAR = "linear",
}

// 纹理信息接口
export interface TextureInfo {
  url: string;
  type: TextureType;
  name?: string;
  texture?: Texture;
  uuid?: string;
}

// 纹理设置接口
export interface TextureSettings {
  repeat?: [number, number];
  offset?: [number, number];
  rotation?: number;
  wrapS?: WrapMode;
  wrapT?: WrapMode;
  minFilter?: FilterMode;
  magFilter?: FilterMode;
}

export class TextureManager {
  private textureLoader: TextureLoader;
  private rgbeLoader: RGBELoader;
  private ddsLoader: DDSLoader;
  private ktx2Loader: KTX2Loader;

  // 缓存已加载的纹理，避免重复加载
  private textureCache: Map<string, Texture> = new Map();

  constructor() {
    this.textureLoader = new TextureLoader();
    this.rgbeLoader = new RGBELoader();
    this.ddsLoader = new DDSLoader();
    this.ktx2Loader = new KTX2Loader();
  }

  // 加载纹理
  loadTexture(
    url: string,
    onLoad?: (texture: Texture) => void,
    onError?: (error: unknown) => void
  ): Texture | null {
    // 检查缓存
    if (this.textureCache.has(url)) {
      const cachedTexture = this.textureCache.get(url)!;
      if (onLoad) onLoad(cachedTexture);
      return cachedTexture;
    }

    let texture: Texture | null = null;
    const extension = url.split(".").pop()?.toLowerCase();

    try {
      switch (extension) {
        case "hdr":
          this.rgbeLoader.load(
            url,
            (dataTexture) => {
              this.textureCache.set(url, dataTexture);
              if (onLoad) onLoad(dataTexture);
            },
            undefined,
            onError
          );
          break;

        case "dds":
          texture = this.ddsLoader.load(
            url,
            (dataTexture) => {
              this.textureCache.set(url, dataTexture);
              if (onLoad) onLoad(dataTexture);
            },
            undefined,
            onError
          );
          break;

        case "ktx2":
          texture = this.ktx2Loader.load(
            url,
            (dataTexture) => {
              this.textureCache.set(url, dataTexture);
              if (onLoad) onLoad(dataTexture);
            },
            undefined,
            onError
          );
          break;

        default:
          // 标准图像格式 (jpg, png, etc.)
          texture = this.textureLoader.load(
            url,
            (loadedTexture) => {
              this.textureCache.set(url, loadedTexture);
              if (onLoad) onLoad(loadedTexture);
            },
            undefined,
            onError
          );
          break;
      }

      return texture;
    } catch (error) {
      if (onError) onError(error);
      return null;
    }
  }

  // 应用纹理设置
  applyTextureSettings(texture: Texture, settings: TextureSettings): Texture {
    if (!texture) return texture;

    if (settings.repeat) {
      texture.repeat.set(settings.repeat[0], settings.repeat[1]);
    }

    if (settings.offset) {
      texture.offset.set(settings.offset[0], settings.offset[1]);
    }

    if (settings.rotation !== undefined) {
      texture.rotation = settings.rotation;
    }

    if (settings.wrapS) {
      texture.wrapS = this.getWrapMode(settings.wrapS);
    }

    if (settings.wrapT) {
      texture.wrapT = this.getWrapMode(settings.wrapT);
    }

    if (settings.minFilter) {
      texture.minFilter = this.getFilterMode(settings.minFilter);
    }

    if (settings.magFilter) {
      texture.magFilter = this.getMagFilterMode(settings.magFilter);
    }

    texture.needsUpdate = true;
    return texture;
  }

  // 设置材质纹理
  setMaterialTexture(
    material: MeshStandardMaterial,
    textureInfo: TextureInfo,
    settings?: TextureSettings
  ): void {
    const texture = this.loadTexture(textureInfo.url, (loadedTexture) => {
      if (settings) {
        this.applyTextureSettings(loadedTexture, settings);
      }

      // 设置材质中的纹理
      (material as any)[textureInfo.type] = loadedTexture;
      material.needsUpdate = true;
    });

    if (texture && settings) {
      this.applyTextureSettings(texture, settings);
    }
  }

  // 移除材质纹理
  removeMaterialTexture(
    material: MeshStandardMaterial,
    type: TextureType
  ): void {
    const texture = (material as any)[type] as Texture;

    if (texture) {
      texture.dispose();
      (material as any)[type] = null;
      material.needsUpdate = true;
    }
  }

  // 清除纹理缓存
  clearCache(): void {
    this.textureCache.forEach((texture) => {
      texture.dispose();
    });

    this.textureCache.clear();
  }

  // 获取Wrap模式枚举值
  private getWrapMode(mode: WrapMode): Wrapping {
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

  // 获取Filter模式枚举值 (最小化过滤)
  private getFilterMode(mode: FilterMode): MinificationTextureFilter {
    switch (mode) {
      case FilterMode.NEAREST:
        return NearestFilter;
      case FilterMode.LINEAR:
        return LinearFilter;
      default:
        return LinearFilter;
    }
  }

  // 获取Filter模式枚举值 (放大过滤)
  private getMagFilterMode(mode: FilterMode): MagnificationTextureFilter {
    switch (mode) {
      case FilterMode.NEAREST:
        return NearestFilter;
      case FilterMode.LINEAR:
        return LinearFilter;
      default:
        return LinearFilter;
    }
  }

  // 从URL创建纹理信息
  static createTextureInfo(
    url: string,
    type: TextureType,
    name?: string
  ): TextureInfo {
    return {
      url,
      type,
      name: name || url.split("/").pop() || "texture",
    };
  }
}
