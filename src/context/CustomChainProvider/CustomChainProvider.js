'use client'
import { ChainProvider, useManager } from "@cosmos-kit/react";
import { wallets as keplr } from "@cosmos-kit/keplr";
import { GasPrice } from "@cosmjs/stargate";
import { akash, akashAssetList, akashSandbox, akashSandboxAssetList} from "@/chains/index";
import { useChain } from "@cosmos-kit/react";
import { Registry } from "@cosmjs/proto-signing";
import { useSelectedNetwork } from "@/hooks/useSelectedNetwork";

const customRegistry = new Registry();

export function CustomChainProvider({ children }) {
  return (
    <ChainProvider
      chains={[akash, akashSandbox]}
      assetLists={[akashAssetList, akashSandboxAssetList]}
      wallets={[...keplr]}
      sessionOptions={{
        duration: 31_556_926_000, // 1 year
        callback: () => {
          console.log("session expired");
          window.localStorage.removeItem("cosmos-kit@2:core//current-wallet");
          window.location.reload();
        }
      }}
      endpointOptions={{
        isLazy: true,
        endpoints: {
          akash: { rest: [], rpc: [] },
          "akash-sandbox": { rest: [], rpc: [] },
        }
      }}
      signerOptions={{
        preferredSignType: chain => "direct",
        signingStargate: chain => ({
          registry: customRegistry,
          gasPrice: GasPrice.fromString("0.025uakt")
        })
      }}
    >
      {children}
    </ChainProvider>
  );
}

export function useSelectedChain() {
  const {chainRegistryName}  = useSelectedNetwork()
  return useChain(chainRegistryName);
}