import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { Object3D } from "three";

/**
 * Exports a 3D model to GLTF format
 * @param model The Three.js model to export
 * @param fileName Name for the downloaded file
 */
export const exportModelToGLTF = (
  model: Object3D,
  fileName: string = "model.glb"
): void => {
  const exporter = new GLTFExporter();

  exporter.parse(
    model,
    (result) => {
      if (result instanceof ArrayBuffer) {
        saveArrayBuffer(result, fileName);
      } else {
        const output = JSON.stringify(result, null, 2);
        saveString(output, fileName.replace(".glb", ".gltf"));
      }
    },
    (error) => {
      console.error("An error occurred during export:", error);
    },
    { binary: fileName.endsWith(".glb") }
  );
};

/**
 * Saves an array buffer to a file and triggers download
 */
const saveArrayBuffer = (buffer: ArrayBuffer, fileName: string): void => {
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

/**
 * Saves a string to a file and triggers download
 */
const saveString = (text: string, fileName: string): void => {
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};
