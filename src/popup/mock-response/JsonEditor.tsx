import { $gt } from '@/i18n/i18n-init';
import { ResponseType } from '@/action-types';
import { beautifyJSON } from './beautify';
import { useAddRuleFormContext } from '../AddRuleFormContext';
import CodeMirror from './CodeMirror';
import Form from 'antd/es/form';
import React from 'react';

const JsonEditor: React.FC = () => {
  const { addRuleForm } = useAddRuleFormContext()!;
  const requestRuleValueFieldValue = Form.useWatch('value', addRuleForm);

  const valueShouldBeValidJSONMessage = $gt('Response text should be a valid JSON string.');
  const responseValueRule = [
    {
      validator (rule: object, value: string) {
        return new Promise<void>((resolve, reject) => {
          try {
            JSON.parse(value);
            resolve();
          } catch (e) {
            reject(valueShouldBeValidJSONMessage);
          }
        });
      }
    }
  ];

  const beautifyJSONBtnHandler = () => {
    const { result, hasError } = beautifyJSON(requestRuleValueFieldValue);
    if (!hasError) {
      addRuleForm.setFieldValue('value', result);
    }
  };

  // TODO：不能指定 trigger 属性，会导致表单 rules 校验不能触发
  return (
    <CodeMirror
      lang={ResponseType.JSON}
      beautifyHandler={beautifyJSONBtnHandler}
      responseValueRule={responseValueRule}
    />
  );
};

export default JsonEditor;
