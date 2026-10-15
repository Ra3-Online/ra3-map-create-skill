# 西欧与中欧暖季：海滨、河城、旧城与运河城

## 读图范围

已实际查看原版战役来源 m069 Brighton Beach、m070 Cannes、m071 Heidelberg、m072 Gibraltar、m076 Amsterdam、m077 Geneva 的全部分区图册，并放大每图的院落近景。季节按绿色植被与无雪地面称为“暖季”，不是从冷色滤镜推定冬季。地图素材来自训练目录中的战役副本；这里仅学习美化的功能关系，不能复制任务基地、经济或剧情设施。

| 风格与案例 | 图像 | 已观察的主要区别 |
|---|---|---|
| 英国海滨，m069 | [分区](../../assets/campaign/m069-atlas.jpg)、[住宅近景](../../assets/campaign/m069-detail-courtyard.jpg) | 独立住宅、木围界、前后庭院；度假大楼集中沿海，海滨步道与木栈桥 |
| 法国海滨，m070 | [分区](../../assets/campaign/m070-atlas.jpg)、[公共前场](../../assets/campaign/m070-detail-courtyard.jpg) | 大型旅馆、商业露台、宽铺装、棕榈种植带与沙滩，离岸工业岛另作功能分区 |
| 中欧河谷旧城，m071 | [分区](../../assets/campaign/m071-atlas.jpg)、[教堂与街区](../../assets/campaign/m071-detail-courtyard.jpg) | 红屋顶民房、餐馆、菜园、教堂绿地；街路因山脚和河岸少量弯曲 |
| 伊比利亚滨海港城，m072 | [分区](../../assets/campaign/m072-atlas.jpg)、[滨水近景](../../assets/campaign/m072-detail-courtyard.jpg) | 公寓与旅馆、岸边连续步道、游艇泊位、岩山与机场/货运功能分离 |
| 荷兰运河城，m076 | [分区](../../assets/campaign/m076-atlas.jpg)、[站前与商业院落](../../assets/campaign/m076-detail-courtyard.jpg) | 深窄排屋、运河工程岸线、窄长街块、咖啡/餐饮前场与停车岛 |
| 瑞士城市，m077 | [分区](../../assets/campaign/m077-atlas.jpg)、[公共机构与花坛](../../assets/campaign/m077-detail-courtyard.jpg) | 正式公共地块、雕塑、几何园林、围界与岸线，住宅较有秩序 |

u019/u020、u056 是暖季滨海小城补充；u063 是暖季滨海度假城补充；u052/u053 是使用 Romania/Gypsy 资产、冷色光照的温带沿岸村镇补充，国家和具体季节不能仅凭资产前缀确定。起义合集是社区整理的官方来源挑战场景，不冒称每份文件都保持 EA 原文件。上述补充图册已看，未逐个验证所有模型入口。

## 城市 → 居住街块 → 四种可区分的模板

### 海滨独立住宅（m069）

图中房屋占独立地块，车道接街，围栏分前后院，花木围边，车库与住宅相邻。海滨的大楼、度假服务建筑集中在海沿道路；不能把所有房屋都变成酒店。

| 候选组 | 精确对象候选 | 功能与邻接 | 不适合 |
|---|---|---|---|
| 独立住宅 | `CapeCod_House01b`、`CCHouse02`、`CCHouse02d`、`CCHouse03b`、`CCHouse03d`、`GE_TownHouse01` | 原尺寸放在完整地块；门前通街，后院留生活活动区；型号外观和入口先预览 | 门对围栏、以住宅底板盖山坡、每栋都同一后院装饰 |
| 住宅车库 | `CCGara01b`、`CCGara04` | m069 有实际观测；车库门对可驶入的车道，不把车库当第二座民房 | 入口朝花圃、车库缩放塞在两房间、车道与主路断开 |
| 旅馆及沿海商业 | `BB_Hotel_01_01`、`BB_Hotel_01_02`、`BB_Hotel_02`、`BB_Restaurant_01`、`GI_Hotel_01` | 临海街、公共前场/停车，桌椅与商业活动相邻 | 普通居民小院平均放巨旅馆；混入无语义的军事堡垒 |
| 庭院界 | `CC_WhiteFence01`、`CC_WoodFence01`、`CC_WoodFence02`、`BB_Fence01` | 同一街排可用一族，留前门与车道口；低围栏强调产权与院落 | 完全封闭可进入地块、围栏把房门堵住 |
| 城市家具 | `BB_Bench`、`HB_Trash`、`HB_Table01`、`HB_Table02` | 座椅朝景观/路径，垃圾桶靠步行边，餐桌靠商业入口 | 沙滩家具搬进修车出入口、垃圾桶放景观中轴 |

### 中欧红屋顶旧城（m071）

这里的住宅更紧凑，但保留院落与连通步道；菜园是围墙内完整小用地，教堂独立绿地有步行入口。路缘随地形转折；不是每栋小屋都制造一个紧曲线。

| 功能 | 对象候选 | 使用方式 |
|---|---|---|
| 民房主族 | `HB_House01`、`HB_House02`、`HB_House03`、`HB_House04`、`HB_Rowhouse01` | 以 2–3 个相容型号做一个街排；朝向真实街线；长排屋避免孤立放在野地 |
| 餐饮 | `HB_Restaurant01`、`HB_Restaurant_03`、`HB_Restaurant_04`；`HB_Table01`、`HB_Table02`、`HB_Table03` | 前场铺装与门相连，桌椅面向可进入区域；植被隔开旁边车位 |
| 教堂 | `HB_Church` | 独立绿地、入口小路、围界低矮有开口；不全周贴房遮轮廓 |
| 围界 | `HB_Fence04`、`HB_Fence05`、`HB_Fence07`、`HB_Wall02`、`HB_Wall08`、`HB_Wall09` 等 | 看实际高度/端部再选；用房后、菜园、坡上院落边界；接缝连续但不拉穿门 |
| 灯与座椅 | `HB_Light01`、`HB_Bench01` | 沿行人路线和公共绿地边缘，不进车道；座椅保留朝向与背侧空间 |
| 绿化 | `HB_Tree02`、`HB_Tree03`、`HB_Tree04`、`HB_Tree05`、`HB_Tree08`、`HB_Tree09`、`HB_Grass01`、`HB_Grass02` | 行道树秩序、院内点景、丘陵林缘三种密度；不同角色不是同一随机刷参数 |

古堡/酿酒厂只在对应主题使用：`HB_CastleBldg_01`、`HB_CastleBldg_02`、`HB_Brewery01` 等观测候选不能当普通住宅。立在高地的公共主景要有真实道路/步道到达，不把阶梯当车辆坡道。

### 运河城住宅与服务街（m076）

主族 `AM_Apartments_01`、`AM_RowHouse01`，服务 `AM_Cafe_01`；有 `HB_Restaurant01` 和 `HB_Restaurant_04` 的共享商业外观。排屋沿街线，街块深度有限；后院/侧巷不能变成不可进入的夹缝。每个型号原生外形先看，不能将高楼缩窄造窄排屋。

围界 `AM_Wall01`、`AM_Wall02`、`AM_WallPiece01` 至 `AM_WallPiece07` 是候选系列，**每段端部形状未全部认证**。选一段确认与转角匹配后再串联，不混用不同高程的墙段。沿河岸工程路线连续，少量开口连接码头与桥；河边不放无支撑的街块。

`AM_Bench`、`AM_Table01`、`AM_Planter01`、`AM_Plants01` 至 `AM_Plants04`、`AM_Light01`/`02`/`03` 构成商业前场和步道配套。咖啡座靠建筑入口，行道树居于步行岛；屋后杂物不等于屋前营业区。`AM_AdultShop` 是特定商业内容，只有用户明确接受该街区用途才用，不能当泛用住宅。Futuretech、VIPBunker 等剧情设施排除默认美化。

### 公共机构与正式庭园（m077）

普通住宅 `GE_TownHouse01`、`GE_Apartment01` 可与 `ST_Building02` 等相容公寓组合。`GE_Museum_01`、`GE_Theater_01`、`GE_Conservatory_01`、`GE_SwissBank` 是不同功能节点，不要把公共建筑全堆在同一地块。`GE_UNHQ_01` 等大型地标仅主题匹配、尺度与交通允许时使用。

m077 的公共近景显示：一块建筑前场、另一块花坛庭园、两侧街道各自清楚；小雕塑只在庭园内承担焦点。候选 `GE_Statue01`、`GE_GlobeStatue01`、`GE_Planter01`、`GE_Planter02`、`GE_Bench`、`GE_Fence01`、`GE_Fence02`、`GE_Light01`、`GE_Light02`、`GE_Light03`。做正式院落时绿化可成对/成行，公园边界以路径组织；不把正式几何花坛平均覆盖所有野坡。

医院、消防、车库等配套先看 [俄国暖季公共设施规则](western-russia-temperate.md) 与 [冬季设施模板](western-russia-winter.md)。可跨地域共享的 `HospitalTechStructure`、`GarageTechStructure` 有游戏功能；只有需求允许才配属，不自动带入占领与任务逻辑。

## 滨海 → 度假步道与旅馆（m070/m072）

| 功能 | Cannes 候选 | Gibraltar 候选 | 放置关系 |
|---|---|---|---|
| 旅馆/公寓 | `CA_Hotel_01`、`CA_Hotel_02`、`CA_Hotel_03`、`CA_Hotel_04` | `GI_Apartment_01`、`GI_Apartment_02`、`GI_Apartment_03`、`GI_Apartment_04`、`GI_Hotel_01`、`GI_Hotel_02` | 大楼集中在城市硬地上，停车/前场在可到达街侧，海沿一侧可以是步道和庭园 |
| 植被 | `CS_Palm01`、`CS_Palm02`、`CS_Palm03`、`CS_Bush01`–`CS_Bush04`、`CS_Fern01`/`02` | 同类棕榈、`GI_BushsCluster01` | 棕榈按步道与种植带角色成行；灌木在种植区，不覆盖停车线和楼门 |
| 家具 | `CS_Bench01`、`CS_Chair01`/`02`/`03`、`CS_Trashcan`、`CS_StreetLight` | `GE_Bench`、`YU_WhiteBench01`、`MY_Table02` | 面向活动区/海景；步行线留空。沙滩遮阳伞和城市路灯不在同一网格密度平均撒 |
| 海岸工程 | `CS_BeachWall`、`CS_BeachWallRamp`、`CS_BeachWallStair`、`GI_SeaWallPiece1` | `GI_SeaWallBanaster`、`GI_SeaWallPiece1`、`GI_Pier1`、`GI_Pier2` | 海滩、人工堤岸与游艇泊位各有边界。Ramp/Stair 要接真实高差，不能平地悬摆 |
| 灯与泊位 | — | `GI_LightPlant01`/`02`/`03`、`GI_Lighthouse_01`、`GI_Warehouse_01` | 灯照步道/码头；灯塔服务航道；仓庫有装卸面，不搬到住宅后院 |

地图海面、码头与停船要形成关系。`GI_Boat01` 等名称在 Core 观测中存在，但全量目录分组可能归入 other-props；先确认当前目录有模型并实看浮线，不能仅因名称当作通用船。轮船/游艇平行泊位，留航道，不撞堤岸。港区箱堆、起重机和工作空地与度假沙滩分开。

## 地表 → 功能层 → 交界

| 风格 | 观测地表候选 | 功能分配 |
|---|---|---|
| Brighton | `BB_Pavement01`、`Pave_Golf03`、`Grass_Hawaii01`、`Grass_Hawaii02`、`Grass_Heidelberg01` | 城市铺装、住宅草地、海滩区域区分；材质族按可见色与尺度选，不凭地名禁止跨用 |
| Cannes | `Pave_Cannes01`、`Pavement_Amsterdam03`、`Pavement_Havana03`、`Sand_Cannes01` | 酒店/步道硬地连续，沙滩宽窄随岸线，种植带封闭完整 |
| Heidelberg | `Pavement_Heidelberg10`、`Pavement_Heidel01`、`Grass_Heidelberg02`、`Grass_Heidelberg06`、`Grass_Heidelberg07` | 城市砖地、院内草地、丘陵自然地各有主题；菜园用真实功能的地面组，不用市政砖全铺野山 |
| Amsterdam | `Pavement_Amsterdam03`、`Pavement_Heidel04`、`Grass_Geneva01`、`Grass_Geneva05` | 运河堤岸与街块硬地连续，院内绿化有边界；不要学当前诊断图中的异常水面分块 |
| Geneva | `Pavement_Geneva01`、`Pavement_Geneva02`、`Pavement_Geneva04`、`Pavement_Geneva05`、`Grass_Geneva01`、`Grass_Geneva02`、`Grass_Geneva03`、`Grass_Geneva05` | 正式前场与草地花坛分别成面；同一公共地块少数相容材质，边线对齐路径 |

所有名称需对照当前 terrain 目录；统计包含海床/模型底板，不能用高频值推定“城市必须用该纹理”。自然交界可以局部纹理细化；车路、人行道、院落硬铺装用清楚路缘/围界，不能一律羽化。45° 边线的锯齿可能来自地表数据或当前渲染，先用小段近景测试，失败就修正局部数据/换边界形式，不全图随机混第二种材质遮盖。

街道小样读 [道路制作](../road-construction.md)：[m071桥头](../../assets/roads/m071-focus-crop.jpg) 混用HV/HB街段，HB_Bridge_02为16/32 BridgeBuilder；[m076运河街块](../../assets/roads/m076-focus-crop.jpg) 用AM普通Object。AM05/32的长段方向是本地Y，AM06/33的邻接候选沿本地X，不能按前缀或最长bbox轴统一。m076的366个AM没有Z=1，主要0/0.05等；Invisible底材没有在本集合观察到，不设为默认。

道路资源按功能选：`CannesSidewalk01`/`02`、`HeidelbergBricks02`、`HeidelbergBricksTrim01`、`AmsterdamRoad01`、`AmsterdamBricks01`/`02`/`03`、`GenevaBricks01`/`02` 是不同类别。ParkingLines、Crosswalk、WhiteLine、RoadMarkings 是标线候选，不能作为整条路面。路口处先保证中心通行面连续，再处理人行岛、过街线和信号设施；不在每一条步道交叉口都摆交通闸。

## 布局与自检

城市主骨架优先少数长轴，内部街块和功能区顺势组织。河岸/山脚允许大半径转折；港城主街和桥头尽量直。用户要求奇数倍 45° 时，以世界道路轴 45°、135°、225°、315° 为主；房屋正面相对道路核验，物体本地前向不一。教堂、医院、码头和酒店不是可以等概率替换的“民房变体”。

每个街块检查：房门与车库门通达；围栏开口存在；商业家具属于商业前场；灯照服务面；花坛不盖停车位；高地有路/阶梯到达；堤岸工程接缝连续；住宅原生比例；同一街排视觉统一但不全图同模板。先做两个完整相邻街块，再批量扩展关系，勿复制原关卡坐标与剧情设施。
