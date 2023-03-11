import { $gt } from '@/i18n/i18n-init';
import {
  FlatRequestMappingRule,
  RequestMappingRule,
  transformIntoFlatRequestMappingRule,
  transformIntoRequestMappingRule
} from '@/action-types';
import { PopupContext } from './PopupApp';
import AddRuleForm from './AddRuleForm';
import Modal from 'antd/es/modal';
import React, { useContext } from 'react';
import message from 'antd/es/message';

interface Props {
  visible: boolean
  requestRule: RequestMappingRule
  setDialogVisible: (visible: boolean) => void
}

const EDIT_DIALOG_WIDTH = 700;
const ANT_MODAL_CONTENT_PADDING = 24;
const EDIT_FORM_WIDTH = EDIT_DIALOG_WIDTH - 2 * ANT_MODAL_CONTENT_PADDING;

const EditRuleForm: React.FC<Props> = (props) => {
  const { hansReResMap, setHansReResMap } = useContext(PopupContext)!;
  const { visible, requestRule, setDialogVisible } = props;
  const flatRequestRule = transformIntoFlatRequestMappingRule(requestRule);
  const editSuccessMessage = $gt('Edit Success❤');

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
    message.success(editSuccessMessage);
  };

  return (
    <Modal
      title={$gt('Edit Rule')}
      open={visible}
      width={EDIT_DIALOG_WIDTH}
      okButtonProps={{ style: { display: 'none' }}}
      cancelButtonProps={{ style: { display: 'none' }}}
      onCancel={() => setDialogVisible(false)}
    >
      <AddRuleForm minWidth={EDIT_FORM_WIDTH} ruleToEdit={flatRequestRule} onFinish={handleSubmitSuccess} />
    </Modal>
  );
};

export default EditRuleForm;
