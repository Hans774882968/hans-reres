import React, { MouseEvent, useContext, useState } from 'react';
import List from 'antd/es/list';
import Button from 'antd/es/button';
import message from 'antd/es/message';
import Checkbox from 'antd/es/checkbox';
import { actionDefaultResultValueMap, RequestMappingRule, RewriteType } from '../utils';
import { PopupContext } from './PopupApp';
import EditRuleForm from './EditRuleForm';
import styles from './RuleList.module.less';

const RuleList: React.FC = () => {
  const { hansReResMap, setHansReResMap } = useContext(PopupContext)!;
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [requestRuleToEdit, setRequestRuleToEdit] = useState<RequestMappingRule>({
    req: '.*hub\\.com',
    checked: true,
    action: {
      type: RewriteType.REDIRECT,
      ...actionDefaultResultValueMap[RewriteType.REDIRECT]
    }
  });

  const showEditDialog = (ruleToEdit: RequestMappingRule) => {
    setRequestRuleToEdit(ruleToEdit);
    setDialogVisible(true);
  };
  const removeRule = (ruleToRemove: RequestMappingRule) => {
    const newHansReResMap = [...hansReResMap];
    for (let i = 0;i < newHansReResMap.length;++i) {
      if (newHansReResMap[i] === ruleToRemove) {
        newHansReResMap.splice(i, 1);
      }
    }
    setHansReResMap(newHansReResMap);
    message.success('Rule removed');
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

  return (
    <>
      <List
        className={styles['rule-list']}
        itemLayout="horizontal"
        dataSource={hansReResMap}
        renderItem={(requestRule) => (
          <List.Item className={styles['rule-list-item']}>
            <div className={styles['rule-item-container']} onClick={(e) => {
              onRuleActivateStatusChange(e, requestRule);
            }}>
              <Checkbox checked={requestRule.checked} />
              <span className={styles['req']}>{requestRule.req}</span>
            </div>
            <div className={styles['btns']}>
              <Button type="primary" onClick={() => showEditDialog(requestRule)}>Edit</Button>
              <Button onClick={() => removeRule(requestRule)}>Remove</Button>
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
