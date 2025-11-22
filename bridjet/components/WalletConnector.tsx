import { type ReactNode } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface WalletConnectorProps {
  children?: (props: {
    address: string | undefined
    isConnected: boolean
    isConnecting: boolean
    connect: (connectorId: string) => void
    disconnect: () => void
    connectors: Array<{ id: string; name: string; ready: boolean }>
  }) => ReactNode
  /** Si es true, usa el botón de RainbowKit (recomendado). Si es false o se pasan children, usa el renderizado custom */
  useRainbowKit?: boolean
}

/**
 * WalletConnector - Componente para conectar wallets
 * 
 * Modo RainbowKit (recomendado - moderno y hermoso):
 * ```tsx
 * <WalletConnector useRainbowKit={true} />
 * ```
 * 
 * Modo Custom (compatible con versión anterior):
 * ```tsx
 * <WalletConnector>
 *   {({ isConnected, address, connect, disconnect }) => (
 *     // Tu UI custom aquí
 *   )}
 * </WalletConnector>
 * ```
 */
export function WalletConnector({ children, useRainbowKit = true }: WalletConnectorProps) {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  // Si se solicita RainbowKit y no hay children custom, usar el botón de RainbowKit
  if (useRainbowKit && !children) {
    return <ConnectButton />
  }

  // Modo legacy/custom: renderizado con children
  const handleConnect = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId)
    if (connector) {
      connect({ connector })
    }
  }

  const availableConnectors = connectors.map(connector => ({
    id: connector.id,
    name: connector.name,
    ready: true,
  }))

  return (
    <>
      {children?.({
        address,
        isConnected,
        isConnecting: isPending,
        connect: handleConnect,
        disconnect,
        connectors: availableConnectors,
      })}
    </>
  )
}
