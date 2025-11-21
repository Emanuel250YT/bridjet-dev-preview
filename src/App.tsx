import './App.css'
import { sdk } from "@farcaster/miniapp-sdk"
import { BridjetComponent, useBridjet } from '../bridjet'

function App() {
  const { provider, host } = useBridjet()

  sdk.actions.ready()

  return (
    <>
      <p>Provider detectado: {provider || 'cargando...'}</p>
      <p>Host: {host || 'cargando...'}</p>
      
      <BridjetComponent provider="base">
        <div>
          <h2>Contenido específico de Base</h2>
          <p>Este contenido solo aparece cuando el provider es Base</p>
        </div>
      </BridjetComponent>

      <BridjetComponent provider="worldcoin">
        <div>
          <h2>Contenido específico de Worldcoin</h2>
          <p>Este contenido solo aparece cuando el provider es Worldcoin</p>
        </div>
      </BridjetComponent>

      <BridjetComponent provider={['base', 'worldcoin']}>
        <div>
          <h2>Contenido para Base y Worldcoin</h2>
          <p>Este contenido aparece en ambos providers</p>
        </div>
      </BridjetComponent>

      <BridjetComponent provider="default">
        <div>
          <h2>Contenido por defecto</h2>
          <p>Este contenido solo aparece en el provider por defecto</p>
        </div>
      </BridjetComponent>
    </>
  )
}

export default App
