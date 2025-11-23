import { useState, useCallback, type ReactNode } from 'react'
import { 
  useAccount, 
  useWriteContract, 
  useSwitchChain,
  useSendTransaction,
} from 'wagmi'
import { erc20Abi, type Address } from 'viem'
import { getChainByName, isChainSupported } from '../../wagmi-config'
import { getCrossChainService } from '../../services/cross-chain-service'
import { getSwapService } from '../../services/swap-service'

export interface SendTokensWebPayload {
  recipient: Address
  amount: string
  tokenAddress: Address
  tokenSymbol?: string
  decimals?: number
  fromChainId?: number
  fromChainName?: string
  toChainId?: number
  toChainName?: string
  toTokenAddress?: Address
  enableCrossChain?: boolean
}

export interface SendTokensWebResponse {
  txHash?: string
  status: 'idle' | 'pending' | 'success' | 'failed'
  message?: string
  isCrossChain?: boolean
  receipt?: any
}

interface SendTokensWebProps {
  payload: SendTokensWebPayload
  onSuccess?: (response: SendTokensWebResponse) => void
  onError?: (error: Error) => void
  autoSwitchChain?: boolean
  children: (props: { 
    send: () => Promise<void>
    isLoading: boolean
    error: string | null
    response: SendTokensWebResponse | null
    needsChainSwitch: boolean
    switchChain: () => Promise<void>
    isCrossChain: boolean
  }) => ReactNode
}

export function SendTokensWeb({ 
  payload, 
  onSuccess, 
  onError, 
  autoSwitchChain = true,
  children 
}: SendTokensWebProps) {
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<SendTokensWebResponse | null>(null)
  
  const { address: walletAddress, chainId: currentChainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()
  const { sendTransactionAsync } = useSendTransaction()
  
  const crossChainService = getCrossChainService()
  const swapService = getSwapService()

  // Determinar el chain ID de origen
  const fromChainId = payload.fromChainId || 
    (payload.fromChainName ? getChainByName(payload.fromChainName)?.id : undefined) ||
    currentChainId

  // Determinar el chain ID de destino
  const toChainId = payload.toChainId || 
    (payload.toChainName ? getChainByName(payload.toChainName)?.id : undefined) ||
    fromChainId

  // Determinar tipo de operación
  const isSameChainSwap = Boolean(
    fromChainId === toChainId && 
    payload.toTokenAddress && 
    payload.tokenAddress.toLowerCase() !== payload.toTokenAddress.toLowerCase()
  )

  const isCrossChain = Boolean(
    payload.enableCrossChain && 
    fromChainId && 
    toChainId && 
    fromChainId !== toChainId
  )

  const needsChainSwitch = Boolean(
    fromChainId && 
    currentChainId && 
    fromChainId !== currentChainId
  )

  const switchChain = useCallback(async () => {
    if (!fromChainId) {
      throw new Error('No se especificó red de origen')
    }
    
    if (!isChainSupported(fromChainId)) {
      throw new Error(`La red ${fromChainId} no está soportada`)
    }

    try {
      await switchChainAsync({ chainId: fromChainId })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar de red'
      setError(errorMessage)
      throw err
    }
  }, [fromChainId, switchChainAsync])

  const sendDirectTransfer = useCallback(async () => {
    if (!walletAddress) {
      throw new Error('No hay wallet conectada')
    }

    // Calcular el amount en unidades base del token
    const decimals = payload.decimals || 18
    const amount = BigInt(parseFloat(payload.amount) * Math.pow(10, decimals))

    // Usar el contrato ERC20 para transferir
    const txHash = await writeContractAsync({
      address: payload.tokenAddress,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [payload.recipient, amount],
      chainId: fromChainId,
    })

    return txHash
  }, [walletAddress, payload, fromChainId, writeContractAsync])

  const sendSameChainSwap = useCallback(async () => {
    if (!walletAddress || !fromChainId) {
      throw new Error('Missing parameters for swap')
    }

    if (!payload.toTokenAddress) {
      throw new Error('toTokenAddress required for swaps')
    }

    const decimals = payload.decimals || 18
    const amount = (BigInt(parseFloat(payload.amount) * Math.pow(10, decimals))).toString()

    const swapTx = await swapService.getSwapTransaction({
      chainId: fromChainId,
      src: payload.tokenAddress,
      dst: payload.toTokenAddress,
      amount,
      from: walletAddress,
      slippage: 1,
    })

    const txHash = await sendTransactionAsync({
      to: swapTx.to,
      data: swapTx.data as `0x${string}`,
      value: BigInt(swapTx.value),
      chainId: fromChainId,
    })

    return txHash
  }, [
    walletAddress,
    fromChainId,
    payload,
    swapService,
    sendTransactionAsync,
  ])

  const sendCrossChainTransfer = useCallback(async () => {
    if (!walletAddress || !fromChainId || !toChainId) {
      throw new Error('Faltan parámetros para transferencia cross-chain')
    }

    if (!payload.toTokenAddress) {
      throw new Error('Se requiere toTokenAddress para transferencias cross-chain')
    }

    // Verificar si 1inch soporta las redes
    if (!crossChainService.isNetworkSupported(fromChainId) || 
        !crossChainService.isNetworkSupported(toChainId)) {
      throw new Error('Una o ambas redes no son soportadas por 1inch Aqua')
    }

    // Calcular el amount en unidades base del token
    const decimals = payload.decimals || 18
    const amount = (BigInt(parseFloat(payload.amount) * Math.pow(10, decimals))).toString()

    // Obtener la transacción de 1inch
    const swapTx = await crossChainService.buildSwapTransaction({
      fromChainId,
      toChainId,
      fromTokenAddress: payload.tokenAddress,
      toTokenAddress: payload.toTokenAddress,
      amount,
      walletAddress,
    })

    // Ejecutar la transacción de swap
    const txHash = await writeContractAsync({
      address: swapTx.to,
      abi: [
        {
          inputs: [],
          name: 'swap',
          outputs: [],
          stateMutability: 'payable',
          type: 'function',
        },
      ] as const,
      functionName: 'swap',
      value: BigInt(swapTx.value),
      chainId: fromChainId,
    })

    return txHash
  }, [
    walletAddress,
    fromChainId,
    toChainId,
    payload,
    crossChainService,
    writeContractAsync,
  ])

  const send = useCallback(async () => {
    if (!walletAddress) {
      const err = new Error('No hay wallet conectada')
      setError(err.message)
      onError?.(err)
      return
    }

    setError(null)
    setResponse({ status: 'pending', isCrossChain })

    try {
      // Verificar si necesita cambiar de red
      if (needsChainSwitch) {
        if (autoSwitchChain) {
          await switchChain()
        } else {
          throw new Error('Debe cambiar a la red correcta antes de enviar')
        }
      }

      // Validar red de origen
      if (fromChainId && !isChainSupported(fromChainId)) {
        throw new Error(`Red de origen no soportada: ${fromChainId}`)
      }

      let txHash: string

      if (isSameChainSwap) {
        // Swap en la misma red usando 1inch Classic Swap
        txHash = await sendSameChainSwap()
      } else if (isCrossChain) {
        // Usar 1inch Aqua para cross-chain
        txHash = await sendCrossChainTransfer()
      } else {
        // Transferencia directa ERC20
        txHash = await sendDirectTransfer()
      }

      const successResponse: SendTokensWebResponse = {
        txHash,
        status: 'success',
        message: isSameChainSwap
          ? `Swap completado: ${txHash}`
          : isCrossChain 
          ? `Transferencia cross-chain iniciada: ${txHash}`
          : `Tokens enviados exitosamente: ${txHash}`,
        isCrossChain,
      }

      setResponse(successResponse)
      onSuccess?.(successResponse)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar tokens'
      const failedResponse: SendTokensWebResponse = {
        status: 'failed',
        message: errorMessage,
        isCrossChain,
      }
      
      setError(errorMessage)
      setResponse(failedResponse)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    }
  }, [
    walletAddress,
    isSameChainSwap,
    isCrossChain,
    needsChainSwitch,
    autoSwitchChain,
    switchChain,
    fromChainId,
    sendSameChainSwap,
    sendCrossChainTransfer,
    sendDirectTransfer,
    onSuccess,
    onError,
  ])

  return (
    <>
      {children({ 
        send, 
        isLoading: isWritePending, 
        error, 
        response,
        needsChainSwitch,
        switchChain,
        isCrossChain,
      })}
    </>
  )
}
