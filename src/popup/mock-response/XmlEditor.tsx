import { ResponseType } from '@/action-types';
import { beautifyXML } from './beautify';
import { useAddRuleFormContext } from '../AddRuleFormContext';
import CodeMirror from './CodeMirror';
import Form from 'antd/es/form';
import React from 'react';

const XmlEditor: React.FC = () => {
  const { addRuleForm } = useAddRuleFormContext()!;
  const requestRuleValueFieldValue = Form.useWatch('value', addRuleForm);

  const beautifyXMLBtnHandler = () => {
    const { result, hasError } = beautifyXML(requestRuleValueFieldValue);
    if (!hasError) {
      addRuleForm.setFieldValue('value', result);
    }
  };

  return (
    <CodeMirror lang={ResponseType.XML} beautifyHandler={beautifyXMLBtnHandler} />
  );
};

export default XmlEditor;
