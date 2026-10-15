# 起义场景美化：逐区看图，再制作局部

本轮覆盖新增目录的 **74 个地图文件、675 个分区视图、877 张原始截图**。其中 71 个文件位于起义挑战合集，另有北境极地、浮岛要塞和美国小镇。合集含重制/重置版与少量 MOD 样例，不能称为 71 张未经修改的官方原图。过滤已识别军事物体和路径点后的美化签名有 70 组；这不是 70 种独立美术风格。

打开 [全图分区图册](../assets/uprising/gallery.html)，按任务选 1–2 张；实际看相关全区图册与原尺寸近景。74 张图册都含所有分区，从北到南排列，每格标有数组格坐标；另有 34 张精选近景可单独打开。每图的观察、材质候选、建筑邻域、相对位置、悬崖相邻段和逐区素材分布见 [案例数据](uprising-cases.json)，只检索目标 ID。

**只学习美化**。不迁移出生点、初始军事基地、矿位/资源数量、任务分区、军用空场或剧情脚本。截图在未保存的诊断会话中暂时隐藏 9,781 个已识别军事物体，关闭距离雾、Bloom 与选择标记；中立资源、未知 MOD 对象、地垫和部分旧模型仍可能可见。资料原图没有修改；编辑器画面不等同于游戏内效果认证。

## 先分场景，再选资产

| 想制作的场景 | 优先打开 | 已核对的候选与位置关系 |
|---|---|---|
| 冬季港城 / 物流岸线 | [u001 北境极地](../assets/uprising/u001-atlas.jpg)、[港区近景](../assets/uprising/u001-detail-courtyard.jpg) | `OD_WAREHOUSE02` 等仓库靠硬化货场；集装箱、装卸设备和围界组成场地；`Snow_Solvang01/10` 接 `Pavement_Solvang01`、Vlad 铺装。自然山边另用 `IL_SEACLIFFWALL*`，不把海堤当天然崖面。 |
| 冬季滨海住宅街区 | [u036](../assets/uprising/u036-atlas.jpg)、[街区近景](../assets/uprising/u036-detail-courtyard.jpg)、u064/065 | `VL_Building*` 长楼与街沿、灯、树池组成长向街块；`KR_SHRUB03`、`KR_TREE04` 放在绿带，`TH_LAMPPOST04` 随街道组织。已清理的道路/院落与积雪有区别，外围针叶林比市区更疏。 |
| 冬季俄式山湾城镇 | [u072](../assets/uprising/u072-atlas.jpg)、[崖岸](../assets/uprising/u072-detail-cliff.jpg) | `SV_Building05/06/07/08`、`SV_Tree02/03` 等与雪岩岸组合；`IL_SEACLIFFWALL*` 在上沿落点，低处有暗岩与碎石。道路连接桥头和入口；不复制样本的频繁转弯与任务平台。 |
| 河流田园小镇 | [u003](../assets/uprising/u003-atlas.jpg)、[院落近景](../assets/uprising/u003-detail-courtyard.jpg) | `CapeCod_House01`、`CCHouse03`、`HB_Rowhouse01` 配窄院、短径与农田边界；`CC_WOODFENCE01` / `ST_FENCE01` 留入口。主街、农田、河岸步道分开，不在田中散放城市家具。 |
| 温带林地与秋季村路 | [u005](../assets/uprising/u005-atlas.jpg)、[村路](../assets/uprising/u005-detail-courtyard.jpg)、[u016](../assets/uprising/u016-atlas.jpg) | `YP_Cabin`、`SA_HOUSE04` 等少量房屋接短径；树簇、倒木、碎石靠林缘/岩脚。u016 是 MOD 样例；秋色树与草土延续到院边，预览中的空地垫与硬断口不作为目标。 |
| 暖色滨海街区与山城 | [u019](../assets/uprising/u019-atlas.jpg)、[u056](../assets/uprising/u056-atlas.jpg)、[教堂院落](../assets/uprising/u056-detail-courtyard.jpg)、[u063](../assets/uprising/u063-atlas.jpg) | u019/056 的 `HB_House03/04`、`HB_Restaurant_03` 与 `HB_BENCH01`、`HB_LIGHT01`、`HB_TRASH` 随入口/步行节点布置。u056 的 `HB_Church` 是独立院落地标，背后 `HB_CLIFFWALL*` 与草山；u063 用旅馆/公寓、停车与宽步行带，不能把两种街区的所有高频物体混在一起。 |
| 热带滨海度假区 | [u059](../assets/uprising/u059-atlas.jpg)、[滨海近景](../assets/uprising/u059-detail-courtyard.jpg) | `GI_Hotel_02` 等长旅馆面向步行广场；停车区在另一侧，花坛与休息点在步行区。候选 `GE_BENCH`、`SA_TABLE01`、`CS_CHAIR03`、`SA_UMBRELLA11`、`HB_TRASH` 按节点使用；木码头伸入水边，另一岸可保留自然岩坡。 |
| 热带自然岩岛 / 小院 | [u025](../assets/uprising/u025-atlas.jpg)、[海崖](../assets/uprising/u025-detail-cliff.jpg)、[小院](../assets/uprising/u025-detail-courtyard.jpg)、u054/057/058/071/073 | `HA_Building16_02/03` 在 u025 接木质短路与小平台；`HA_SEACLIFFWALL*`、`EI_CLIFFWALL*` 分别检验形态和水线。草顶、暗岩、窄沙带、浅水有层次，珊瑚只用于对应水下位置。房屋集中于可达节点，不平均分到每个小岛。 |
| 干燥峡谷 / 白蓝院落 | [u048](../assets/uprising/u048-atlas.jpg)、[院落](../assets/uprising/u048-detail-courtyard.jpg)、u049/050 | `MY_House_01/03/04`、`MY_Apartment01` 与矮墙、铺面、花盆组织小院；`MY_BENCH`、`MY_TABLE01`、`MY_Umbrella_01` 服务休息节点。土色底纹接少量绿化，`MY_E2_CLIFFWALL*_GRID` 型号与落点另验，不复制宽土路网。 |
| 东亚庭园 / 雪岸园区 | [u018](../assets/uprising/u018-atlas.jpg)、[庭园](../assets/uprising/u018-detail-courtyard.jpg)、[u041](../assets/uprising/u041-atlas.jpg)、[雪岸近景](../assets/uprising/u041-detail-courtyard.jpg) | u018 的 `MJ_BuildingWoods*`、墙、砾石与路径分院，`MJ_NINJASHORTWALL01` 与 `MtFujiStoneBorder*` 用途不同；该图为 MOD 样例。u041 的 `SN_BuildingSnowy05`、日式围界和雪岩岸不属于俄国长楼风格；相邻低地可以是草面，不能全涂成雪。 |
| 熔岩岛 / 热带台地 | [u043](../assets/uprising/u043-atlas.jpg)、[火山近景](../assets/uprising/u043-detail-cliff.jpg)、[u068](../assets/uprising/u068-atlas.jpg)、[台地近景](../assets/uprising/u068-detail-cliff.jpg) | u043 的 `EI_CLIFFWALL*`、`EI_VOLCANO01`、`Cliff_Easter01` 与焦土形成核心，植被更多在外围；u068 的 EI 崖链、绿顶与褐色谷地分层，路径穿行开口。u068 没有被当前目录识别的民房，不能从远景白块推断建筑配方。 |
| 干燥工业海港 | [u066](../assets/uprising/u066-atlas.jpg)、[装卸岸线](../assets/uprising/u066-detail-props.jpg)、u067 | `GI_Warehouse_01`、`OD_Warehouse01`、`ST_Building03/05` 与硬化场地连接；`TH_harbor_crane01` 靠装卸岸，`TH_CARGOCONTAINER01/02/05/06` 在货场成组。主路以少量直段连接，旱草/沙土在外围；不把任务大空场当完整货场。 |
| 人工海上平台 | [u002 海蚀Path](../assets/uprising/u002-atlas.jpg)、[边界近景](../assets/uprising/u002-detail-props.jpg)、u024/039/040/070 | `FI_EDGEPIECE*`、`FI_DECKPROP*` 与 `SteelDeck01/02` 等硬地构成连续平台；道路、栏杆与功能设施分层。平台底部水下纹理不当作上层地面；连续边缘接缝比堆放装饰更重要。 |

名称取自样本回执，放置前从当前挂载资源规范化 ID 并试放。表中型号是候选，不保证 MOD 独有、变体或旧名称在另一个版本存在。同一城市可有街区、港区、住宅外缘等不同子场景，先决定当前地块用途，再选小组物体。

## 局部怎样做得自然

**街区**：先画少转折主街，再决定地块与入口；房屋沿街朝向允许共享，但退距、院宽和服务功能变化。单独安排停车、人行、绿化和服务院落。树池/灯沿路有节奏，垃圾桶放在人使用的节点；桌椅在可停留的铺装区，不能把每栋楼的所有边都摆满。u019 的滨海长带与内部院落、u056 教堂院落与山边住宅、u063 商业停车街块可以分别制作，不复制它们的任务中心对称形状。

**村镇**：先做一个房屋—院界—开口—短径的样板，再做邻院。菜地/农田和杂物靠住宅或仓棚后侧及田边，入口的地表痕迹连到主路。更远的树林从大簇到小簇，别沿村边等距排树。围栏方向服从院界，房屋方向服从可见入口；不能用随机旋转解决重复。

**港口与度假区**：港口是仓库—物流场—装卸水岸的连续关系，起重机不能夹在街角绿地里。度假区是旅馆—步行广场—滨水停留点的连续关系，车位与餐座不要共用一块没有界限的硬地。主道路尽量以直段和少量宽转角完成连接；短支路服务入口，不能为“丰富”加蛇形折线。

先完成一个院落、一个带转角的街段和一段崖岸，取同机位近景。入口畅通、比例合理、材质可读后再扩展。批量复制时改变院落内容和边界长度，保留功能关系与主题；已有地图的玩法/通行不得被美化阻塞。

## 悬崖、地表和细化一起检查

继续使用 [悬崖接缝流程](cliffs-and-transitions.md)，不要把“最近物体”误认成同一崖链。新数据保留实际角度、Z、原型缩放、四向高程探针和邻段局部坐标；这些是观察，不是无缝认证。例如 u056 的 `HB_CLIFFWALL03` 朝向 315°，相邻 `HB_CLIFFWALL06` 在局部约 `(−100,10)`，同向；u068 的 `EI_CLIFFWALL08_GRID` 朝向 225°，邻 `EI_CLIFFWALL01_GRID` 在局部约 `(2.19,89.79)`、转 −90°。转角需要横向错位和相应规格，不能统一每 100 单位放直段。u025 的某海崖带 `z=80.1`，不能把这个偏移复制到所有崖段。

自然岸线以草顶—裸岩—碎石/沙—浅水组织，宽度随坡面与局部地貌改变。火山核心用暗岩和焦土，外围保留绿地；雪岸保留顶面积雪、暗岩与脏雪/裸土；人工平台保持硬地与边缘构件的几何关系。模型原点、可见正面和真实边界仍需当前模型查询与低角度截图。

按 [材质与边缘细化](terrain-materials-and-edges.md) 先刷有用途的大区域，再做局部边缘。已核对的混合候选包括 u056 `Grass_Heidelberg02` ↔ `Gravel_Heidelberg01`、`Pavement_Heidel01` ↔ `Pavement_Heidelberg10`；u048 `Dirt_CapeCod06` ↔ `Dirt_Mykonos02`；u068 `Dirt_Easter05` ↔ `Grass_Easter01`；u072 `Snow_Solvang01` ↔ `Snow_Solvang08`。配对表示样本引用，不保证任意位置都适合混合；原始全图配对还含海床，不能用高频配对决定城市铺面。

草土/沙土边界在指定小范围试用自动向外；入口、路沿和三材质交点用单边细化指定方向。铺装院界保留硬边或窄边饰，不把城市几何边界全部羽化。原图中已经成熟的双层混合先查询，禁止清空整图再重做。7 张样例有未解析的底纹索引，共 3,295 个 step=2 采样格；这些按未知报告、从候选排除，不能替换成“最像的贴图”后声称还原。

## 数据用来核对，不直接克隆

`observedHouseNeighborhoods` 的局部坐标相对建筑原点与原朝向。例如 u048 的 `MY_BENCH` 在 `MY_Apartment01` 的局部约 `(50.17,−38)`、相对角 −90°；u063 的两盏 `ST_LIGHT01` 在相近局部 X（约 −158）、不同 Y（68.90 与 −80.80），表现为沿同一侧的节奏。它们说明可查位置关系，不证明局部 +X 是门前，也不保证换建筑后可以照抄。

区域表的底纹数量包含水下和被模型遮挡的格；`dryBaseMaterials` 按水域与高程滤掉淹没采样格，仍可能含隐藏底座。道路候选可能是人行道、标线、砖边饰或木径，`nearestRoadOrBorder` 不能证明入口已接主车道。名字推断的装饰角色只用于搜索；看近景确认用途。

当前诊断中的水下反射、纯白面、孤立底座、断开的道路、崖面尖柱和过密任务树列均需另外复核，不能学成美术规范。最后使用任务自己的总体图和局部图，检查“路能到门、院界有开口、崖脚接地、材质有原因、装饰有用途、保留必要留白”，再保存重开与游戏内验收。
