import { type ReactNode } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

interface WalletConnectorProps {
  children: (props: {
    address: string | undefined
    isConnected: boolean
    isConnecting: boolean
    connect: (connectorId: string) => void
    disconnect: () => void
    connectors: Array<{ id: string; name: string; ready: boolean }>
  }) => ReactNode
}

export function WalletConnector({ children }: WalletConnectorProps) {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

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
      {children({
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
