import { $gt } from '@/i18n/i18n-init';
import { FlatRequestMappingRule, ResponseType } from '@/action-types';
import { FormInstance } from 'antd/es/form/hooks/useForm';
import { beautifyJS } from './beautify';
import Button from 'antd/es/button';
import CodeMirror from './CodeMirror';
import Form from 'antd/es/form';
import React from 'react';

interface Props {
  addRuleForm: FormInstance<FlatRequestMappingRule>
}

const JsEditor: React.FC<Props> = (props) => {
  const { addRuleForm } = props;
  const requestRuleValueFieldValue = Form.useWatch('value', addRuleForm);

  const beautifyJSBtnHandler = () => {
    const { result, hasError } = beautifyJS(requestRuleValueFieldValue);
    if (!hasError) {
      addRuleForm.setFieldValue('value', result);
    }
  };

  return (
    <Form.Item
      label={$gt('Value')}
      name="value"
      valuePropName="code"
    >
      <CodeMirror lang={ResponseType.JS}>
        <Button onClick={beautifyJSBtnHandler}>
          {$gt('Beautify {{language}}', { language: ResponseType.JS })}
        </Button>
      </CodeMirror>
    </Form.Item>
  );
};

export default JsEditor;
