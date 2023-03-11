import { $gt } from '@/i18n/i18n-init';
import { PopupContext, ThemeContext } from './PopupApp';
import { RequestMappingRule, RewriteType, actionDefaultResultValueMap } from '../action-types';
import Button from 'antd/es/button';
import Checkbox from 'antd/es/checkbox';
import EditRuleForm from './EditRuleForm';
import List from 'antd/es/list';
import React, { MouseEvent, useContext, useState } from 'react';
import message from 'antd/es/message';
import styles from './RuleList.module.less';

const RuleList: React.FC = () => {
  const { hansReResMap, setHansReResMap } = useContext(PopupContext)!;
  const { curClassNamePrefix } = useContext(ThemeContext)!;
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [requestRuleToEdit, setRequestRuleToEdit] = useState<RequestMappingRule>({
    action: {
      type: RewriteType.REDIRECT,
      ...actionDefaultResultValueMap[RewriteType.REDIRECT]
    },
    checked: true,
    req: '.*hub\\.com'
  });

  const showEditDialog = (ruleToEdit: RequestMappingRule) => {
    setRequestRuleToEdit(ruleToEdit);
    setDialogVisible(true);
  };
  const ruleRemovedMessage = $gt('Rule removed');
  const removeRule = (ruleToRemove: RequestMappingRule) => {
    const newHansReResMap = [...hansReResMap];
    for (let i = 0;i < newHansReResMap.length;++i) {
      if (newHansReResMap[i] === ruleToRemove) {
        newHansReResMap.splice(i, 1);
      }
    }
    setHansReResMap(newHansReResMap);
    message.success(ruleRemovedMessage);
  };
  const onRuleActivateStatusChange = (e: MouseEvent, requestRule: RequestMappingRule) => {
    const classList = (e.target as HTMLElement).classList;
    if (['ant-checkbox', 'ant-checkbox-inner', 'ant-checkbox-wrapper'].some((v) => classList.contains(v))) return;
    const newHansReResMap = [...hansReResMap];
    for (let i = 0;i < newHansReResMap.length;++i) {
      if (newHansReResMap[i] === requestRule) {
        requestRule.checked = !requestRule.checked;
        newHansReResMap.splice(i, 1, requestRule);
      }
    }
    setHansReResMap(newHansReResMap);
  };
  const editText = $gt('Edit');
  const removeText = $gt('Remove');

  return (
    <>
      <List
        className={styles.ruleList}
        itemLayout="horizontal"
        dataSource={hansReResMap}
        renderItem={(requestRule) => (
          <List.Item className={styles[`${curClassNamePrefix}-rule-list-item`]}>
            <div className={styles.ruleItemContainer} onClick={(e) => {
              onRuleActivateStatusChange(e, requestRule);
            }}>
              <Checkbox checked={requestRule.checked} />
              <span className={styles.req}>{requestRule.req}</span>
            </div>
            <div className={styles.btns}>
              <Button type="primary" onClick={() => showEditDialog(requestRule)}>{editText}</Button>
              <Button onClick={() => removeRule(requestRule)}>{removeText}</Button>
            </div>
          </List.Item>
        )}
      />
      {
        isDialogVisible ? (
          <EditRuleForm
            visible={isDialogVisible}
            requestRule={requestRuleToEdit}
            setDialogVisible={(visible: boolean) => setDialogVisible(visible)}
          />
        ) : null
      }
    </>
  );
};

export default RuleList;
