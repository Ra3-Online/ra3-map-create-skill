# 地区、季节与场景索引

从左到右选择：**地区与季节 → 城市/乡村/港口/自然/特殊平台 → 具体设施**。先读需求流程，选择本次相关的风格页和 1–3 张样板图，不把整个资源库一次塞进上下文。用户指定的风格、密度、朝向与禁令优先。

## 风格路线

| 一级：地区＋季节/气氛 | 二级：场景 | 三级：要读的细节 | 参考 |
|---|---|---|---|
| 俄国冬季 | 城区、村镇、铁路、滨水工业港 | 住宅院落、纪念广场、医院、车库、公园、围墙门口、冬季绿化 | [俄国冬季](styles/western-russia-winter.md)；[哈尔科夫与明斯克补充](winter-russia-layouts.md) |
| 俄国温带/非雪季 | 城市、工业带、河谷港口 | 长街块、站前、货场、层级城市、码头与装卸关系 | [俄国温带](styles/western-russia-temperate.md)；斯大林格勒 m056 只作为城市结构参考，冬季外观另选 |
| 西欧、美洲温带/暖季 | 城市、乡镇、公园、海港 | 住宅立面、正式绿地、城市场所、道路家具与港区 | [西欧](styles/western-europe-summer.md)、[美洲](styles/western-americas-temperate.md) |
| 地中海暖季 | 海岸城市、旅游与商业街区 | 石铺装、滨海路、广场、度假设施、步行区与停车后勤 | [地中海](styles/western-mediterranean-summer.md) |
| 尤卡坦夏季/热带 | 村镇、岛镇、酒店、自然林缘 | 高脚屋、木围界、步行路径、生活院落、草土沙过渡 | [尤卡坦夏季](styles/tropical-yucatan-summer.md) |
| 热带岛屿与火山 | 岛岸、岩坡、熔岩区、自然港湾 | 岸线、岩壁接缝、沙带、火山特效及地域植物 | [热带岛屿与火山](styles/tropical-islands-and-volcanoes.md) |
| 日本温带庭园/雪季 | 城镇、庭园、雪岛、湖岸 | 园林路径、围界与入口；雪岛保留季节与湖区区别 | [日本庭园与雪季](styles/japan-gardens-and-snow.md) |
| 日本港口城市/夜景 | 密集都市、医院、体育与港区 | 临街关系、停车、绿带、码头、夜景灯与霓虹 | [日本港口城市](styles/japan-port-city.md) |
| 暖季海岸/干燥工业港 | 海滨度假、物流港、干旱岸线 | 酒店前后场、海滨家具、仓储硬地、道路运输 | [海岸城市与工业港](styles/coastal-city-and-industrial-harbor.md) |
| 岩地城堡与旧城；季节另核对 | 岩城、围合院落、城堡、港岸 | 墙门、台地、民房与岩壁关系；不混为日式科技场景 | [岩地城堡](styles/rocky-castle-settlements.md) |
| 浮岛要塞：日本科技，海上钢铁平台 | 单层/多层平台、工业中庭、港缘、园林嵌块 | 钢铁面、垂直饰面、边缘栏杆、层间连接与海床；区别自然悬崖和传统民房 | [浮岛要塞](styles/floating-fortress.md) |

地名所在战役目录不等于当地美术。例如珍珠港应核对夏威夷暖季港湾资产，不能因目录叫“日本”就套日本房屋；挑战的军事阵营不决定民房地域。雪白屋顶、冷色光照和名字也不能单独证明季节。证据不足时注明“温带/季节未独立确认”，不能补一个确定标签。

道路/铁路/桥头/木质铺装另外读 [道路制作与小样](road-construction.md)，从地区季节选StreetSegment、Road、rail和桥的正确系统，再查具体型号与端面；14个关键位置的 [图片/精确记录](road-focus-cases.json) 可按case检索。不同系统的数量、Z和角度不互相推广。

## 按功能选小样

| 场所 | 先检查的关系 | 补充参考 |
|---|---|---|
| 居民区 | 房屋原尺寸、临街正面、入口、院后服务、围墙开口；密度不等于穿模 | 地区风格页、[装饰布局](decor-and-composition.md) |
| 城市医院 | 公共入口、救护停车、人行通路、安静绿地与服务侧；科技医院的玩法功能需明确 | 俄国冬季、日本港口城市、[分类物体用法](asset-use.md) |
| 村镇医院 | 主要村路上的公共节点，较小前场与本地围界；原版无合适小型外观时说明替代 | 俄国冬季、尤卡坦夏季；不能把普通民房称为可占领医院 |
| 公园与纪念广场 | 主要到达路径、中心主题、步行环线、座椅朝向、低植被与开口 | 俄国冬季、西欧与美洲 |
| 港口与码头 | 岸上仓储—装卸—水侧船位，公路/铁路接驳，水位、吊臂朝向、航道留空 | 各地区港区页；浮岛港缘另读平台页 |
| 火车站与平交路口 | 站台接轨、站前接路、货运另分区、平交同高度、信号和闸杆不挡路 | 俄国温带、[道路与中立物体](roads-and-neutrals.md) |
| 野地与林缘 | 地形先决定材质区，草土沙/岩按坡脚与使用痕迹组织，树丛有内外密度变化 | 地区自然页、[地形设计](terrain-design.md) |
| 悬崖与平台接缝 | 原点、端面、接地和内外角；不同风格崖面不可互换推断 | [悬崖](cliffs-and-transitions.md)、浮岛要塞 |
| 地表交界 | 硬面与软面分别处理，先小样、局部单向、同机位查看三材质交点 | [材质与边缘](terrain-materials-and-edges.md)、[高对比边缘实验](terrain-edge-lab.md) |

## 可检索的证据

[observed-assets.json](observed-assets.json) 记录 118 个样例、2,678 个观测物体类型和 355 个材质名称，按 20 个物体类组织。这是**候选与出处索引**，不是声称每个未知物件都已经验证了模型或使用方法。常用且有明确外观证据的对象在各风格页逐项写用法；未归明用途的 `other-observed-props` 不自动用于成图。

用本 Skill 内的查询脚本只取当前需要的条目，路径相对安装目录；Node.js 是地编运行环境之一：

```powershell
node scripts/lookup-assets.cjs --case m050 --category walls-gates-and-boundaries --limit 8
node scripts/lookup-assets.cjs --case u015,u029 --category civilian-buildings --limit 12
node scripts/lookup-assets.cjs --case m051 --kind materials --limit 12
node scripts/lookup-assets.cjs --case m050 --kind environment --limit 1
```

`--search` 可搜 ID 或目录名称；`--include-supplements true` 才把社区/MOD 补充作为检索来源。查询不连接游戏，执行放置前仍需查当前挂载资源、单体预览和原生几何。返回的示例角度、z 和 scale 是观察记录，不是跨地图通用值。

图册中的总览定位区域，分区看空间关系，近景确认接口。26 张战役来源场景提供完整 239 个分区；新增合集图册保留完整 675 个分区与原有近景。诊断截图关闭雾/泛光、隐藏已识别军事物体，东京港补光图另有标记；这些调整没有写回原图，也不能用于证明游戏的最终色调。

来源类别：26 张战役来源副本、69 张挑战合集场景版本、21 张社区补充、2 张明确 MOD 示例。没有已知 EA 原文件哈希的社区整理版本，只称官方来源场景，不称字节未改动的官方原件。缺失资源、白块、条纹与解析异常单独标记，不学习成美术模板。

## 补充案例与待定类别

本表补齐十二个风格页的路由缺口，按独立文件版本计数。已有文字归类但缺直接图集链接的案例沿用原页说明；原页未提及的 m074、u005/u006/u007、u037/u038、u061 已对照统一 Core 缓存并实际打开各自的诊断图集，核对空间与功能。这里只补充出处与入口，不表示重新逐项认证全部模型、国别、月份或每个接缝。

| 补充案例与直接图集 | 路线 / 待定类别 | 证据与使用边界 |
|---|---|---|
| [m074 哈瓦那](../assets/campaign/m074-atlas.jpg) | 哈瓦那暖地滨海城 → 旅馆/商业街块、体育与公园、连续滨海步道；参照[美洲](styles/western-americas-temperate.md)与[海岸城市](styles/coastal-city-and-industrial-harbor.md)的功能关系，确切月份未确认 | 原版战役来源副本；图集可见临水步道、停车硬场和城市绿地；Core 记录 HV 旅馆/公寓/商店，不仅凭文件名推定。任务设施不迁移 |
| [u005 拨云见日](../assets/uprising/u005-atlas.jpg)、[u006 重置](../assets/uprising/u006-atlas.jpg)、[u007 重置 1.1](../assets/uprising/u007-atlas.jpg) | 林地湖岸台地 → 疏村、长路/支路、坡口；参照[美洲自然/木屋节点](styles/western-americas-temperate.md)与[分层地形](terrain-design.md)。现实地域与确切季节未独立确认 | 三张图集均已补看，Core 有 YP_Cabin、SA_HOUSE04、YP/CC 植被；混用 Grass_Yucatan 不证明热带/尤卡坦。按版本计三例，不当三处地点 |
| [u037 女人争斗](../assets/uprising/u037-atlas.jpg)、[u038 重置](../assets/uprising/u038-atlas.jpg) | 暖地岩岸岛 → 草土台地、少量围合院落；参照[暖地配套](styles/coastal-city-and-industrial-harbor.md)和[自然地形](terrain-design.md)，地区与确切季节待定 | 两图集均已补看；HA_BUILDING16 与 HA 植被只证明观测资产，不能单凭前缀确定日本/夏威夷。科技/任务设施不转为住宅规范 |
| [u061 卫星终结站](../assets/uprising/u061-atlas.jpg) | 待定类别：草岩/裸地自然岛 → 岸线、台地、土路；参照[分层地形](terrain-design.md)与[材质边缘](terrain-materials-and-edges.md)，地区、气候与季节未确认 | 图集已补看，外岩岸/沙滩、中央裸地与外圈草岩层次明确；Core 住宅候选为空，仅作自然构图对照，不据 TH/YU 混用资源强定国别或火山主题 |
| [u012 超时空](../assets/uprising/u012-atlas.jpg)、[u013 重置](../assets/uprising/u013-atlas.jpg)、[u023 红色突袭](../assets/uprising/u023-atlas.jpg) | [俄国冬季](styles/western-russia-winter.md)补充路线 | 原页已有文字归类，本次补直接链接；采用该页的院落、港岸与冬季绿化边界，入口/单体/月份仍按任务核对 |
| [u030 卷入战火](../assets/uprising/u030-atlas.jpg)、[u031 重置](../assets/uprising/u031-atlas.jpg)、[u035 你的金矿坍塌了](../assets/uprising/u035-atlas.jpg)、[u064 箱子与红桶](../assets/uprising/u064-atlas.jpg)、[u065 重制 1.1](../assets/uprising/u065-atlas.jpg) | [俄国冬季](styles/western-russia-winter.md)补充路线 | 原页已有文字归类，本次补直接链接；不用挑战名称、阵营或物体频率替代实际场景判断 |
| [u019 高水位线](../assets/uprising/u019-atlas.jpg)、[u020 1.1](../assets/uprising/u020-atlas.jpg)、[u056 缩小地区](../assets/uprising/u056-atlas.jpg)、[u063 无处可躲](../assets/uprising/u063-atlas.jpg) | [西欧暖季页](styles/western-europe-summer.md)的滨海小城/度假城补充；现实国别与月份按原页边界核对 | 原页明确写“上述补充图册已看”，本次仅补直接链接，没有把作者记录改称本审计重新看图 |
| [u052 死期](../assets/uprising/u052-atlas.jpg)、[u053 重置](../assets/uprising/u053-atlas.jpg) | [西欧页](styles/western-europe-summer.md)的温带沿岸村镇补充；国家与具体季节未独立确认 | 原页已有 Romania/Gypsy 资产与冷色光照说明；两者都不能单独证明国别或冬季，本次仅补链接 |
| [u032 军备竞赛](../assets/uprising/u032-atlas.jpg) | [地中海页](styles/western-mediterranean-summer.md)的暖色工业沿岸功能对照，现实国家未知 | 原页已将 u032/u033 列为功能对照，u033 已有直接图集；本次补 u032 链接，不把混用资产全部认定希腊 |

本表的 u 案例属于挑战合集场景版本，可能含社区整理或重置；不称字节未改动的 EA 原件。研究缓存的地表/高程采样为 step=2，相邻样本中间存在未采样格，且含海床/底板：材质邻接、缺混合计数和图集覆盖率均不能保证每个接缝无错。具体接缝仍需目标位置的逐格数据与原尺寸近景小样检查。
