import { AddRuleFormProvider } from './AddRuleFormContext';
import { GlobalDataProvider } from './GlobalDataContext';
import { ThemeProvider } from './ThemeContext';
import AddRuleForm from './AddRuleForm';
import Layout from 'antd/es/layout';
import Navbar from './Navbar';
import React, { KeyboardEvent } from 'react';
import RuleGroupCard from './RuleGroupCard';
import RuleList from './RuleList';
import styles from './PopupApp.module.less';

const PopupApp: React.FC = () => {
  // TODO：模拟浏览器全局搜索功能
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!e.metaKey || e.code !== 'KeyF') return;
    e.preventDefault();
  };

  return (
    <ThemeProvider>
      <GlobalDataProvider>
        <Layout className={styles.app} onKeyDown={onKeyDown}>
          <Navbar />
          <div className={styles.popupBodyContainer}>
            <AddRuleFormProvider>
              <AddRuleForm ruleToEdit={null} showClearStorageBtn={true} />
            </AddRuleFormProvider>
            <div className={styles.ruleListContainer}>
              <div className={styles.ruleGroupCardContainer}>
                <RuleGroupCard />
              </div>
              <div className={styles.ruleListComponentContainer}>
                <RuleList />
              </div>
            </div>
          </div>
        </Layout>
      </GlobalDataProvider>
    </ThemeProvider>
  );
};

export default PopupApp;
