# 美洲温带与暖季：山地国家公园、南加州、纽约

## 证据范围与分类

原版战役来源 m073 Mount Rushmore、m075 Los Angeles、m078 New York 的全部分区图册已看，另看三图院落及 m078 公园近景。分成不同环境，不把美洲视为一套物体。m073 的冷色光照与岩石不是冬雪；m075 为绿地/暖季海岸城市；m078 为有秋色树的温带滨水城市，不能只凭橙树断言历史月份。u034 是秋色湖区村镇補充，u017 为温带湖岸；u016 名称明确 MOD 限定，独立标注，不能把它的全部对象当作原版可用。

| 案例 | 图像 | 学习点 |
|---|---|---|
| m073 | [全分区](../../assets/campaign/m073-atlas.jpg)、[游客服务点](../../assets/campaign/m073-detail-courtyard.jpg) | 山地多层悬崖、观景路线、游客服务点停车场、林地与岩石留白 |
| m075 | [全分区](../../assets/campaign/m075-atlas.jpg)、[住宅近景](../../assets/campaign/m075-detail-courtyard.jpg) | 独立宅院、商业/工业街块、较规整道路、海岸与公园，机场专用区 |
| m078 | [全分区](../../assets/campaign/m078-atlas.jpg)、[城区](../../assets/campaign/m078-detail-courtyard.jpg)、[滨水公园](../../assets/campaign/m078-detail-props.jpg) | 长条街块、共享公寓族、滨水工程、工业码头与城市公园分区 |
| u034 / u017 | [秋色湖区](../../assets/uprising/u034-atlas.jpg)、[温带湖岸](../../assets/uprising/u017-atlas.jpg) | 村路、独立房屋、湖岸植被，不迁移挑战经济布局 |
| u016 | [MOD 对照](../../assets/uprising/u016-atlas.jpg) | 河流、桥、村镇院落，作为构图对照；资产须重新验证当前 MOD |

## 山地 → 游客区、林地与观景点（m073）

m073 中主地形是连续台地/峡谷层次，路网沿地形服务观景点；住宅很少，正式服务建筑与停车场集中为节点。自然地表、步道、岩墙与少数松树构成主体，不以房屋填满山顶。军用山体雕像、激光基地等是剧情设施，默认美化不能复制。

| 功能组 | 对象候选 | 用法 | 不适合 |
|---|---|---|---|
| 游客小屋/服务 | `YP_Cabin`、`YP_RStation`、`HV_Shop01` | 原尺寸节点接步行/车辆路；不同型号必须先看实际功能外观。RStation 名称不能凭字母猜成铁路车站 | 无入口山坡、沿全图等距撒服务房 |
| 森林家具 | `YP_Picnic01`、`SV_Bench01`、`CS_Trashcan`、`HB_Trash` | 野餐区临小步道，垃圾点离树根与溪岸有距离；景观座椅朝可见风景 | 山壁上/车道上、成排城市花箱硬套野林 |
| 木围界 | `CC_WoodFence01`、`CC_WoodFence02` | 服务地块、栈道与游客保护边，按端点串接；保留出入口 | 一律围满所有山林、挡住观景平台到达路线 |
| 树与地被 | `MR_Tree01`、`MR_Tree04`、`MR_Tree05`、`MR_Tree06`、`YP_tree02`、`YP_Fern01`、`CC_Bush01`、`CC_Bush02` | 针/阔叶主族先看模型；林缘密度渐变，坡脚、石隙局部地被；路旁留通视 | 所有树全图等概率平均种、坡面漂浮树、观景目标被密林遮死 |
| 保护边饰 | `MR_PathTrim01` 至 `MR_PathTrim04` | 观景步道/硬台地边缘候选，确认坡向、端部和长度后使用 | 当完整道路、用边饰掩盖断裂地形 |

悬崖不是随便摆不同岩石：先定每级台地边界，挑同族高度/材质吻合的一组墙面，正面对外侧低地，端部相接；台地顶部用相容岩地/草地收边，坡脚添少数岩块与地被。道路过台地需要完整坡道或桥，不能在崖顶画路后让路在崖边中断。不同墙段精确角度与长度需看模型，不能从前缀推定。

地表候选 m073：`Grass_MtRush07`、`Grass_MtRush08`、`Grass_MtRush10`、`Grass_MtRush12`、`Grass_MtRush13`，`Grass_Yucatan02`、`Grass_Yucatan04`、`Dirt_Yucatan06`、`Rock_Yucatan01`。主草地与主岩地按地形分成有意义的块；踩踏土道连实际节点，不能把裸地纹理当随机脏点。道路小样见 [道路制作](../road-construction.md)：[u005林地湖岸](../../assets/roads/u005-focus-crop.jpg) 长主路/支路用MtRushmoreRoad01等两点Road，地域与确切季节未独立确认；不强制套城市StreetSegment。道路候选 `MtRushmoreRoad02`、`YucatanDirtRoad01`、`YucatanFootpath01` 区分车辆主路、土路和步行径。停车标线资源本身不提供停车硬面。

## 城市 → 独立住宅、商业街与服务院（m075）

车行面与标线先分系统，见 [m075商业街块](../../assets/roads/m075-focus-crop.jpg) 和 [m078纽约港区](../../assets/roads/m078-focus-crop.jpg)：纽约实际有ST普通街段，不能发明NY_STREETSEGMENT；ParkingLines/WhiteLine等Road只提供细部。HB31实测约21.187×64.670、前进轴未确认，不套成100长直段。

m075 的红屋顶独立住宅前侧有到达道路、围界或草地，背侧有生活空地；商业街块与港口/工作场使用硬地。大型公园集中为完整景观用地。图中机场及任务工作区属于专用功能，不从它们的空地率推导城区普遍稀疏。

| 功能组 | 具体候选 | 放置与朝向 |
|---|---|---|
| 独立民房 | `SA_House01`、`SA_House02`、`SA_House03`、`SA_House04` 及目录中的相应 `_02`/`_03`/`_04` 变体 | 保持原尺寸；按真实正面与门组织街排，有限型号变化；不通过缩放改变街块比例 |
| 商业 | `SA_Cafe01`、`SA_Cafe01_02`、`SA_Cafe01_03`、`SA_Cafe01_04`、`SA_Store02`、`SA_Store03`、`SA_TireShop` | 咖啡与商店有前场，轮胎店门前硬地可停车；先预览变体差异，不能假设变体只是颜色 |
| 围界 | `SA_Fence02`、`SA_Fence05`、`SA_Fence09`；其他型号查目录 | 分开院前/院后、住户/工业；转角有接缝，前门/车道不封闭 |
| 城市家具 | `SA_Bench01`、`SA_Table01`、`SA_Table02`、`SA_Table03`、`SA_Table04`、`SA_Trash01` | 座椅朝步道/庭园，桌靠餐饮节点，垃圾靠服务边；不是城市任意空地的填充物 |
| 交通停泊 | `SM_Auto01`、`SM_Auto02`、`SM_Auto03`、`SM_Auto04`、`SM_Auto05` | 停在真实车位/路侧，车头顺车位方向，留下驶出空隙 |
| 货运 | `SA_Truck01`、`SA_Truck02`、`SA_Truck03`、`SA_Truck05`、`SA_Truck06`、`OD_Warehouse01` | 与仓库装卸口、货场或商业服务后院形成关系；货车不塞入住宅门庭 |
| 绿化 | `SA_Palm01`、`SA_Palm02`、`SA_Planter02`、`SA_Fern01`、`HB_Tree02`/`03`/`04` 等 | 街道主族整齐，庭院有局部变化，公园与河岸自然分层；棕榈与阔叶数量随地区、用地角色而定 |

`SA_EALABuilding`、`SA_EALABase`、`SA_FakeBillboardDefensiveTower_01` 等是特殊场景或军事伪装设施，不能因目录把它们归到 buildings 就加入默认民房候选。消防/医院/车库要明确需求与游戏功能；医院 `HospitalTechStructure` 在 m075 可观测，但需要留救护前场，不能复制原任务归属。

地表按功能：硬地候选 `Pavement_Heidel09`、`Pavement_Geneva01`、`Pavement_CapeCod01`；草地 `Grass_Heidelberg01`、`Grass_Yucatan02`、`Grass_Yucatan05`、`Grass_NewYork01`。城市路缘候选 `SantaMonicaSidewalk02`、`SantaMonicaSidewalk03`、`StalingradBricksTrim01`、`HawaiiGrassStrip01`/`02`/`03`、`HavanaSidewalk03`/`04`。这些名称含异地，是原版共享素材；以外观、功能、比例匹配，而不是按名字禁用。

## 滨水城市 → 街块、公园、工业码头（m078）

纽约图使用通用公寓与纽约专用地标混合：住宅主族可用 `ST_Building01`、`ST_Building02`、`ST_Building04`。`NY_SkyScraper_01` 至 `_04`、`NY_Structure_01`、`_03` 至 `_10` 是不同体量的观测候选，每种使用前需看原生底板与入口，不能把所有高楼随便填进窄街。`NY_Liberty`、`NY_NYStockExchange` 等只用于对应主题地标；FortBradley 和军事设施不列默认城市家具。

观察近景：街块前场有少量树/种植带，车路外围连续；滨水公园有草地、曲线步道、密疏有别的树林和成片花坛，树下小路连上外围步道；工业岸线是连续硬地、货运车辆、码头指状边界。三种用地不同，不能把吊机、货箱撒到公园里。

| 功能 | 对象候选 | 空间逻辑 |
|---|---|---|
| 工程围界 | `NY_SeaWallPiece01`、`NY_SeaWallPiece02`、`NY_SeaWallPiece03`、`NY_SeaWallPiece04`、`NY_Wall01`、`NY_Wall05`、`NY_CircleWall02` | 岸边栏和墙端连续；阶梯与转角确认类型；不能把直墙强缩放转弯 |
| 码头 | `NY_Pier01`、`NY_Pier02`、`NY_Pier03`、`NY_PierRoof`、`OD_PortCrane01` | 指状泊位/棚的原生尺寸决定货船空间；吊臂对水/工作区；车行与步行通道清楚 |
| 公园 | `HB_Bench01`、`ST_Plant01` 至 `ST_Plant11` 中相容型号、`NY_Bush01`、`HB_Tree02` 等 | 一块草坪、一块成层树林、少数花坛，椅子朝路径/水景；不把全部植物等概率混用 |
| 货场交通 | `SA_Truck03`、`SA_Truck05`、`SA_Truck06`、`SA_Trash01` | 货车在装卸边，垃圾在服务后侧；不要占消防/行车路径 |
| 观景类 | `NY_Binoculars` 若当前目录模型确认 | 仅在确有观景朝向与安全步道的平台；不能因为名字好听当庭院装饰 |

地表候选：`Pavement_NewYork01`、`Pavement_NewYork03`、`Pavement_CapeCod01`、`Pavement_Yucatan01`、`Grass_NewYork01`。`NewYorkSidewalk02`/`04`、`TokyoHarborRoad02`、共享过街/停车标线分别用于步行、车行与交通画线。截图中零星白块、锯齿或未知模型不可学习为装饰特色。

## 统一完成检查

美洲三个环境选择不同主色/体量/街具；先确定国家公园、居住区、商业区、工作港哪一种，再读对应段。城市长街优先 45° 奇数倍世界方向；河岸和山路允许服务真实地形的平缓转折。转角不能被反复短节点挤成锯齿；边缘细化先做短样板，硬地之间用路缘明确边界，自然地表局部过渡。所有对象先验证目录存在与模型外观，完整默认比例、门向、通路、水面关系与接缝检查后才扩展。
