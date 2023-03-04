import { RequestMappingRule } from '../action-types';
import { hansReResMapName } from '../utils';
import AddRuleForm from './AddRuleForm';
import ConfigProvider from 'antd/es/config-provider';
import Layout from 'antd/es/layout';
import Navbar from './Navbar';
import React, { createContext } from 'react';
import RuleList from './RuleList';
import styles from './PopupApp.module.less';
import theme from 'antd/es/theme';
import useLocalStorageState from '../hooks/useLocalStorageState';

const bg = chrome?.extension?.getBackgroundPage();
const bgWindow = bg || window;
export const PopupContext = createContext<{ hansReResMap: RequestMappingRule[], setHansReResMap: (rules: RequestMappingRule[]) => void, bg: Window | null } | null>(null);

enum ClassNamePrefix {
  DARK = 'custom-theme-dark',
  DEFAULT = 'custom-theme-default'
}

export const ThemeContext = createContext<{ curClassNamePrefix: ClassNamePrefix, preferDarkTheme: boolean, setPreferDarkTheme(preferDarkTheme: boolean): void } | null>(null);

const PopupApp: React.FC = () => {
  const [hansReResMap, setHansReResMap] = useLocalStorageState<RequestMappingRule[]>(
    hansReResMapName,
    {
      defaultValue: [],
      localStorageSource: bgWindow
    }
  );

  const [preferDarkTheme, setPreferDarkTheme] = useLocalStorageState('preferDarkTheme', {
    defaultValue: true
  });
  const antdCurrentTheme = {
    algorithm: preferDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm
  };
  const curClassNamePrefix = preferDarkTheme ? ClassNamePrefix.DARK : ClassNamePrefix.DEFAULT;

  return (
    <ConfigProvider theme={antdCurrentTheme}>
      <ThemeContext.Provider value={{ curClassNamePrefix, preferDarkTheme, setPreferDarkTheme }}>
        <Layout className={styles['app']}>
          <PopupContext.Provider value={{ bg, hansReResMap, setHansReResMap }}>
            <Navbar />
            <div className={styles['popup-body-container']}>
              <AddRuleForm ruleToEdit={null} showClearStorageBtn={true} />
              <RuleList />
            </div>
          </PopupContext.Provider>
        </Layout>
      </ThemeContext.Provider>
    </ConfigProvider>
  );
};

export default PopupApp;
