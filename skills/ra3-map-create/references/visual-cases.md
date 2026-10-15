# 视觉案例索引

**美化深化 v5**：[起义场景图册](../assets/uprising/gallery.html) 对新增 74 个文件逐图、逐区检查，全部 675 个分区收入 74 张图册，另有 34 张原尺寸近景。先按 [起义美化规则](uprising-beautification.md) 选择港城、村镇、庭园、干燥峡谷、度假区、火山或平台场景，再打开相关图片；[逐区与相对位置数据](uprising-cases.json) 只检索目标 ID。71 个文件来自挑战合集，含重制/重置和 MOD 样例；70 个美化签名组不是 70 种风格。出生点、军事基地、经济与任务结构不作模板，预览异常明确排除。原有 80 图材料保留，合计 154 个源地图文件已做数据审查。

**美化深化 v4**：优先看 [12 案例图册](../assets/beautification/gallery.html)，新图提高模型加载上限后重拍，冬季三图另有关闭距离雾的明确诊断视图。覆盖哈尔科夫、明斯克、俄国村庄任务及热带、日本、中欧、滨海、地中海、火山、郊区。悬崖/刷地表/装饰任务分别读 [悬崖](cliffs-and-transitions.md)、[材质与细化](terrain-materials-and-edges.md)、[冬季布局](winter-russia-layouts.md)、[装饰构图](decor-and-composition.md)。新鲜的 [80 图美化索引](beautification-index.json)、[重点相对布局](beautification-cases.json)、[135 种真实悬崖边界](cliff-palette.json) 按需检索；不加载全量做图。

先打开一张相关 3D 总览与局部，再看它的布局图。布局图来自经验证的地图数据，水域覆盖/道路/资源用诊断符号表示，不能代替实际模型画面。案例统计在 cases.json，名称大小写以当前资产目录为准。

**1v1 地形专项**：另见 [地形图册](../assets/terrain/gallery.html)、[主要层级诊断](../assets/terrain/terrain-atlas-main.png)、[分岛与变体诊断](../assets/terrain/terrain-atlas-islands.png) 和 [结构说明](terrain-design.md)。这组重新分析全部 9 个 1v1 文件（8 个案例组），附陆地高程/阻挡/剖面图、实际 3D、旧平岛反例和新配方测试。设计自然岛屿时优先看 m001/m006/m008；m004 是工业平台，m007 是低高差分岛，不能机械造同一种台地。

| 案例 | 适合学习 | 图像 |
|---|---|---|
| m001 / black1b | 自然海岸、双人主岛、灌木和岸石 | [3D 总览](../assets/maps/m001-overview.png)、[局部](../assets/maps/m001-detail.png)、[布局](../assets/maps/m001-layout.png) |
| m005 / feasel5 | 雪地的明暗层次、岩壁与树林 | [3D 总览](../assets/maps/m005-overview.png)、[局部](../assets/maps/m005-detail.png)、[布局](../assets/maps/m005-layout.png) |
| m006 / feasel6 | 海岸与起伏、草丛尺度变化 | [布局](../assets/maps/m006-layout.png) |
| m012 / 4_feasel1 | 四人岛屿、扩张空间 | [布局](../assets/maps/m012-layout.png) |
| m049 / russianvillage | 冬季城镇、街道/围栏/路灯 | [布局](../assets/maps/m049-layout.png) |
| m058 / leningradcanals | 运河城市、街区与留白；只学美化 | [3D 总览](../assets/maps/m058-overview.png)、[局部](../assets/maps/m058-detail.png)、[布局](../assets/maps/m058-layout.png) |
| m067 / yokohama | 日式港口、码头/工业物件朝向；只学美化 | [3D 总览](../assets/maps/m067-overview.png)、[局部](../assets/maps/m067-detail.png)、[布局](../assets/maps/m067-layout.png) |
| m080 / easterisland | 地域植被、岩石与海岸；只学美化 | [布局](../assets/maps/m080-layout.png) |

m058 没有 OreNode；m067/m080 有当前资源索引缺失的旧名称。案例不代表通过遭遇战或 MOD 兼容认证。不要仿造原任务的剧情/脚本。

m058 的当前地编 3D 预览可见路面条带/缺口、桥梁等渲染瑕疵；m067 的港口预览也有路面缺口和部分旧物件缺失。这两组图片只用于学习街区与运河/港口结构，不作为正确材质混合或桥梁效果的目标。遇到同类异常，应先区分地图设计与预览问题，不以破坏原地形的方式消除预览瑕疵。

本版自生成案例另见 [视觉迭代](../assets/examples/gallery.html)：初稿的宽几何环路是反例；修正版保留基地与资源结构、缩窄曲线并用植被簇改善尺度。它仍是草稿，局部岸线台阶/过渡等现象值得继续检查。

第二轮新增 [10 种地域案例图册](../assets/styles/gallery.html)，20 张实际 3D 总览/局部，配套 [民房与周边搭配](style-design.md)、[道路/矿位分析](roads-and-neutrals.md)、[80 图地形分类](terrain-catalog.md)。[全量索引](learning-index.json)包含每图哈希、分组与主要统计；[素材候选](style-palettes.json)只加载目标风格需要的条目。3D 图片存在的模型、路面或地垫异常在图册与风格页中标记，不学成正确效果。

80 张本地地图已做数据审查；基础索引精选 8 张，1v1 专项另覆盖全部 9 个文件；不需要每次加载全量素材。参考图用于学习取舍，源地图、BIG、贴图和模型没有打包。截图来源于用户提供的材料，地图原作者未逐一核实；公开分发这些参考图片前应确认相应使用范围，代码/说明与图片授权分开管理。
