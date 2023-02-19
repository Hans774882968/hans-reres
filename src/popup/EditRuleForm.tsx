import React from 'react';
import Modal from 'antd/es/modal';
import { RequestMappingRule } from '../utils';

interface Props {
  visible: boolean
  requestRule: RequestMappingRule | null
  setVisibleFunc: (visible: boolean) => void
}

const EditRuleForm: React.FC<Props> = (props) => {
  const { visible, requestRule, setVisibleFunc } = props;
  const handleSubmit = () => {
    setVisibleFunc(false);
  };
  // TODO
  return (
    <Modal
      title="Edit Rule"
      open={visible}
      okText="Confirm"
      onCancel={() => setVisibleFunc(false)}
      onOk={() => handleSubmit()}
    >
      { requestRule ? (
        <>
          <p>{requestRule.req}</p>
          <p>{requestRule.res}</p>
        </>
      ) : null
      }
    </Modal>
  );
};

export default EditRuleForm;
