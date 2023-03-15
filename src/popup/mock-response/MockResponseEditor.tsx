import { $gt } from '@/i18n/i18n-init';
import { FlatRequestMappingRule, ResponseType, dataTypeToDefaultValue } from '@/action-types';
import { FormInstance } from 'antd/es/form/hooks/useForm';
import { beautifyCSS, beautifyJS, beautifyJSON, beautifyXML } from './beautify';
import { isSubSequence } from '@/utils';
import Button from 'antd/es/button';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import React from 'react';
import Select from 'antd/es/select';

interface Props {
  addRuleForm: FormInstance<FlatRequestMappingRule>
}

const responseOptions = Object.values(ResponseType).map(action => ({ label: action, value: action }));

const MockResponseEditor: React.FC<Props> = (props) => {
  const { addRuleForm } = props;
  const requestRuleDataTypeFieldValue = Form.useWatch('dataType', addRuleForm);
  const requestRuleValueFieldValue = Form.useWatch('value', addRuleForm);
  const showBeautifyJSONBtn = requestRuleDataTypeFieldValue === ResponseType.JSON;
  const showBeautifyJSBtn = requestRuleDataTypeFieldValue === ResponseType.JS;
  const showBeautifyCSSBtn = requestRuleDataTypeFieldValue === ResponseType.CSS;
  const showBeautifyXMLBtn = requestRuleDataTypeFieldValue === ResponseType.XML;
  const showBeautifyHTMLBtn = requestRuleDataTypeFieldValue === ResponseType.HTML;

  const valueShouldBeValidJSONMessage = $gt('Response text should be a valid JSON string.');
  const responseValueRule = [
    ...(showBeautifyJSONBtn ? [{
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
    }] : [])
  ];

  const changeResponseType = (dataType: ResponseType) => {
    addRuleForm.setFieldValue('value', dataTypeToDefaultValue[dataType]);
  };

  const beautifyJSONBtnHandler = () => {
    const { result, hasError } = beautifyJSON(requestRuleValueFieldValue);
    if (!hasError) {
      addRuleForm.setFieldValue('value', result);
    }
  };

  const beautifyJSBtnHandler = () => {
    const { result, hasError } = beautifyJS(requestRuleValueFieldValue);
    if (!hasError) {
      addRuleForm.setFieldValue('value', result);
    }
  };

  const beautifyCSSBtnHandler = () => {
    const { result, hasError } = beautifyCSS(requestRuleValueFieldValue);
    if (!hasError) {
      addRuleForm.setFieldValue('value', result);
    }
  };

  const beautifyXMLBtnHandler = () => {
    const { result, hasError } = beautifyXML(requestRuleValueFieldValue);
    if (!hasError) {
      addRuleForm.setFieldValue('value', result);
    }
  };

  return (
    <>
      <Form.Item label={$gt('Response Type')} name="dataType">
        <Select
          placeholder={$gt('Please select')}
          options={responseOptions}
          onChange={changeResponseType}
          showSearch={true}
          optionFilterProp="children"
          filterOption={(input, option) => isSubSequence(option ? option.label : '', input)}
        />
      </Form.Item>

      <Form.Item label={$gt('Value')}>
        <Form.Item name="value" rules={responseValueRule}>
          <Input.TextArea
            rows={10}
            placeholder={$gt('Please input response')}
            allowClear
          />
        </Form.Item>

        {/* TODO：为什么Button原先存在，后来消失就会报错？即不能这么写：{showBeautifyJSONBtn && <Button>btn</Button>} */}
        <Button
          style={{ display: showBeautifyJSONBtn ? undefined : 'none' }}
          onClick={beautifyJSONBtnHandler}
        >
          {$gt('Beautify {{language}}', { language: 'JSON' })}
        </Button>

        <Button
          style={{ display: showBeautifyJSBtn ? undefined : 'none' }}
          onClick={beautifyJSBtnHandler}
        >
          {$gt('Beautify {{language}}', { language: 'JS' })}
        </Button>

        <Button
          style={{ display: showBeautifyCSSBtn ? undefined : 'none' }}
          onClick={beautifyCSSBtnHandler}
        >
          {$gt('Beautify {{language}}', { language: 'CSS' })}
        </Button>

        <Button
          style={{ display: showBeautifyXMLBtn ? undefined : 'none' }}
          onClick={beautifyXMLBtnHandler}
        >
          {$gt('Beautify {{language}}', { language: 'XML' })}
        </Button>

        <Button
          style={{ display: showBeautifyHTMLBtn ? undefined : 'none' }}
          onClick={beautifyXMLBtnHandler}
        >
          {$gt('Beautify {{language}}', { language: 'HTML' })}
        </Button>
      </Form.Item>
    </>
  );
};

export default MockResponseEditor;
