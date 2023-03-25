import { $gt } from '@/i18n/i18n-init';
import { FlatRequestMappingRule, ResponseType } from '@/action-types';
import { FormInstance } from 'antd/es/form/hooks/useForm';
import { beautifyXML } from './beautify';
import Button from 'antd/es/button';
import CodeMirror from './CodeMirror';
import Form from 'antd/es/form';
import React from 'react';

interface Props {
  addRuleForm: FormInstance<FlatRequestMappingRule>
}

const XmlEditor: React.FC<Props> = (props) => {
  const { addRuleForm } = props;
  const requestRuleValueFieldValue = Form.useWatch('value', addRuleForm);

  const beautifyXMLBtnHandler = () => {
    const { result, hasError } = beautifyXML(requestRuleValueFieldValue);
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
      <CodeMirror lang={ResponseType.XML}>
        <Button onClick={beautifyXMLBtnHandler}>
          {$gt('Beautify {{language}}', { language: ResponseType.XML })}
        </Button>
      </CodeMirror>
    </Form.Item>
  );
};

export default XmlEditor;
