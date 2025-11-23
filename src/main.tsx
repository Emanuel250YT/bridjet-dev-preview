import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { BridjetComponent, BridjetProvider, setupBridjet } from "../bridjet";
import { WorldcoinBody } from "./components/WorldcoinBody.tsx";
import { SwapExample } from "./SwapExample.tsx";
import { CrossChainExample } from "./CrossChainExample.tsx";
import { UniversalSwapExample } from "./UniversalSwapExample.tsx";

setupBridjet({
  providers: {
    types: [
      "worldcoin",
      "lemon",
      "farcaster",
      "base",
      "rostock",
      "xmtp",
      "default",
    ],
    defaultType: "default",
    detectProvider: (host: string) => {
      const lowerHost = host.toLowerCase();
      if (lowerHost.includes("worldcoin.")) return "worldcoin";
      if (lowerHost.includes("lemon.")) return "lemon";
      if (lowerHost.includes("farcaster.")) return "farcaster";
      if (lowerHost.includes("base.")) return "base";
      if (lowerHost.includes("rostock.")) return "rostock";
      if (lowerHost.includes("xmtp.")) return "xmtp";
      return "default";
    },
  },
  switchAdapter: {
    defaultPath: "/.well-known/farcaster.json",
  },
  messages: {
    useBridjetError: "useBridjet debe ser usado dentro de un BridjetProvider",
  },
  autoInitializeAdapters: true,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BridjetProvider>
      <BridjetComponent provider="base">
        <UniversalSwapExample />
      </BridjetComponent>

      <BridjetComponent provider="worldcoin">
        <MiniKitProvider
          props={{
            appId: "app_015c152d331c6c76cb63308adc4341e9",
          }}
        >
          <WorldcoinBody />
        </MiniKitProvider>
      </BridjetComponent>

      <BridjetComponent provider="default">
        <App />
      </BridjetComponent>
    </BridjetProvider>
  </StrictMode>
);
