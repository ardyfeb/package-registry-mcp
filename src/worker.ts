import { timingSafeEqual } from 'node:crypto'
import { McpAgent } from 'agents/mcp'

import { server } from './server'
import './tools'

export class PackageRegistryMCP extends McpAgent {
  server = server

  async init() {
    // no op
  }
}

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url)
    const token = url.searchParams.get('token');
    const secret = Buffer.from(env.MCP_TOKEN);

    if (!token || !timingSafeEqual(secret, Buffer.from(token))) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    if (url.pathname === '/sse' || url.pathname === '/sse/message') {
      return PackageRegistryMCP.serveSSE('/sse').fetch(request, env, ctx)
    }

    if (url.pathname === '/mcp') {
      return PackageRegistryMCP.serve('/mcp').fetch(request, env, ctx)
    }

    return new Response('Not Found', { status: 404 })
  }
}
