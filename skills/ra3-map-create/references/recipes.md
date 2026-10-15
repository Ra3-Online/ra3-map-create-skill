# 确定性草稿与局部美化

所有路径由调用者提供，运行命令前将占位符替换为当前环境的完整路径。脚本位于本 skill 的 scripts 目录；Node 24 可直接运行。运行输出采用 `新文件夹/同名.map`，已有内容会拒绝覆盖。计划 JSON 很小，AI 可以读和修改参数；大块高程、批量物体和截图编码留在脚本内处理。

## 从零建立双人草稿

```powershell
node <skill>/scripts/make-plan.cjs --out <工作目录>/plan.json --style tropical-coast --seed 20261005 --width 320 --height 320 --title "Coastal Crossing"
node <skill>/scripts/run-plan.cjs --editor <地编项目或agent-kit> --plan <工作目录>/plan.json --out <输出根>/Map_MP_CoastalCrossing/Map_MP_CoastalCrossing.map
```

style 可选 `tropical-coast` / `snow-valley`。seed 固定可复现；可玩尺寸 240..640，border 默认 10，当前自动经济布局仅双人。默认 `--relief gentle --ores 6 --oils 2`；另支持 `--relief standard`、`--ores 10`、`--oils 0`。计划保存 `terrain` 和 `economy`，可以检查或修改。默认有两方基地台地、各两个近矿、成对的高地扩张矿、两个油井、低地进路/沿岸侧路与宽坡道、海湾和成簇装饰。

map.xml、128 TGA、512 `_art.tga` 与三张阶段 PNG 一并生成，检查工具回执和文件存在。新图沿用模板的单片海域，不叠加第二片。原版预览生成器不支持某些非整数陆地高度时，脚本会报告失败；保留地图，按 operations 中的预览说明另行生成，不能为了预览把有层次的地形压平。先读 terrain-design 确认本草稿适合用户需求；它不是成品，也没有自动岩壁物件拼接或真实路段铺设。

这些参数是本草稿的选择，不是红警3所有地图的玩法规范。需要狭长地图、非对称经济、无海图或任务场景时，通过 MCP 设计合适地形和资源，不能仅改名字就宣称需求完成。

## 对已有地图局部美化

```powershell
node <skill>/scripts/make-plan.cjs --out <工作目录>/beauty.json --mode beautify --style tropical-coast --seed 81 --cx 130 --cy 170 --radius 24 --count 60
node <skill>/scripts/run-plan.cjs --editor <地编项目或agent-kit> --plan <工作目录>/beauty.json --source <原图.map> --out <输出根>/Beautified/Beautified.map
```

cx/cy 包含 border。选择陆地区域，脚本在多个小簇中放置树、灌木和岩石，避开出生点/资源与已有物体。默认只增加装饰；先经地图服务成功打开原图，另存并重新打开副本后才修改。校验原有对象逐项不变与原图 SHA256 不变。不改地形、脚本、玩家、资源。精确通路、建造区和视觉适配仍需按区域检查；不能把局部美化的检查当作整个旧地图的重新认证。

## 固定机位截图

```powershell
node <skill>/scripts/capture-map.cjs --editor <含Electron的地编项目> --file <输出.map> --out <新截图目录>
```

截图器需要源码图形版已构建、Electron 可用，以及包含 setCamera 的版本。纯 agent-kit 没有 Electron/3D 场景，使用 MCP 俯视 PNG 并明确画面验证局限。

模型种类很多的地图可加 `--model-kinds 200`，检查输出 `modelStats` 和实际房屋，不把默认加载上限造成的缺画误学为正确场景。距离雾遮住布局时，另拍 `--diagnostic-fog true`：只在不保存的临时会话关闭雾、在渲染器关闭 Bloom，输出会标注诊断视图；原图 SHA256 不变，不能把它称为原始色调/游戏截图。

自定义 `--views <views.json>`，每项如 `{"name":"harbor","cx":170,"cy":190,"distance":1400,"yaw":-1.57,"pitch":0.75}`。yaw/pitch 是弧度，cx/cy 含 border，distance 是场景距离。保存 views.json 后，修正前后重用同一文件。脚本不接受任意代码。默认三机位为总览、左基地与海岸；已有地图的重点不同，应自定义机位。

## 重新验证

```powershell
node <skill>/scripts/validate-map.cjs --editor <工具包> --file <地图.map> --out <新验证文件.json>
```

默认是双人草稿检查。其他设计用 `--checks <checks.json>`，例：`{"players":2,"baseClearRadius":18,"corridorRadius":3,"balancedEconomy":true,"oreCount":6,"oilCount":2}`。不要降低检查参数以让失败图通过，应修地图或依据实际玩法另定合适标准。

## 地形诊断

建筑/道路/矿位的只读观察另用：

```powershell
node <skill>/scripts/analyze-composition.cjs --editor <工具包> --file <地图.map> --out <新观察文件.json>
```

需要新版 MCP 的 `list_objects exact:true`。输出道路端点与转角、民房附近装饰共现、矿脉朝向及两种明确的网格相位残差。只经统一服务读图，校验源文件不变。残差和共现不认证原版吸附、碰撞或游戏采矿，解释见 [道路与中立设施](roads-and-neutrals.md)。

```powershell
node <skill>/scripts/analyze-terrain.cjs --editor <工具包> --file <地图.map> --out <新诊断目录>
```

只读，原图 SHA256 前后校验；地图数据仅经 MCP 读取。批量比较可用 `--list <清单.json>`，数组项为 `{"id":"case-a","file":"<完整地图路径>"}`。输出每图 JSON、summary.json；统计使用真实逐格高度/标志，grid 仅为画图用的 3 格采样。将 grid 的 heights/land/blocked/steep 画成高程/阻挡图，sections 可画剖面；图像 y 向上，坐标为不含 border 的可玩格。

metrics 分开记录陆地与去掉四格岸边带的内部陆地、5 高度单位区间、成片平地/阻挡、两方高度与近矿高度、七格宽的地形通路。统计不含物件碰撞、平台脚面、桥梁寻路和动态单位；有桥/海矿时不能用默认陆路检查认证整图。没有高差不自动判失败，结合水道、分岛或街区结构和实际 3D 再判断。

## 悬崖、材质与院落观察

```powershell
node <skill>/scripts/analyze-beautification.cjs --editor <工具包> --file <地图.map> --out <新观察文件.json> --step 2
```

需要新版 MCP 的 `ra3map_get_terrain_cells`、精确物体清单、高程与水域读取。原图仅经统一服务打开，前后校验 SHA256；输出悬崖两侧高程/材质、相邻中心位置、方向差、干湿材质占比、实际混合配对、建筑/道路/装饰的局部关系。超过逐格上限时显式提高 step 或分区；不以自动截断输出继续推断。

step=2 是比较用采样，问题局部再用 MCP 按 step=1 查询。中心距离不是模型接缝，分类名不是功能认证，材质比例不是新图配额。工具缺失时升级地图服务，输入加载失败时停止该输入；不直接拆读地图字节补数据。
