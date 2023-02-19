import React, { useContext, useState } from 'react';
import List from 'antd/es/list';
import Button from 'antd/es/button';
import message from 'antd/es/message';
import { RequestMappingRule } from '../utils';
import { PopupContext } from './PopupApp';
import EditRuleForm from './EditRuleForm';
import './RuleList.css';

const RuleList: React.FC = () => {
  const { hansReResMap, setHansReResMap } = useContext(PopupContext);
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [requestRuleToEdit, setRequestRuleToEdit] = useState<RequestMappingRule | null>(null);

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

  return (
    <>
      <List
        className="rule-list"
        itemLayout="horizontal"
        dataSource={hansReResMap}
        renderItem={(requestRule) => (
          <List.Item className="rule-list-item">
            <span className="req">{requestRule.req}</span>
            <div className="btns">
              <Button type="primary" onClick={() => showEditDialog(requestRule)}>Edit</Button>
              <Button onClick={() => removeRule(requestRule)}>Remove</Button>
            </div>
          </List.Item>
        )}
      />
      <EditRuleForm
        visible={isDialogVisible}
        requestRule={requestRuleToEdit}
        setVisibleFunc={(visible: boolean) => setDialogVisible(visible)}
      />
    </>
  );
};

export default RuleList;
