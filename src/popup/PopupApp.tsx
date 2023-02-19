import React, { createContext } from 'react';
import AddRuleForm from './AddRuleForm';
import RuleList from './RuleList';
import './PopupApp.css';
import { hansReResMapName, RequestMappingRule } from '../utils';
import useLocalStorageState from '../hooks/useLocalStorageState';

const bg = chrome?.extension?.getBackgroundPage();
const bgWindow = bg || window;
export const PopupContext = createContext<{
  hansReResMap: RequestMappingRule[],
  setHansReResMap: (rules: RequestMappingRule[]) => void,
  bgWindow: Window,
  bg: Window | null
    }>({
      hansReResMap: [],
      setHansReResMap: (rules: RequestMappingRule[]) => {rules;},
      bgWindow,
      bg
    });

const PopupApp: React.FC = () => {
  const [hansReResMap, setHansReResMap] = useLocalStorageState<RequestMappingRule[]>(
    hansReResMapName,
    {
      defaultValue: [],
      localStorageSource: bgWindow
    }
  );

  return (
    <div className="App">
      <PopupContext.Provider value={{ hansReResMap, setHansReResMap, bgWindow, bg }}>
        <AddRuleForm />
        <RuleList />
      </PopupContext.Provider>
    </div>
  );
};

export default PopupApp;
