//
// DO NOT REMOVE THE LINE BELOW.
//
import GrimoireInterface from "grimoirejs";
import GLExtRequestor from "grimoirejs-fundamental/lib/Resource/GLExtRequestor";
import MaterialFactory from "grimoirejs-fundamental/lib/Material/MaterialFactory";
import XShader from "./Shader/X.sort";
//<%=IMPORTS%>

GrimoireInterface.register(async () => {
  //<%=REGISTER%>
  GrimoireInterface.registerNode("model-x", ["Transform", "XModel"]);
  GrimoireInterface.registerNode("mesh-x", ["MaterialContainer", "XMesh"]);
  GLExtRequestor.request("OES_element_index_uint");
  MaterialFactory.addSORTMaterial("model-x-unlit", XShader);
});
