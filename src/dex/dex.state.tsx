import React, { createContext, useState, useContext, Dispatch, SetStateAction } from "react";
import { LiquidityPoolData, RawSwapAction } from "./model";

export interface DexStateInterface {
  lastBlock: number;
  swap: RawSwapAction[];
  data: LiquidityPoolData[];
  loaded7d: boolean;
}

const DexStateContext = createContext({
  state: {} as Partial<DexStateInterface>,
  dispatch: {} as Dispatch<SetStateAction<Partial<DexStateInterface>>>,
});

const DexStateProvider = ({
  children,
  value = {} as DexStateInterface,
}: {
  children: React.ReactNode;
  value?: Partial<DexStateInterface>;
}) => {
  const [state, dispatch] = useState(value);
  return (
    <DexStateContext.Provider value={{ state, dispatch }}>
      {children}
    </DexStateContext.Provider>
  );
};

const useDexState = () => {
  const context = useContext(DexStateContext);
  if (!context) {
    throw new Error("useDexState must be used within a DexStateContext");
  }
  return context;
};

export { DexStateProvider, useDexState };