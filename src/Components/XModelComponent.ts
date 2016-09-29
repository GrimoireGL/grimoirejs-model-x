import Component from "grimoirejs/lib/Node/Component";
import IAttributeDeclaration from "grimoirejs/lib/Node/IAttributeDeclaration";
import TextFileResolver from "grimoirejs-fundamental/lib/Asset/TextFileResolver";
import XFile from "../Parser/XFile";
import GeometryBuilder from "grimoirejs-fundamental/lib/Geometry/GeometryBuilder";
import Geometry from "grimoirejs-fundamental/lib/Geometry/Geometry";

export default class XModelComponent extends Component {
  public static attributes: { [key: string]: IAttributeDeclaration } = {
    src: {
      converter: "String",
      defaultValue: undefined
    }
  };

  private geometry: Geometry;

  public $mount(): void {
    if (this.getValue("src")) {
      this._loadFile();
    }
  }

  private async _loadFile(): Promise<void> {
    const x = await TextFileResolver.resolve(this.getValue("src"));
    const xf = new XFile(x, "./");
    this.geometry = GeometryBuilder.build(this.companion.get("gl"), {
      indicies: {
        default: {
          topology: WebGLRenderingContext.TRIANGLES,
          generator: function* () {
            yield* xf.indicies;
          }
        }
      },
      verticies: {
        main: {
          size: {
            position: 3,
            normal: 3,
            uv: 2
          },
          count: xf.positions.length / 3,
          getGenerators: () => {
            return {
              position: function* () {
                yield* xf.positions;
              },
              normal: function* () {
                yield* xf.normals;
              },
              uv: function* () {
                yield* xf.texCoords;
              }
            };
          }
        }
      }
    });
    console.log(this.geometry.indicies["default"].count);
    for (let i = 0; i < xf.materials.length; i++) {
      const material = xf.materials[i];
      this.node.addNode("mesh-x", {
        materialInfo: material,
        material: "new(model-x-unlit)",
        geometry: this.geometry,
        layer: "default",
        targetBuffer: "default"
      });
    }
  }
}
