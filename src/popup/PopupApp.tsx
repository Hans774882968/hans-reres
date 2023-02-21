import React, { createContext } from 'react';
import AddRuleForm from './AddRuleForm';
import RuleList from './RuleList';
import styles from './PopupApp.module.less';
import { hansReResMapName, RequestMappingRule } from '../utils';
import useLocalStorageState from '../hooks/useLocalStorageState';

const bg = chrome?.extension?.getBackgroundPage();
const bgWindow = bg || window;
export const PopupContext = createContext<{ hansReResMap: RequestMappingRule[], setHansReResMap: (rules: RequestMappingRule[]) => void, bg: Window | null } | null>(null);

const PopupApp: React.FC = () => {
  const [hansReResMap, setHansReResMap] = useLocalStorageState<RequestMappingRule[]>(
    hansReResMapName,
    {
      defaultValue: [],
      localStorageSource: bgWindow
    }
  );

  return (
    <div className={styles.app}>
      <PopupContext.Provider value={{ hansReResMap, setHansReResMap, bg }}>
        <AddRuleForm ruleToEdit={null} showClearStorageBtn={true} />
        <RuleList />
      </PopupContext.Provider>
    </div>
  );
};

export default PopupApp;
