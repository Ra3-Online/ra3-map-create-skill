'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

// Use the SDK shipped with the editor/agent kit, rather than a second install.
async function connect(editor) {
  const root = path.resolve(editor);
  const server = path.join(root, 'dist', 'mcp', 'server.js');
  if (!fs.existsSync(server)) throw new Error('找不到地编 MCP 服务；--editor 应指向已构建的项目或 agent-kit。');
  const runtimeRequire = createRequire(path.join(root, 'package.json'));
  const { Client } = runtimeRequire('@modelcontextprotocol/sdk/client/index.js');
  const { StdioClientTransport } = runtimeRequire('@modelcontextprotocol/sdk/client/stdio.js');
  const client = new Client({ name: 'ra3-map-create', version: '1.0.0' }, { capabilities: {} });
  const env = Object.fromEntries(Object.entries(process.env).filter(([, value]) => typeof value === 'string'));
  const transport = new StdioClientTransport({ command: process.execPath, args: [server], cwd: root, env, stderr: 'pipe' });
  // Map-service diagnostics are not skill output or instructions.
  transport.stderr?.on('data', () => {});
  await client.connect(transport);
  const trace = [];
  return {
    root, trace,
    listTools: () => client.listTools(),
    async call(name, args = {}) {
      const started = Date.now();
      const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 120000 });
      const record={ tool: name, ms: Date.now() - started, ok: !result.isError };trace.push(record);
      if (result.isError) {
        if (name === 'ra3map_open_map') throw new Error('加载失败');
        throw new Error(`${name} 执行失败：${result.content?.find(c => c.type === 'text')?.text || '无回执'}`);
      }
      const text = result.content?.find(c => c.type === 'text')?.text;
      if (text == null) return result;
      let data;try { data=JSON.parse(text); } catch { return text; }
      if(data&&(['error','failed'].includes(data.status)||data.Ok===false)){
        record.ok=false;
        if(name==='ra3map_open_map')throw new Error('加载失败');
        throw new Error(`${name} 执行失败：${data.message||data.error||'回执未确认成功'}`);
      }
      return data;
    },
    close: () => client.close(),
  };
}
module.exports = { connect };
