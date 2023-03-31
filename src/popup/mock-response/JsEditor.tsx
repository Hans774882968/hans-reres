import { ResponseType } from '@/action-types';
import { beautifyJS } from './beautify';
import { useAddRuleFormContext } from '../AddRuleFormContext';
import CodeMirror from './CodeMirror';
import Form from 'antd/es/form';
import React from 'react';

const JsEditor: React.FC = () => {
  const { addRuleForm } = useAddRuleFormContext()!;
  const requestRuleValueFieldValue = Form.useWatch('value', addRuleForm);

  const beautifyJSBtnHandler = () => {
    const { result, hasError } = beautifyJS(requestRuleValueFieldValue);
    if (!hasError) {
      addRuleForm.setFieldValue('value', result);
    }
  };

  return (
    <CodeMirror lang={ResponseType.JS} beautifyHandler={beautifyJSBtnHandler} />
  );
};

export default JsEditor;
