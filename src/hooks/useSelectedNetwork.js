import networkStore, { networks } from "@/utils/networkStore";
import { mainnetId } from "@/utils/constant";
import { useState,useEffect } from "react";
import { useAtom } from "jotai";

export const getSelectedNetwork = () => {
  const selectedNetworkId = window.localStorage.getItem("selectedNetworkId") ?? mainnetId;
  const selectedNetwork = networks.find(n => n.id === selectedNetworkId);

  // return mainnet if selected network is not found
  return selectedNetwork ?? networks[0];
};

export const useSelectedNetwork = () => {
  const [selectedNetwork, setSelectedNetwork] = useAtom(networkStore.selectedNetwork);

  useEffect(() => {
    const selectedNetworkId = localStorage.getItem("selectedNetworkId") ?? mainnetId;
    setSelectedNetwork(networks.find(n => n.id === selectedNetworkId) || networks[0]);
  },[]);
    


  return selectedNetwork ?? networks[0];
};