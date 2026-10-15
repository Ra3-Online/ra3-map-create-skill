# 地域风格、民房与周边搭配

v5 新增 [74 图全区图册](../assets/uprising/gallery.html) 与 [起义美化规则](uprising-beautification.md)：民房候选按街区/村镇/港口/庭园子场景选用，先制作入口、院界和短径的关系，再选功能装饰。案例数据保留建筑局部坐标和相对角度，不能直接当无碰撞模板；任务出生点、军事基地和资源配置全部不作配方。

冬季新增哈尔科夫/明斯克与城市、村镇对照，见 [冬季俄国专项](winter-russia-layouts.md)。悬崖型号与接缝、地表用途与边缘、路边和庭院家具分别见 [悬崖](cliffs-and-transitions.md)、[材质细化](terrain-materials-and-edges.md)、[装饰构图](decor-and-composition.md)。新 [美化图册](../assets/beautification/gallery.html) 的模型加载覆盖比早期总览更充分；旧图的缺模型/地垫现象不作为布局或美术目标。

先打开 [风格图册](../assets/styles/gallery.html)，按主题选择一个总览和局部。新一轮分析覆盖 80 张地图，包含「只学美化」44 张；图册新增 10 个案例的 20 张实际 3D 图。数据见 [全量学习索引](learning-index.json) 和 [风格素材候选](style-palettes.json)。这些是观察与候选，不是固定场景模板，也不代表所有模型在当前资源版本中都正确显示。

## 候选按建筑语言选择

| 风格 / 案例 | 民房候选 | 周边候选与组织 | 道路候选与地形关系 |
|---|---|---|---|
| 雪地俄式村镇 / m049 | `VL_Building01/02/03/05` | `SV_Fence01`、`AP_FENCE01`；`SV_Tree03`、`SV_TREE16`、`IL_Tree01`分簇；院落与路边留空 | `KremlinSnowyTracks01`作雪地痕迹，`NorthernRussiaSidewalk01` / `StPetersburgSidewalk01`作街沿；城镇平地与外部雪山分层 |
| 东欧滨海城市 / m057 | `OD_APARTMENTS01`、`ST_Building01/02` | `OD_SeaWall01`沿海；台阶边沿、花坛、`ST_PLANT02`组成独立空间 | `SantaMonicaSidewalk02`、`StPetersburgSidewalk01`、道路标线分层使用；桥头与海墙之间给接头留空 |
| 日式传统庭园 / m068 | `MJ_GUARDHOUSE01`及当前目录中的宫殿主体 | `MJ_PalaceWall01`是围墙而非民房；`MJ_GRASS01`、`GC_Bush01`、`MJ_STONEFENCE01`分隔庭院与路径 | `MtFujiStoneBorder01/02/03`、`MtFujiBuildingTrim01`是边饰，`HawaiiDirtRoad01`可作外围小径；庭园台阶、山坡与宽平台相接 |
| 地中海滨海度假区 / m070 | `CA_Hotel_01/04`、`GI_Hotel_01` | `CS_Palm02`、`CS_BUSH01`、花坛、海墙；建筑间留步行广场 | `CannesSidewalk01/02`沿街与海岸；道路与海滨步道分开。任务图里的沙袋/军用围栏只在有相应场景意图时采用 |
| 欧洲旧城与山谷 / m071 | `HB_House02/03/04`、`HB_Restaurant_03` | `HB_Tree03`、`HB_GRASS02`、低灌木、围墙；院落顺街区，坡外用树林 | `HeidelbergBricks02`、`HeidelbergBricksTrim01`；较宽连接路进谷，支路止于院落，少量转折顺高地边界 |
| 热带加勒比城镇 / m074 | `HV_Apartment01`、`HV_HOTEL01/08`、`HV_Shop03` | `HV_Tree01`、`HV_Shrub01`、`YU_Bush01/05`；棕榈与开敞院落，珊瑚只用于相应水下场景 | `HavanaSidewalk01/03`、停车线，外围 `YucatanDirtRoad01` / `YucatanFootpath01`；平岛也可由海湾、街区、登陆点组织层次 |
| 现代美式街区 / m075 | `SA_STORE02/03`、`SA_House03_02`、`SA_Cafe01_04` | `SA_PALM02`、`SA_FENCE02/05`、草带；商铺沿街，住宅有退距，停车区单独规划 | `HavanaWhiteLine01`是标线，`HavanaSidewalk03/04`是街沿；不能把二者当完整车行路面 |
| 欧式城市广场 / m077 | `GE_TOWNHOUSE01`、`ST_Building02` | `GE_LIGHT01`、`GE_FENCE01`、`ST_PLANT01/09`、`CC_BUSH02`；树池、广场、灯柱组成节奏 | `GenevaBricks01`与街沿/标线组合；先规划主街和广场，再画边饰，不能把边饰统计当作主路数量 |
| 爱琴海白蓝小镇 / m079 | `MY_House_01`、`MY_Apartment01`、`MY_Restaurant_03/04` | `MY_WALL01`、`MY_PLANTER01`、`MY_PLANT05`、棕榈；矮墙围院，绿地嵌入街角，房屋朝道路 | `MykonosSidewalk01/02`、`MykonosRoadTrim01`；少数直主街加短支路，郊外才用土径 |
| 火山与自然岛 / m080 | 当前样本没有识别到民房，不强塞城镇建筑 | `EI_Grass01`、`EI_GRASS02`、`IL_BUSH05`、`HA_PLANT04/09`；岩壁顶部与底部有不同密度的植物簇 | `EasterIslandRoad01/02`沿地形开口；基地平地、分隔山脊、火山高地和海湾共同组织空间 |

候选名称来自样本和当前目录，大小写应按目录回执规范化。先筛选当前游戏/MOD 的资源，再在试验区域放 1 个并取图；未显示、只剩地垫或无模型时换已验证变体。图册中的绿色点、边框和标记属于地编；不能作为游戏装饰。m057、m068、m070、m074、m075、m077 的当前预览有部分建筑缺失，主要用来学习布局与道路，不能把空地垫学成正确建筑效果。m079 可实际观察白蓝建筑与院落组合。

## 民房不是独立撒点

每个小场景先定入口朝向与通路，再定房屋落点、退距和院落。把房屋—前庭—门/围栏开口—人行路做成可读的一组。庭院内部用一两个树或灌木簇、花坛/桌椅等符合主题的小物件；后侧可用围墙、杂物或植被，沿主路用灯柱或树池形成节奏。按可见模型与真实占地核查退距，不能用“中心相距够远”代替碰撞检查。

先做 1–3 栋的局部样板，看入口是否接路、围栏是否堵门、植物是否穿墙、比例是否正确，再扩成小街区。房屋可共享街道朝向并保留不同院宽、植被和空地；不要每栋都旋转随机角，也不要重复完全相同的院落。自然岛仅有少量民房时，让建筑群贴邻主要通路或地标，避免均匀散到各个矿位周围。

数据脚本的“附近装饰”采用占地半径加 120 世界单位的观察圈，只统计共现，不证明它们属于同一院落或可以互相重叠。高频物体可能来自任务军事设施、海墙、道路物件或水下珊瑚，必须结合局部图判断用途。只学美化案例的经济、玩家和脚本不转移到遭遇战设计。
