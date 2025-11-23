import express from 'express'
import { createServer as createViteServer } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import walletRouter from './bridjet/api/wallet.ts'

const { createSwitchAdapter, createRoutingRules, setupBridjet } = await import('./bridjet/index.ts')

setupBridjet({
  providers: {
    types: ['base', 'worldcoin', 'default'],
    defaultType: 'default',
    detectProvider: (host: string) => {
      if (host.includes('base.')) {
        return 'base'
      }
      if (host.includes('worldcoin.')) {
        return 'worldcoin'
      }
      return 'default'
    }
  },
  switchAdapter: {
    defaultPath: '/.well-known/farcaster.json',
  }
})

const isProd = process.env.NODE_ENV === 'production'

async function startServer() {
  const app = express()

  // Middleware para parsear JSON
  app.use(express.json())

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  // API Routes
  app.use('/api/wallet', walletRouter)

  const adapter = createSwitchAdapter({
    routingRules: [
      createRoutingRules.byHost('base.', async () => {
        const filePath = path.resolve(__dirname, 'public', '.well-known', 'farcaster.base.json')
        const file = readFileSync(filePath, 'utf-8')
        return JSON.parse(file)
      }),

      createRoutingRules.byHost('worldcoin.', async () => {
        const filePath = path.resolve(__dirname, 'public', '.well-known', 'farcaster.worldcoin.json')
        const file = readFileSync(filePath, 'utf-8')
        return JSON.parse(file)
      }),

      createRoutingRules.custom(
        (request) => {
          return request.searchParams.get('env') === 'test'
        },
        async () => {
          const filePath = path.resolve(__dirname, 'public', '.well-known', 'farcaster.test.json')
          const file = readFileSync(filePath, 'utf-8')
          return JSON.parse(file)
        }
      ),
    ],
    
    defaultConfig: async () => {
      const filePath = path.resolve(__dirname, 'public', '.well-known', 'farcaster.default.json')
      const file = readFileSync(filePath, 'utf-8')
      return JSON.parse(file)
    },
  })

  app.get('/.well-known/farcaster.json', adapter.createExpressMiddleware())

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
    })

    app.use(vite.middlewares)
  } else {
    app.use(express.static(path.join(__dirname, 'dist')))
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'))
    })
  }

  const port = process.env.PORT || 5173
  app.listen(port, () => {
    console.log(`✅ Servidor activo en http://localhost:${port}`)
  })
}

startServer()
