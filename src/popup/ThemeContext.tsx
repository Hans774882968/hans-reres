import ConfigProvider from 'antd/es/config-provider';
import React, { ReactNode, createContext, useContext } from 'react';
import theme from 'antd/es/theme';
import useLocalStorageState from '@/hooks/useLocalStorageState';

type ContextType = {
  curClassNamePrefix: ThemeClassNamePrefix,
  preferDarkTheme: boolean,
  setPreferDarkTheme(preferDarkTheme: boolean): void
} | null;

const ThemeContext = createContext<ContextType>(null);

export enum ThemeClassNamePrefix {
  DARK = 'custom-theme-dark',
  DEFAULT = 'custom-theme-default'
}

interface Props {
  children?: ReactNode
}

export const ThemeProvider: React.FC<Props> = (props) => {
  const { children } = props;
  const [preferDarkTheme, setPreferDarkTheme] = useLocalStorageState('preferDarkTheme', {
    defaultValue: true
  });
  const antdCurrentTheme = {
    algorithm: preferDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm
  };
  const curClassNamePrefix = preferDarkTheme ? ThemeClassNamePrefix.DARK : ThemeClassNamePrefix.DEFAULT;

  return (
    <ConfigProvider theme={antdCurrentTheme}>
      <ThemeContext.Provider
        value={{ curClassNamePrefix, preferDarkTheme, setPreferDarkTheme }}
      >
        {children}
      </ThemeContext.Provider>
    </ConfigProvider>
  );
};

export const useThemeContext = () => {
  return useContext(ThemeContext);
};
