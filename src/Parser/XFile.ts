import ImageResolver from "grimoirejs-fundamental/lib/Asset/ImageResolver";
import {Vector3, Vector4} from "grimoirejs-math";
import IXMaterial from "./IXMaterialData";
export default class XFile {

  public positions: number[];

  public texCoords: number[];

  public indicies: number[];

  public normals: number[];

  public materials: IXMaterial[] = [];

  private _dataSource: string;

  private _directory: string;

  constructor(dataSource: string, directory: string) {
    this._dataSource = dataSource;
    this._directory = directory;
    const meshSection = this._sliceSection(dataSource, "Mesh", 0);
    const meshMaterialSection = this._sliceSection(meshSection, "MeshMaterialList", 0);
    this._parsePositions(meshSection);
    this._parseTexCoords(this._sliceSection(meshSection, "MeshTextureCoords", 0));
    this._parseMaterials(meshMaterialSection);
    this._parseFaces(meshSection, meshMaterialSection);
    this._generateNormals();
    this._prepareForUsing();
  }

  private _sliceSection(source: string, sectionName: string, offset: number): string {
    const regex = new RegExp(`([^{template}]\\s+)${sectionName}\\s*\\{`, "g");
    let found = regex.exec(source);
    for (let i = 0; i < offset; i++) {
      found = regex.exec(source);
    }
    if (!found) {
      return undefined;
    }
    let bracketCount = 0;
    let index = found.index;
    while (true) {
      const nextEndBlacket = source.indexOf("}", index);
      const nextBeginBlacket = source.indexOf("{", index);
      if (nextEndBlacket < 0 && nextBeginBlacket < 0) {
        throw new Error("Unmatch blacket!!");
      }
      if (nextBeginBlacket < 0) {
        // This means this blacket is end of this section
        index = nextEndBlacket + 1;
        break;
      } else if (nextBeginBlacket < nextEndBlacket) {
        index = nextBeginBlacket + 1;
        bracketCount++;
      } else {
        index = nextEndBlacket + 1;
        bracketCount--;
      }
      if (bracketCount === 0) {
        break;
      }
    }
    return source.substring(found.index + found[1].length, index);
  }

  private _isValidNumber(char: string): boolean {
    const code = char.charCodeAt(0);
    if (code === 46 || (code >= 48 && code <= 57) || code === 45) { // -,.,0-9
      return true;
    }
    return false;
  }

  private *_numberParser(source: string): IterableIterator<number> {
    let str: string = "";
    for (let i = 0; i < source.length; i++) {
      const c = source.charAt(i);
      if (this._isValidNumber(c)) {
        str += c;
      } else {
        if (str.length !== 0) {
          yield parseFloat(str);
          str = "";
        }
      }
    }
  }

  private _parsePositions(meshSection: string): void {
    const generator = this._numberParser(meshSection);
    const count = generator.next();
    const positionCache = new Array(count.value * 3);
    for (let i = 0; i < positionCache.length; i++) {
      positionCache[i] = generator.next().value;
    }
    this.positions = positionCache;
  }

  private _parseFaces(meshSection: string, meshMaterialListSection: string): void {
    const faceRegex = /[34];(\d+),(\d+),(\d+)(?:,(\d+))?;/g;
    let faceRegexResult;
    let faceCache: number[][] = [];
    const materialIndexRegex = /(\d+)/g;
    let materialGroupCount = parseInt(materialIndexRegex.exec(meshMaterialListSection)[1], 10);
    const matIndiciesCount = parseInt(materialIndexRegex.exec(meshMaterialListSection)[1], 10);
    for (let i = 0; i < materialGroupCount; i++) {
      faceCache[i] = [];
    }
    for (let i = 0; i < matIndiciesCount; i++) {
      faceRegexResult = faceRegex.exec(meshSection);
      const materialIndex = parseInt(materialIndexRegex.exec(meshMaterialListSection)[1], 10);
      if (faceRegexResult[4]) {
        const f1 = parseInt(faceRegexResult[1], 10), f2 = parseInt(faceRegexResult[2], 10), f3 = parseInt(faceRegexResult[3], 10), f4 = parseInt(faceRegexResult[4], 10);
        faceCache[materialIndex].push(f1, f2, f4, f2, f3, f4);
      } else {
        faceCache[materialIndex].push(parseInt(faceRegexResult[1], 10), parseInt(faceRegexResult[2], 10), parseInt(faceRegexResult[3], 10));
      }
    }
    // Reduce unused materials
    for (let i = 0; i < faceCache.length; i++) {
      if (faceCache[i].length === 0) {
        faceCache.splice(i, 1);
        this.materials.splice(i, 1);
        i--;
      }
    }
    // Set face count for materials
    let offset = 0;
    for (let i = 0; i < faceCache.length; i++) {
      this.materials[i].indexOffset = offset;
      offset += this.materials[i].indexCount = faceCache[i].length;
    }
    // Concat face Array
    let concattedFaceArray = [];
    for (let i = 0; i < faceCache.length; i++) {
      concattedFaceArray = concattedFaceArray.concat(faceCache[i]);
    }
    this.indicies = concattedFaceArray;
  }

  private _parseMaterials(meshMaterialSection: string): void {
    let materialSection;
    let materialIndex = 0;
    while ((materialSection = this._sliceSection(meshMaterialSection, "Material", materialIndex))) {
      const foundNumbers = new Array(11);
      const generator = this._numberParser(materialSection);
      for (let i = 0; i < 11; i++) {
        foundNumbers[i] = generator.next().value;
      }
      const textureSection = this._sliceSection(materialSection, "TextureFilename", 0);
      let texturePath;
      if (textureSection) {
        texturePath = /"([^"]+)"/.exec(textureSection)[1].replace(/\\/g, "/");
        texturePath = texturePath.replace(".tga", ".tga.png");
      }
      this.materials[materialIndex] = {
        faceColor: new Vector4(foundNumbers[0], foundNumbers[1], foundNumbers[2], foundNumbers[3]),
        power: foundNumbers[4],
        specularColor: new Vector3(foundNumbers[5], foundNumbers[6], foundNumbers[7]),
        emissiveColor: new Vector3(foundNumbers[8], foundNumbers[9], foundNumbers[10]),
        texture: texturePath ? this._directory + texturePath : undefined,
        indexCount: undefined,
        indexOffset: undefined
      };
      materialIndex++;
    }
  }

  private _parseTexCoords(meshTextureSection: string): void {
    const generator = this._numberParser(meshTextureSection);
    const count = generator.next();
    const texCoordsCache = new Array(count.value * 2);
    for (let i = 0; i < texCoordsCache.length; i++) {
      texCoordsCache[i] = generator.next().value;
    }
    this.texCoords = texCoordsCache;
  }

  private _prepareForUsing(): void {
    // Load textures
    for (let i = 0; i < this.materials.length; i++) {
      if (this.materials[i].texture) {
        ImageResolver.resolve(this.materials[i].texture);
      }
    }
  }

  private _generateNormals(): void {
    let normalCache = [];
    for (let i = 0; i < this.indicies.length; i += 3) {
      const f1i = this.indicies[i];
      const f2i = this.indicies[i + 1];
      const f3i = this.indicies[i + 2];
      const normal = this._generateNormal(f1i, f2i, f3i);
      normalCache[3 * f1i] = normalCache[3 * f2i] = normalCache[3 * f3i] = normal[0];
      normalCache[3 * f1i + 1] = normalCache[3 * f2i + 1] = normalCache[3 * f3i + 1] = normal[1];
      normalCache[3 * f1i + 2] = normalCache[3 * f2i + 2] = normalCache[3 * f3i + 2] = normal[2];
    }
    this.normals = normalCache;
  }

  private _generateNormal(p1Index: number, p2Index: number, p3Index: number): number[] {
    const p1x = this.positions[3 * p1Index]; const p1y = this.positions[3 * p1Index + 1]; const p1z = this.positions[3 * p1Index + 2];
    const p2x = this.positions[3 * p2Index]; const p2y = this.positions[3 * p2Index + 1]; const p2z = this.positions[3 * p2Index + 2];
    const p3x = this.positions[3 * p3Index]; const p3y = this.positions[3 * p3Index + 1]; const p3z = this.positions[3 * p3Index + 2];
    const ret = [(p2y - p1y) * (p3z - p1z) - (p2z - p1z) * (p3y - p1y)
      , (p2z - p1z) * (p3x - p1x) - (p2x - p1x) * (p3z - p1z),
      (p2x - p1x) * (p3y - p1y) - (p2y - p1y) * (p3x - p1x)];
    const length = Math.sqrt(ret[0] * ret[0] + ret[1] * ret[1] + ret[2] * ret[2]);
    ret[0] /= length; ret[1] /= length; ret[2] /= length;
    return ret;
  }
}
