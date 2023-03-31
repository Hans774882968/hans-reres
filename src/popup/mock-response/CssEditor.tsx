import { ResponseType } from '@/action-types';
import { beautifyCSS } from './beautify';
import { useAddRuleFormContext } from '../AddRuleFormContext';
import CodeMirror from './CodeMirror';
import Form from 'antd/es/form';
import React from 'react';

const CssEditor: React.FC = () => {
  const { addRuleForm } = useAddRuleFormContext()!;
  const requestRuleValueFieldValue = Form.useWatch('value', addRuleForm);

  const beautifyCSSBtnHandler = () => {
    const { result, hasError } = beautifyCSS(requestRuleValueFieldValue);
    if (!hasError) {
      addRuleForm.setFieldValue('value', result);
    }
  };

  return (
    <CodeMirror lang={ResponseType.CSS} beautifyHandler={beautifyCSSBtnHandler} />
  );
};

export default CssEditor;
