import React, { useContext } from 'react';
import Modal from 'antd/es/modal';
import {
  RequestMappingRule,
  FlatRequestMappingRule,
  transformIntoFlatRequestMappingRule,
  transformIntoRequestMappingRule
} from '../utils';
import AddRuleForm from './AddRuleForm';
import { PopupContext } from './PopupApp';

interface Props {
  visible: boolean
  requestRule: RequestMappingRule
  setDialogVisible: (visible: boolean) => void
}

const EditRuleForm: React.FC<Props> = (props) => {
  const { hansReResMap, setHansReResMap } = useContext(PopupContext)!;
  const { visible, requestRule, setDialogVisible } = props;
  const flatRequestRule = transformIntoFlatRequestMappingRule(requestRule);
  const handleSubmitSuccess = (newFlatRequestRule: FlatRequestMappingRule) => {
    const newHansReResMap = [...hansReResMap];
    const newRequestRule = transformIntoRequestMappingRule(newFlatRequestRule);
    for (let i = 0; i < newHansReResMap.length; ++i) {
      if (newHansReResMap[i] === requestRule) {
        newHansReResMap.splice(i, 1, newRequestRule);
      }
    }
    setHansReResMap(newHansReResMap);
    setDialogVisible(false);
  };

  return (
    <Modal
      title="Edit Rule"
      open={visible}
      width={800}
      okButtonProps={{ style: { display: 'none' }}}
      cancelButtonProps={{ style: { display: 'none' }}}
      onCancel={() => setDialogVisible(false)}
    >
      <AddRuleForm ruleToEdit={flatRequestRule} onFinish={handleSubmitSuccess} />
    </Modal>
  );
};

export default EditRuleForm;
