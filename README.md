# model-x

[![Greenkeeper badge](https://badges.greenkeeper.io/GrimoireGL/grimoirejs-model-x.svg)](https://greenkeeper.io/)
> Add .x file support in grimoire.js

xファイル形式をgrimoirejsで表示するためのアドオン。

# installation

```bash
  npm install grimoirejs-model-x --save
```

## XMesh コンポーネント
<!-- EDIT HERE(@Component)-->
<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| materialInfo | Object | undefined | なし |
| geometry | Object | undefined | なし |
| layer | String | "default" | なし |
| targetBuffer | String | "default" | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### materialInfo 属性

 * `converter`: Object
 * `defaultValue`: undefined

<!-- EDIT HERE(materialInfo)-->
<!-- /EDIT HERE-->
### geometry 属性

 * `converter`: Object
 * `defaultValue`: undefined

<!-- EDIT HERE(geometry)-->
<!-- /EDIT HERE-->
### layer 属性

 * `converter`: String
 * `defaultValue`: "default"

<!-- EDIT HERE(layer)-->
<!-- /EDIT HERE-->
### targetBuffer 属性

 * `converter`: String
 * `defaultValue`: "default"

<!-- EDIT HERE(targetBuffer)-->
<!-- /EDIT HERE-->

## XModel コンポーネント
<!-- EDIT HERE(@Component)-->
<!-- /EDIT HERE-->
### 属性
<!-- DO NOT EDIT -->
<!-- ATTRS -->
| 属性名 | コンバーター | デフォルト値 | その他 |
|:------:|:------:|:------:|:------:|
| src | String | undefined | なし |

<!-- /ATTRS -->
<!-- /DO NOT EDIT -->
### src 属性

 * `converter`: String
 * `defaultValue`: undefined

<!-- EDIT HERE(src)-->
<!-- /EDIT HERE-->

# LICENSE

MIT
