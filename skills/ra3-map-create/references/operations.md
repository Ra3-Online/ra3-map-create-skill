# 连接与操作

工具包需要 Windows x64、Node.js 24 LTS 和用于画面检查的合法游戏资源。源码项目先按其 SETUP 构建；独立 agent-kit 自带 MapIO 的 .NET 运行时。MCP 用 stdio 启动 `node <工具包目录>/dist/mcp/server.js`。图形版的设置可指定游戏目录；独立进程可继承用户提供的 `RA3ME_GAME_DIR`，不要把任何作者的本机路径写入 skill。

用 MCP 客户端当前列出的 schema 作为参数权威。只检索眼前需要的工具和物体，不把整个目录放入模型上下文。

| 任务 | 接口与关键注意 |
|---|---|
| 环境与资源 | `ra3map_assets_status`、`ra3map_list_object_catalog`、`ra3map_list_terrain_textures`；目录无过滤参数时仅返回概览，按关键词/分类筛选 |
| 打开/新建 | `ra3map_open_map`、`ra3map_create_map`；新建返回 current/opened.handle，已是当前会话 |
| 地图概况 | `ra3map_describe_map`、`ra3map_describe_terrain`；含 border，可玩宽高与数组宽高不同 |
| 局部读取 | `ra3map_get_heightmap`：默认可能降采样，精确检查需 step=1 和足够 maxCells；`ra3map_get_cell_flags`：明确矩形/plane，超过上限会拒绝，不截断 |
| 道路/矿位分析 | `ra3map_list_objects` 使用 exact:true 保留精确世界坐标、角度、z、roadOption 与 isWaypoint；默认列表仍取整且省略这些标志 |
| 放置 | `ra3map_batch_place`；世界坐标，props 写 objectLayer/objectName，角度是度，owner 必须来自地图玩家/队伍；常驻场景实体用 Civilian，玩法中立设施按用途归属，详见 asset-use |
| 改地形 | `ra3map_sculpt_terrain`、`ra3map_apply_terrain_patch`；补丁高度是 SAGE u16 LE，不是直接写世界高度；高级补丁在脚本内生成 |
| 材质与混合 | `ra3map_paint_texture`、局部 `ra3map_auto_edge_out` / `ra3map_auto_edge_in`、`ra3map_blend_edge`；补丁可添加材质类，paint 使用图中已有名字。整区 All 工具先按 terrain-edge-lab 做小样，不作为默认消锯齿步骤；保留 blend1/blend2 的一致性 |
| 混合格式 | `ra3map_get_blend_format` 只读分类；`ra3map_repair_blend_format` 显式修版本27中可识别的零尾标记，一次可撤销、不收边、不保存。未知非零与异常零保留并计数，其他版本 no-op；详见下节 |
| 水与道路 | 新图通常已有一片海域，先 `ra3map_get_water`，用 `ra3map_set_water_area` 调整；只有确实需要新多边形才 add。`ra3map_add_road_segment` 管理成对节点，避免手工串错 roadOption |
| 看图 | `ra3map_render_topdown` 优先 saveTo 保存 PNG，避免大段 base64；3D 用 capture-map。俯视水色是单水位近似，多水位湖泊要看 3D |
| 保存与支援 | `ra3map_save_as`、`ra3map_save` 默认备份；新图保存后显式 `ra3map_generate_map_xml`、`ra3map_write_preview_tga`；已有 XML 用同步工具，不乱重建 |
| 新建骨架兼容 | 当前接口有 `ra3map_get_new_map_compatibility` 时读六 MP 槽和每玩家 Library 验证；`ra3map_repair_new_map_skeleton` 仅显式修本项目可识别旧零块，一次可撤销且不保存，未知非零拒绝；不要在普通打开/保存时重置合法用户设置 |

脚本使用工具包自带 MCP SDK，不需要另装第二份 SDK。所有编辑仍经过 MCP/Core，脚本不提供另一条地图解析入口。会话句柄只在其服务进程中有效，不从别的进程/日志抄 handle。

图形截图启动的是独立、只读用途的地编会话，退出时只关闭它启动的窗口。它不连接用户现有窗口，不做地图写入；图片只保存到新目录。首次加载游戏模型可能需要等待，捕获失败不能把空图当成果。

新建地图沿当前 Core 默认的 buildability 位值，不因字段名字就把全图写成 true。现阶段 RA3 的 bit 极性需原版标记样例或实际部署验证；恢复默认 0 也不是 MCV 可展开证据。逐格读回、地形/占地筛选与实际部署分别记录，见 [游戏兼容验收](game-compatibility.md)。

## 在图形版观看外接 AI

“跟随 AI”默认关闭；首次点击启用后，按钮会显示等待、读取、只读观看、暂停、离线或加载失败。已打开地图时优先跟随同一路径，没有匹配会话就保留当前地图等待；空编辑器发现一个来源时自动打开预览，发现多个来源时先选择目标，不擅自切换到其他地图。

未保存预览需要 AI 实际连接带预览发布器的新版 MCP。配置已改成新路径也不会更新正在运行的旧服务；使用客户端的正常重连方式建立新服务，再让 AI 通过 MCP 打开目标文件。等待时核对 UI 提示中的文件路径与实际 MCP 入口，不通过伪造 dirty、保存地图或操作他人的进程来制造更新。

观看会读取经过统一地图服务验证的只读快照，支持未保存的对象、道路、地形、高程和光照；不会为预览写入源地图或修改 AI 的撤销历史。相同版本不会重建画面，更新保持机位。预览会话不能编辑、撤销或保存；本地地图已有未保存改动时，跟随暂停并保留该会话，保存或撤销冲突后才能继续。

编辑前点击停止跟随。源文件未变化时恢复原可编辑会话及撤销历史；源文件已经被 AI 保存更新时，重新读取当前已保存版本。离线时保留最后预览供查看，停止后恢复可编辑地图；加载拒绝仅显示“加载失败”并保留已接受的地图。关闭观看窗口不关闭 AI 自己的 MCP 服务。

## 混合格式检查与另存重开

当前新地编的 UI、Core 与 MCP 使用同一边缘生成/修复命令；切换入口不会自动解决格式或原生表现差异。图形侧栏“纹理边缘细化”中的“检查格式”和“修复零标记”分别调用相同 getter 与 command；修复后仍需自行另存。客户端 schema 有下列两个工具时，均只接受可选 `handle:string`，省略作用于当前地图；没有坐标、常量或 raw 字节参数。旧工具包没有这两个接口时升级对应工具包，不以原始解析器修改地图。

先调用 `ra3map_get_blend_format`，记录实际 `blockVersion`、`supportedVersion`、`totalRecords`、`zeroRecords`、`repairableRecords`、`canonicalRecords`、`unknownNonZeroRecords`、`skippedZeroRecords` 和跳过原因。当前只支持实际块版本27；这是地图数据版本，不是游戏版本或 WB 产品版本。`canonicalRecords` 只表示尾值等于 `0x7ADA0000`，不代表方向、原生加载或画面已通过。

显式 `ra3map_repair_blend_format` 仅将符合条件的零值尾标记改为规范常量：原下标深克隆，保留 secondary、六方向字节、customEdge 与所有格引用。它不重刷材质、不运行 Auto Edge Out，也不保存。回执 `result` 的分类数是修复前状态，另看 `repairedRecords`、`remainingZeroRecords`、`changed`，再调用 getter取得当前分类。未知非零和异常零是保留跳过，不能将剩余零数冒称全部修复；无改动不置脏、不进历史，Undo/Redo 沿用普通编辑工具。

以下只展示当前 schema 的执行顺序。`h0` 来自打开回执；另存用新的同名目录/文件；保存必须核对 `Ok` 与 `VerifiedRoundTrip`：

```json
{"tool":"ra3map_get_blend_format","arguments":{"handle":"<h0>"}}
{"tool":"ra3map_repair_blend_format","arguments":{"handle":"<h0>"}}
{"tool":"ra3map_get_blend_format","arguments":{"handle":"<h0>"}}
{"tool":"ra3map_save_as","arguments":{"handle":"<h0>","path":"<Maps绝对路径>/<测试地图名>/<测试地图名>.map"}}
{"tool":"ra3map_close_map","arguments":{"handle":"<h0>"}}
{"tool":"ra3map_open_map","arguments":{"file":"<Maps绝对路径>/<测试地图名>/<测试地图名>.map"}}
{"tool":"ra3map_get_blend_format","arguments":{"handle":"<上一步新返回的handle>"}}
```

`open_map` 遇到仍有未保存改动的同文件会复用旧会话，不能当作重新读盘。保存后关闭并打开目标路径，确认新 handle，再核对 terrain、对象和 metadata。`map.assetRaw`/对应公开原始块读取返回读入时 payload；检查写后字节差异也必须在 fresh 重开的会话做，不能用编辑中会话的旧 raw 判断修复范围。所有检查仍经过统一地图服务。

严格单字段对照保留原图 SHA，检查副本除目标尾字段外全部原样；用于游戏选择而改 `mapName` 的副本应另标“尾字段+显示名”，不能称单字段。支援 XML/预览按当前交付要求核对，任何变化另行记录。最后在目标 WB 和游戏的同一位置、相同配置下看边缘；具体隔离项和证据边界见 [游戏兼容验收](game-compatibility.md)。

需要核查原生保留能力时，在额外诊断副本中由目标 WB打开并 Save，随后fresh Core重开原生输出，按坐标比较材料/phase和引用记录完整字段。原生程序会压缩表、重编号和重写metadata，不能直接拿 raw tile值或blend ID变化判损失，也不能把输出称为仅尾字段不同。本轮物版v16的受控A/B：零尾A的11731引用全部变占位/清除；纯尾修复B的11731引用全部语义保留，仅删除6460条未引用记录。该原生结果已证实格式影响保留，但不赋R6游戏视觉通过。

## 预览回执与替代图

`ra3map_write_preview_tga` 可能返回 JSON `status:error`，即使传输层没有 `isError`。生成后检查成功回执和真实文件；游戏选图用的额外大图需 `alsoArt:true, artSize:512`，128 小图与同名 `_art.tga` 作用不同。

现有原版小地图算法对某些非整数陆地高度有局限。遇到这种失败，保留已保存地图及其层级；通过 `ra3map_render_topdown` 取得 PNG，说明它是地编俯视替代图。需要 TGA 时，可用可用的图像处理工具将这张经地图服务生成的 PNG 裁掉 border，再生成 128/512 BGRA、左下原点的 32 位 TGA，并解码读回核对尺寸、像素和方向。不要另开原始地图解析入口，也不能在尚未完成转换时声称支援文件已齐。
