import { Router } from 'express'
import type { Request, Response } from 'express'
import { getTransferService } from '../services/transfer-service'
import type { Address } from 'viem'

const router = Router()

interface TransferRequestBody {
  from: string
  to: string
  amount: string
  fromChainId: number
  toChainId: number
  fromToken: string
  toToken: string
  slippage?: number
}

/**
 * POST /api/wallet/transfer
 * 
 * Universal transfer endpoint que maneja automáticamente:
 * - Transferencias nativas (mismo token, misma red)
 * - Swaps (diferentes tokens, misma red)
 * - Bridge cross-chain (diferentes redes) - Coming soon
 * 
 * Este endpoint solo prepara las transacciones.
 * El frontend es responsable de firmar y ejecutar con la wallet del usuario.
 */
router.post('/transfer', async (req: Request, res: Response) => {
  try {
    const body = req.body as TransferRequestBody

    // Validación de parámetros requeridos
    if (!body.from || !body.to) {
      return res.status(400).json({
        statusCode: 400,
        message: 'From and to addresses are required',
        error: 'Bad Request',
      })
    }

    if (!body.amount || isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Valid amount is required',
        error: 'Bad Request',
      })
    }

    if (!body.fromChainId || !body.toChainId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Chain IDs are required',
        error: 'Bad Request',
      })
    }

    if (!body.fromToken || !body.toToken) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Token addresses are required',
        error: 'Bad Request',
      })
    }

    // Preparar transferencia
    const transferService = getTransferService()
    const result = await transferService.prepareTransfer({
      from: body.from as Address,
      to: body.to as Address,
      amount: body.amount,
      fromChainId: body.fromChainId,
      toChainId: body.toChainId,
      fromToken: body.fromToken as Address,
      toToken: body.toToken as Address,
      slippage: body.slippage || 1,
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error('Transfer error:', error)

    // Errores específicos
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(503).json({
          statusCode: 503,
          message: '1inch API error: ' + error.message,
          error: 'Service Unavailable',
        })
      }

      if (error.message.includes('not yet implemented')) {
        return res.status(501).json({
          statusCode: 501,
          message: error.message,
          error: 'Not Implemented',
        })
      }

      return res.status(400).json({
        statusCode: 400,
        message: error.message,
        error: 'Bad Request',
      })
    }

    return res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    })
  }
})

export default router
