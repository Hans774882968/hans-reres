import { $gt } from '@/i18n/i18n-init';
import { FlatRequestMappingRule, ResponseType, dataTypeToDefaultValue } from '@/action-types';
import { FormInstance } from 'antd/es/form/hooks/useForm';
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
  const showBeautifyBtn = requestRuleDataTypeFieldValue === ResponseType.JSON;

  const valueShouldBeValidJSONMessage = $gt('Response text should be a valid JSON string.');
  const responseValueRule = [
    ...(showBeautifyBtn ? [{
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

  const beautifyJSON = () => {
    try {
      const result = JSON.stringify(JSON.parse(requestRuleValueFieldValue), null, '  ');
      addRuleForm.setFieldValue('value', result);
    } catch (e) {}
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
        {/* TODO：为什么Button原先存在，后来消失就会报错？即不能这么写：{showBeautifyBtn && <Button>btn</Button>} */}
        <Button
          style={{ display: showBeautifyBtn ? undefined : 'none' }}
          onClick={beautifyJSON}
        >
          {$gt('Beautify JSON')}
        </Button>
      </Form.Item>
    </>
  );
};

export default MockResponseEditor;
