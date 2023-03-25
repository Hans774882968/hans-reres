import { $gt } from '@/i18n/i18n-init';
import { FlatRequestMappingRule, ResponseType } from '@/action-types';
import { FormInstance } from 'antd/es/form/hooks/useForm';
import { beautifyCSS } from './beautify';
import Button from 'antd/es/button';
import CodeMirror from './CodeMirror';
import Form from 'antd/es/form';
import React from 'react';

interface Props {
  addRuleForm: FormInstance<FlatRequestMappingRule>
}

const CssEditor: React.FC<Props> = (props) => {
  const { addRuleForm } = props;
  const requestRuleValueFieldValue = Form.useWatch('value', addRuleForm);

  const beautifyCSSBtnHandler = () => {
    const { result, hasError } = beautifyCSS(requestRuleValueFieldValue);
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
      <CodeMirror lang={ResponseType.CSS}>
        <Button onClick={beautifyCSSBtnHandler}>
          {$gt('Beautify {{language}}', { language: ResponseType.CSS })}
        </Button>
      </CodeMirror>
    </Form.Item>
  );
};

export default CssEditor;
