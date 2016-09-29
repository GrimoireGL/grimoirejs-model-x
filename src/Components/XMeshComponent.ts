import Texture2D from "grimoirejs-fundamental/lib/Resource/Texture2D";
import ImageResolver from "grimoirejs-fundamental/lib/Asset/ImageResolver";
import IMaterialArgument from "grimoirejs-fundamental/lib/Material/IMaterialArgument";
import IRenderMessage from "grimoirejs-fundamental/lib/Messages/IRenderMessage";
import Geometry from "grimoirejs-fundamental/lib/Geometry/Geometry";
import IXMaterial from "../Parser/IXMaterialData";
import TransformComponent from "grimoirejs-fundamental/lib/Components/TransformComponent";
import MaterialContainerComponent from "grimoirejs-fundamental/lib/Components/MaterialContainerComponent";
import Component from "grimoirejs/lib/Node/Component";
import IAttributeDeclaration from "grimoirejs/lib/Node/IAttributeDeclaration";
import AssetLoader from "grimoirejs-fundamental/lib/Asset/AssetLoader";

export default class XMeshComponent extends Component {
  public static attributes: { [key: string]: IAttributeDeclaration } = {
    materialInfo: {
      converter: "Object",
      defaultValue: undefined
    },
    geometry: {
      converter: "Object",
      defaultValue: undefined
    },
    layer: {
      converter: "String",
      defaultValue: "default"
    },
    targetBuffer: {
      converter: "String",
      defaultValue: "default"
    }
  };

  private _transform: TransformComponent;

  private _materialContainer: MaterialContainerComponent;

  private _geometry: Geometry;

  private _materialInfo: IXMaterial;

  private _layer: string;

  private _targetBuffer: string;

  private _gl: WebGLRenderingContext;

  public $mount(): void {
    this._transform = this.node.parent.getComponent("Transform") as TransformComponent;
    this._materialContainer = this.node.getComponent("MaterialContainer") as MaterialContainerComponent;
    this._materialInfo = this.getValue("materialInfo");
    this.getAttribute("layer").boundTo("_layer");
    this.getAttribute("targetBuffer").boundTo("_targetBuffer");
    this.getAttribute("geometry").boundTo("_geometry");
    this._gl = this.companion.get("gl");
    this._materialContainer.materialArgs = Object.assign(this._materialContainer.materialArgs, this._materialInfo);
    if (this._materialInfo.texture) {
      const al = this.companion.get("loader") as AssetLoader;
      al.register<Texture2D>((async () => {
        const textureImg = await ImageResolver.resolve(this._materialInfo.texture);
        const tex = new Texture2D(this.companion.get("gl"));
        tex.update(textureImg);
        this.node.attr("texture", tex);
        return tex;
      })());
    }
  }

  private isFirst: boolean = true;

  public $render(args: IRenderMessage): void {
    if (this._layer !== args.layer) {
      return;
    }
    if (!args.material && !this._materialContainer.ready) {
      return; // material is not instanciated yet.
    }
    if (this.isFirst) {
      // TODO 遅延評価されるようになったら属性を使用
      this.node.attr("emissiveColor", this._materialInfo.emissiveColor);
      this.node.attr("faceColor", this._materialInfo.faceColor);
      this.node.attr("specularColor", this._materialInfo.specularColor);
      this.node.attr("power", this._materialInfo.power);
      this.isFirst = false;
    }
    const renderArgs = <IMaterialArgument>{
      targetBuffer: this._targetBuffer,
      geometry: this._geometry,
      attributeValues: null,
      camera: args.camera.camera,
      transform: this._transform,
      buffers: args.buffers,
      viewport: args.viewport,
      drawCount: this._materialInfo.indexCount,
      drawOffset: this._materialInfo.indexOffset
    };
    if (args.material) {
      renderArgs.attributeValues = args.materialArgs;
      args.material.draw(renderArgs);
    } else {
      renderArgs.attributeValues = this._materialContainer.materialArgs;
      this._materialContainer.material.draw(renderArgs);
    }
    this.companion.get("gl").flush();
  }
}
