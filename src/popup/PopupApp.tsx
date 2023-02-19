import React, { createContext, useState } from 'react';
import AddRuleForm from './AddRuleForm';
import RuleList from './RuleList';
import './PopupApp.css';
import { getHansReResMap, RequestMappingRule } from '../utils';

const bg = chrome?.extension?.getBackgroundPage();
const bgWindow = bg || window;
export const PopupContext = createContext<{
  hansReResMap: RequestMappingRule[],
  setHansReResMap: (rule: RequestMappingRule[]) => void,
  bgWindow: Window
    }>({
      hansReResMap: [],
      setHansReResMap: (rules: RequestMappingRule[]) => {},
      bgWindow
    });

const PopupApp: React.FC = () => {
  const [hansReResMap, setHansReResMap] = useState(getHansReResMap(bgWindow));

  return (
    <div className="App">
      <PopupContext.Provider value={{ hansReResMap, setHansReResMap, bgWindow }}>
        <AddRuleForm bg={bg} />
        <RuleList />
      </PopupContext.Provider>
    </div>
  );
};

export default PopupApp;
