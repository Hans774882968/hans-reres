import { $gt } from '@/i18n/i18n-init';
import { FlatRequestMappingRule, ResponseType } from '@/action-types';
import { FormInstance } from 'antd/es/form/hooks/useForm';
import { beautifyJSON } from './beautify';
import Button from 'antd/es/button';
import CodeMirror from './CodeMirror';
import Form from 'antd/es/form';
import React from 'react';

interface Props {
  addRuleForm: FormInstance<FlatRequestMappingRule>
}

const JsonEditor: React.FC<Props> = (props) => {
  const { addRuleForm } = props;
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
    <Form.Item
      label={$gt('Value')}
      name="value"
      rules={responseValueRule}
      valuePropName="code"
    >
      <CodeMirror lang={ResponseType.JSON}>
        <Button onClick={beautifyJSONBtnHandler}>
          {$gt('Beautify {{language}}', { language: ResponseType.JSON })}
        </Button>
      </CodeMirror>
    </Form.Item>
  );
};

export default JsonEditor;
