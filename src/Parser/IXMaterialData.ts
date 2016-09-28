import {Vector3, Vector4} from "grimoirejs-math";
interface IXMaterialData {
  faceColor: Vector4;
  power: number;
  specularColor: Vector3;
  emissiveColor: Vector3;
  indexCount: number;
  indexOffset: number;
  texture?: string;
}
export default IXMaterialData;
