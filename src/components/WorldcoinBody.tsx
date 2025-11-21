import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export function WorldcoinBody() {
  const [isInstalled, setInstalled] = useState<boolean>(false);

  useEffect(() => {
    setInstalled(MiniKit.isInstalled());
  }, []);

  return (
    <div>
      {isInstalled ? (
        <div>
          <h2>Worldcoin minikit is installed</h2>
        </div>
      ) : (
        <div>
          <h2>Worldcoin minikit is not installed</h2>
        </div>
      )}
    </div>
  );
}
