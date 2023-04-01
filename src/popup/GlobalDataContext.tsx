import { RequestMappingRule } from '@/action-types';
import { hansReResMapName } from '@/utils';
import React, { ReactNode, createContext, useContext } from 'react';
import useLocalStorageState from '@/hooks/useLocalStorageState';

type ContextType = {
  hansReResMap: RequestMappingRule[],
  setHansReResMap: (rules: RequestMappingRule[]) => void,
  bg: Window | null
  bgWindow: Window
} | null;

export const GlobalDataContext = createContext<ContextType>(null);

const bg = chrome?.extension?.getBackgroundPage();
const bgWindow = bg || window;

interface Props {
  children?: ReactNode
}

export const GlobalDataProvider: React.FC<Props> = (props) => {
  const { children } = props;
  const [hansReResMap, setHansReResMap] = useLocalStorageState<RequestMappingRule[]>(
    hansReResMapName,
    {
      defaultValue: [],
      localStorageSource: bgWindow
    }
  );

  return (
    <GlobalDataContext.Provider
      value={{
        bg,
        bgWindow,
        hansReResMap,
        setHansReResMap
      }}
    >
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalDataContext = () => {
  return useContext(GlobalDataContext);
};
