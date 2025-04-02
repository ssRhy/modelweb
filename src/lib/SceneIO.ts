import { Scene, Object3D, Mesh, Material, Texture } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

// 文件类型枚举
export enum FileType {
  GLB = "glb",
  GLTF = "gltf",
  OBJ = "obj",
  FBX = "fbx",
  STL = "stl",
  JSON = "json",
}

// 序列化场景数据的接口
interface SerializedScene {
  objects: SerializedObject[];
  version: string;
}

// 序列化对象数据的接口
interface SerializedObject {
  uuid: string;
  type: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
  userData: any;
  children: SerializedObject[];
  material?: any;
  geometry?: any;
}

export class SceneIO {
  // 导出模型
  static exportModel(
    scene: Scene,
    type: FileType = FileType.GLB
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      switch (type) {
        case FileType.GLB:
        case FileType.GLTF:
          const gltfExporter = new GLTFExporter();
          const options = { binary: type === FileType.GLB };

          gltfExporter.parse(
            scene,
            (result) => {
              if (result instanceof ArrayBuffer) {
                resolve(
                  new Blob([result], { type: "application/octet-stream" })
                );
              } else {
                const output = JSON.stringify(result, null, 2);
                resolve(new Blob([output], { type: "application/json" }));
              }
            },
            (error) => {
              reject(error);
            },
            options
          );
          break;

        case FileType.OBJ:
          const objExporter = new OBJExporter();
          const objResult = objExporter.parse(scene);
          resolve(new Blob([objResult], { type: "text/plain" }));
          break;

        default:
          reject(new Error(`Unsupported export format: ${type}`));
      }
    });
  }

  // 导入模型
  static importModel(file: File): Promise<Object3D> {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name
        .split(".")
        .pop()
        ?.toLowerCase() as FileType;
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result;
        if (!result) {
          reject(new Error("Failed to read file"));
          return;
        }

        try {
          switch (fileExtension) {
            case FileType.GLB:
            case FileType.GLTF:
              const gltfLoader = new GLTFLoader();
              gltfLoader.parse(
                result as ArrayBuffer,
                "",
                (gltf) => {
                  resolve(gltf.scene);
                },
                (error) => {
                  reject(error);
                }
              );
              break;

            case FileType.OBJ:
              const objLoader = new OBJLoader();
              const objModel = objLoader.parse(result as string);
              resolve(objModel);
              break;

            case FileType.FBX:
              const fbxLoader = new FBXLoader();
              const fbxModel = fbxLoader.parse(result as ArrayBuffer, "");
              resolve(fbxModel);
              break;

            case FileType.STL:
              const stlLoader = new STLLoader();
              const geometry = stlLoader.parse(result as ArrayBuffer);
              const mesh = new Mesh(geometry);
              mesh.name = file.name.replace(/\.[^/.]+$/, "");
              resolve(mesh);
              break;

            default:
              reject(new Error(`Unsupported file format: ${fileExtension}`));
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      if (fileExtension === FileType.OBJ) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  // 序列化场景为JSON
  static serializeScene(scene: Scene): string {
    const serialized: SerializedScene = {
      objects: [],
      version: "1.0",
    };

    scene.children.forEach((child) => {
      if (this.isSerializableObject(child)) {
        serialized.objects.push(this.serializeObject(child));
      }
    });

    return JSON.stringify(serialized, null, 2);
  }

  // 判断对象是否可序列化
  private static isSerializableObject(object: Object3D): boolean {
    return (
      object.type === "Mesh" ||
      object.type === "Group" ||
      object.type === "DirectionalLight" ||
      object.type === "PointLight" ||
      object.type === "AmbientLight"
    );
  }

  // 序列化单个对象
  private static serializeObject(object: Object3D): SerializedObject {
    const serialized: SerializedObject = {
      uuid: object.uuid,
      type: object.type,
      name: object.name,
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
      scale: [object.scale.x, object.scale.y, object.scale.z],
      visible: object.visible,
      userData: object.userData,
      children: [],
    };

    // 序列化子对象
    object.children.forEach((child) => {
      if (this.isSerializableObject(child)) {
        serialized.children.push(this.serializeObject(child));
      }
    });

    // 序列化Mesh特有属性
    if (object.type === "Mesh" && (object as Mesh).material) {
      const mesh = object as Mesh;
      serialized.material = this.serializeMaterial(mesh.material);
      serialized.geometry = { type: mesh.geometry.type };
    }

    return serialized;
  }

  // 序列化材质
  private static serializeMaterial(material: Material | Material[]): any {
    if (Array.isArray(material)) {
      return material.map((m) => this.serializeSingleMaterial(m));
    }

    return this.serializeSingleMaterial(material);
  }

  // 序列化单个材质
  private static serializeSingleMaterial(material: Material): any {
    const serialized: any = {
      type: material.type,
      uuid: material.uuid,
      name: material.name,
      transparent: material.transparent,
      opacity: material.opacity,
      visible: material.visible,
    };

    // 处理常见材质类型的特定属性
    const anyMaterial = material as any;
    if (anyMaterial.color) {
      serialized.color = anyMaterial.color.getHex();
    }

    if (anyMaterial.emissive) {
      serialized.emissive = anyMaterial.emissive.getHex();
    }

    if (anyMaterial.metalness !== undefined) {
      serialized.metalness = anyMaterial.metalness;
    }

    if (anyMaterial.roughness !== undefined) {
      serialized.roughness = anyMaterial.roughness;
    }

    if (anyMaterial.wireframe !== undefined) {
      serialized.wireframe = anyMaterial.wireframe;
    }

    return serialized;
  }

  // 保存场景到文件
  static saveScene(scene: Scene): Blob {
    const serialized = this.serializeScene(scene);
    return new Blob([serialized], { type: "application/json" });
  }

  // 下载文件
  static downloadFile(blob: Blob, fileName: string): void {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
