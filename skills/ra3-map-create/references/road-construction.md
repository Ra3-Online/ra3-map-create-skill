# 道路制作：先分系统，再做端面小样

新建道路、改路口、铺铁路、桥头或木栈道时读本页。先从 [地区与季节](style-index.md) 选择相关场景，再看下方相应位置图；中立矿位规则仍在 [道路与中立设施](roads-and-neutrals.md)。本页依据95个官方来源场景版本（26战役来源、69挑战合集）的统一 MCP 精确缓存、14个实际查看的分区、9个位置的 step=1 重查和18个真实模型几何。社区整理版本的 EA 原件哈希未独立确认。

## 1. 用途决定系统

| 需要做什么 | 数据/资源与正确入口 | 不可混用的判断 |
|---|---|---|
| 两点路面、土路、步道、路缘、停车线 | Road：连续同类型起终点，端点位 2/4；`ra3map_add_road_segment` | Road不是全部为主车道。WhiteLine/ParkingLines/Trim/Sidewalk常是细部；不要把街段模型传入两点工具 |
| 城市主车行面、街口、短接口 | 普通 Object：`AM/KR/ST/IF/HB/HV/..._StreetSegment*`，用 `ra3map_batch_place` 或当前单体放置接口 | 按真实型号的端面拼接；普通 Object 的 `roadOption=0`，不能据前缀造一对Road节点 |
| 铁路 | 普通 Object：实际观测 `VL_Rail*`；道床另铺，站台/站房另配 | `VL_Rail01` 是本轮读到真实几何和坡段记录的轨道，不能写成护栏，也不用道路白线代替 |
| 专门桥梁 | BridgeBuilder：连续同类型起终点，端点位16/32；实际桥模板＋`ra3map_add_road_segment(bridge:true)` | 先查 `ra3map_road_templates` 返回的 bridges；名字含Bridge不能自动决定类型 |
| 普通桥体、桥台、平台、侧壁 | 普通 Object：查模型、支撑、端头和高程，按实际构件放置 | m056看得到桥而BridgeBuilder数为0；`RomaniaBridge/02` 在本集合却是Road节点。不能用名称或 bridgeCount=0 判断有无桥/可通行 |
| 木质临水铺装 | `HawaiiWood01/02` 是本轮m066观测到的Road；本轮模板width分别15/20世界单位 | 本集合与当前Object目录未发现 `WoodRoad` 普通Object；木板面不自动提供承重结构或游戏通桥 |
| 浮岛要塞街路与平台边 | `IF_StreetSegment*` 是街面Object；`IslandFortressSidewalk*/Trim*` 是Road细部；`FI_EdgePiece*` 是结构 | **IF道路与FI平台不能混淆**；本集合没有 `FI_STREETSEGMENT`，钢铁地表、道路和侧壁是三个层 |

95版本有75,202个Road段、34个BridgeBuilder段、11,347个StreetSegment对象和204种道路相关Object候选。数量包含边饰/标线，不能照此密度铺主路。当前集合与目录未发现 `NT/NY/SV/FI_STREETSEGMENT` 或WoodRoad普通Object；未发现仅限这些输入，新游戏/MOD要重新查目录。

## 2. 地区、季节、场景候选

候选决定从哪里开始查，不能代替当前资源确认。城市允许不同街段族共存；同族编号也不代表相同路宽或接口。

| 地区/季节 → 场景 | 主面与配套候选 | 看图与采用边界 |
|---|---|---|
| 俄国冬季 → 城区/村镇/港口 | KR与部分ST街段Object；Kremlin/Vlad等Road路缘；VL轨道 | [m049](../assets/roads/m049-focus-crop.jpg)、[m050](../assets/roads/m050-focus-crop.jpg)、[m051](../assets/roads/m051-focus-crop.jpg)、[u064](../assets/roads/u064-focus-crop.jpg)：雪地语境由画面确认；车道、停车、港堤和铁路分层 |
| 俄国非雪季 → 河谷城市/桥头 | ST街段、VL轨道、实际BridgeBuilder或普通桥体 | [m055](../assets/roads/m055-focus-crop.jpg)、[m056](../assets/roads/m056-focus-crop.jpg)：低位铁路沿河，车路以坡口接高处街块 |
| 西欧暖季 → 河城/运河城 | ST/HB/HV/AM街段；本地路缘与桥模板 | [m071](../assets/roads/m071-focus-crop.jpg)、[m076](../assets/roads/m076-focus-crop.jpg)：海德堡混HV/HB，阿姆斯特丹AM街面与岸墙/桥头分别接合 |
| 美洲温带/暖季 → 商业/停车街块/港区 | ST/HB/HV/CA等街段；停车白线Road | [m075](../assets/roads/m075-focus-crop.jpg)、[m078](../assets/roads/m078-focus-crop.jpg)：纽约实际用ST，不发明NY街段；商业街块与装卸码头分区 |
| 地中海暖季 → 海岸街区 | MY街段、MykonosSidewalk等Road | m079现有[图册](../assets/campaign/m079-atlas.jpg)：该图170个MY对象全Z=1，只是该案例记录 |
| 热带尤卡坦 → 村镇/林缘 | YucatanDirtRoad01、YucatanFootpath01、YucatanRoad01/02等Road | [u015](../assets/roads/u015-focus-crop.jpg)：土路顺岸绕台地接住屋，不强制套城市Object街面 |
| 林地湖岸 → 乡村/木屋/坡口 | MtRushmoreRoad01与配套Road边带 | [u005](../assets/roads/u005-focus-crop.jpg)：长主路接支路；现实地域与确切季节未独立确认，混用Yucatan地表不证明热带 |
| 暖季夏威夷 → 仓储港岸/木质铺装 | 车行硬面、停车Road、HawaiiWood01/02 Road分别制作 | [m066](../assets/roads/m066-focus-crop.jpg)：水侧木板边带与岸上停车/装卸面有不同用途 |
| 日本科技 → 浮岛钢铁平台 | IF街段＋IslandFortress Road边带＋FI边缘结构＋SteelDeck底材 | [m064](../assets/roads/m064-focus-crop.jpg)：街路绕人工院落和货箱区，平台外凸端头需真实结构 |

只读当前地区的两三个候选，不一次加载完整库。紧凑 [road-candidates.json](road-candidates.json) 保留95版本出处计数、真实候选名、18个模型尺寸和端面候选；[road-focus-cases.json](road-focus-cases.json) 保留14个位置的精确坐标、对象/端点、附近类型、step=1摘要和图像路径。裁图黄圈是原相机coverage插值的近似定位，不是像素级端面测量。完整原图由现有campaign/uprising图册入口查看。

在本Skill目录执行下列只读筛选，替换型号/case即可。脚本内部读取JSON，向上下文只输出所选字段；不要把完整候选文件或一个case的全部附近对象直接倒出。

```powershell
$roadEvidence = Get-Content -LiteralPath 'references/road-candidates.json' -Raw | ConvertFrom-Json
$roadEvidence.models | Where-Object typeName -EQ 'AM_StreetSegment05' | Select-Object typeName, dimensions, bounds, endpointCandidates | ConvertTo-Json -Depth 12
$roadFocus = Get-Content -LiteralPath 'references/road-focus-cases.json' -Raw | ConvertFrom-Json
$roadFocus.cases | Where-Object id -EQ 'm076' | Select-Object id, selected, step1Positions | ConvertTo-Json -Depth 8
```

## 3. 每个型号先看局部轴和两端面

先查当前Object目录、`ra3map_object_place_info` 与 `ra3map_model_geometry`。真实mesh宽长、碰撞半轴、模型原点和道路前进轴是不同量；不能只用圆形半径、最长bbox轴或编号决定步长。需要几何细节时 `includeData:true` 并把顶点/索引留在脚本或文件中，不倒满模型上下文；缺省placement字段不表示模型不存在。

| 型号 | 实测mesh XY尺寸（世界单位） | 原图本地轴/中心步长候选 | 小样限制 |
|---|---:|---|---|
| AM05 | 66.224×100.000 | Y / 100（m076 #3721→#3722） | 不能全族沿X拼 |
| AM06 | 100.748×100.000 | X / 约99.643（m076 #111→#112） | 0.748余边不是应留缝或通用100.748中心距 |
| AM07 | 100.665×100.000 | 未确认连续同型端面对接 | 方形型号不能仅据bbox判路口/前向 |
| AM32 | 66.224×300.000 | 本地Y长轴；连续步长未认证 | 不宣称300步长已验收 |
| AM33 | 300.748×100.000 | X / 300（m076 #3513→#3514） | 长段也要核两端面 |
| ST06 / HB06 | 100.748×100.000 | X / 约100 | HB碰撞半轴60不等于路段长120；坡段投影中心距可能变短 |
| ST11 | 172.696×100.000 | 观测Y / 约100 | 最长bbox轴是X，不能据最长轴选前向 |
| KR04 | 90.000×85.479 | 主候选X / 约90 | Y近邻可能是并排/路口，不能都算端面接合 |
| IF01 | 120.000×92.444 | X / 约120 | 只适用于该型号 |
| IF07 | 30.000×92.444 | X / 约30 | Y是更长的横向宽度，不能沿最长轴连段 |
| IF12 | 49.749×100.050 | 连续端面未确认 | 原点偏心，不能当正中30×120矩形 |
| VL_Rail01 | 90.000×22.377 | X / 约90 | 是轨道；坡段与道床独立核对 |
| HB31 | 21.187×64.670 | 前进轴未确认 | HB系列不是全部100长直段 |
| HV09 | 100.000×85.479 | X / 约100 | 跨族使用不证明接口可互换 |
| YU_SunkenPlatform01 | 207.748×220.064 | 不是普通车行直段 | Z边界约-39.765–72.557；碰撞半径2不能代替渲染占地 |

原图邻接是数学候选，未认证目标WB/game接缝。旋转角a把本地位移映到世界：`dx=cos(a)·localX−sin(a)·localY`，`dy=sin(a)·localX+cos(a)·localY`（角度先换弧度）。例如AM05本地Y沿路，world前向相对angle多90°；IF07本地X沿路，不能照AM05的排列方法。用户规定世界主路45°奇数倍时，按模型本地轴换算angle，房屋和路灯另看正面。

**可扩展的小样**：同一型号放两件直段，保留原生scale；用真实端面、纹理方向和路宽对齐，再加一种实际存在的转角/接口。固定机位看平面与低角度，检查中心、两侧边、透明余边和接头；保存、关闭、fresh重开后复查。一个型号通过不替其他型号通过。

## 4. Z、底材与贴地按位置保留

Object `z` 是**相对地面偏移**，不是绝对高程。既不全图+1，也不为了统一把已有精确值归零。95版本的AM366个对象没有Z=1：297个Z=0、34个0.05、14个0.02、13个0.03等；m079的MY170个对象全Z=1。ST/KR/IF也有各自的0、1和微调值，不能互相推广。

本集合step=2底材统计没有 `Invisible`。9个关键位置又以step=1重查，实际有铺装、雪、草、砾石与钢铁底材。用户某版本“AM+1/Invisible”的做法保留为需要其实际图和精确位置确认的候选，不写成统一先决条件。模型下底材要按当前位置读取，不据图中一个透明区猜全段。

`alignToTerrain` 保留 **缺省 / true / false** 三态；缺省是未记录属性，原版默认未独立确认。m056 ST06 #843 `(1421.3384,1813.7634)` angle=-135、Z=0、true，旋转mesh AABB的98格有高程210–235.45；VL_RAIL01 #2076 `(1932.1713,4898.2856)` angle=0、Z=0、true，27格高程272.92–280，实际支持道路和铁路坡段勾贴地的小样。m076 AM06 #111 Z=0.05/缺省，98格全高程250；m064 IF12 #1027 Z=1/缺省，49格全281.01。

贴地true不自动修复任意坡面。读共享地形的step=1高度/材质，圈完整路宽和转角，检查中心、两侧边、路外邻格、坡顶坡脚和端面对接。旋转mesh的AABB仍含透明区与非三角形占地，统计不等于每个可见像素的底材。保持模型原点与相邻段高程合理，再决定局部整地或具体对象属性。

## 5. MCP小样：先核当前schema

以下JSON字段已对本轮实际224个工具的 `listTools` schema核对；表示参数形状，**不是这些合成小样已经在native/game测试通过**。handle取当前打开回执，owner取地图现有Civilian玩家/队伍；目标世界坐标由实际设计选定，不能抄原关卡整组坐标。工具升级后以当前schema为准。

先查询模板/精确节点，再查当前街段模型。`ra3map_road_templates` 无参数，返回 roads 与 bridges；模板内部名在返回记录的 `id`，把这个值作为添加段的 `typeName`，不要猜返回字段为name。Road记录有width、widthInTexture、priority，桥记录有桥宽、端帽与中心模型/长度；本轮YucatanDirtRoad01宽65、HV_Bridge_01桥宽180、HB_Bridge_02桥宽190，最终仍以目标挂载版本查询为准。`ra3map_road_kinds` 的真实使用统计与模板目录互补。

```json
{"tool":"ra3map_road_templates","arguments":{}}
{"tool":"ra3map_list_objects","arguments":{"handle":"<当前handle>","filter":"StreetSegment","limit":20,"exact":true,"includeProps":true}}
{"tool":"ra3map_object_place_info","arguments":{"typeNames":["AM_StreetSegment05","IF_StreetSegment07","VL_Rail01"]}}
{"tool":"ra3map_model_geometry","arguments":{"typeName":"AM_StreetSegment05","includeData":true}}
```

普通模型示例是AM05本地Y方向、angle=0的两件100间隔；省略align保持缺省。必须先核当前型号、底材、端面和Civilian归属，再把坐标和owner换成实际小样。坡段需要贴地时把 `props.alignToTerrain:true` 写在具体Object；不要给两点Road工具添加不存在的z/align参数。

```json
{"tool":"ra3map_batch_place","arguments":{"handle":"<当前handle>","items":[{"typeName":"AM_StreetSegment05","x":500,"y":500,"z":0,"angle":0,"owner":"<地图Civilian队伍>"},{"typeName":"AM_StreetSegment05","x":500,"y":600,"z":0,"angle":0,"owner":"<地图Civilian队伍>"}]}}
{"tool":"ra3map_batch_place","arguments":{"handle":"<当前handle>","items":[{"typeName":"ST_StreetSegment06","x":800,"y":500,"z":0,"angle":0,"owner":"<地图Civilian队伍>","props":{"alignToTerrain":true}}]}}
```

Road示例用一种已确认的土路做直段和拐角，复用精确端点。`cornerType:broad|tight|angled`是互斥选择；join仅表示接头，不等于整地、连续UV或游戏兼容修复。普通道路用 `bridge:false`；实际桥模板才使用 `bridge:true`。

```json
{"tool":"ra3map_add_road_segment","arguments":{"handle":"<当前handle>","typeName":"YucatanDirtRoad01","x1":500,"y1":800,"x2":800,"y2":800,"cornerType":"broad","join":true,"bridge":false}}
{"tool":"ra3map_add_road_segment","arguments":{"handle":"<当前handle>","typeName":"YucatanDirtRoad01","x1":800,"y1":800,"x2":800,"y2":1100,"cornerType":"broad","join":true,"bridge":false}}
{"tool":"ra3map_add_road_segment","arguments":{"handle":"<当前handle>","typeName":"HV_Bridge_01","x1":1500,"y1":500,"x2":1500,"y2":1200,"bridge":true}}
```

T字支路接现有段中间时，在该段垂足调用 `ra3map_split_road_segment`，其index必须是新鲜读取的起点下标；拆分会改变后续下标，之后重读对象再接。数学相交不等于节点连接。仅同位置隔离试验明确需要改拐角/Join时才用 `ra3map_set_road_options` 并显式传局部indices；省略indices会作用全图，不能当局部修复。

## 6. 目标原生异常与提示的边界

用户已反馈斯大林格勒 **R7和R8游戏中仍异常**；拆段和清拐角/Join都不能写成该症状的通用修复。用户新图还出现NRoad与Kremlin异型混连问题，需要对实际端点/路宽/地形/flag和目标WB/game做隔离比较。不同Road类型共享或靠近端点可能有兼容风险，仍保留源图有用途的连接、转角和标线。

当前新版UI的连接提示是**非阻断的潜在兼容提醒**：不禁止Road混连，不自动清flags，不自动改地图；MCP/批量脚本仍需用精确节点复核。并排路缘、短标线、BridgeBuilder与普通模型不因画面相邻就算同类车路混连。提示出现不是native缺陷被定位，提示未出现也不是兼容认证。

道路下陷、侧壁、拉伸时先查全路宽地形、具体模板宽度与UV/端帽等选项，不能只读端点或中心线。目标版原Road Options的Adjust Terrain、连续UV和Join是不同概念，未在当前工具schema公开的字段不要凭名字拼进参数。需要修改时另存局部A/B，保持其他高度、材质、节点和灯参数，保存→关闭→fresh重开→同机位看目标WB/game；记录每项实际回执和用户游戏反馈。

最终分别写Core往返、预览小样、目标WB加载/接缝、游戏启动/通行的结果。研究图、模型尺寸、节点统计、UI提示和保存成功都不能写成native已修复。具体交付字段见 [游戏兼容验收](game-compatibility.md)。
