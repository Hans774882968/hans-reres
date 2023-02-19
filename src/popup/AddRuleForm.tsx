import React, { useContext, useState } from 'react';
import Button from 'antd/es/button';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import Tooltip from 'antd/es/tooltip';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';
import { getRedirectType, RequestMappingRule } from '../utils';
import { PopupContext } from './PopupApp';
import './AddRuleForm.css';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
};

const redirectTypeLayout = {
  wrapperCol: { span: 16 }
};

const btnLayout = {
  wrapperCol: { offset: 6, span: 16 }
};

const AddRuleForm: React.FC = () => {
  const { hansReResMap, setHansReResMap, bg } = useContext(PopupContext);
  const curRule = {
    req: '.*hub\\.com',
    res: 'https://baidu.com'
  };
  const [addRuleForm] = Form.useForm<RequestMappingRule>();
  const rules = {
    req: [
      { required: true, message: 'Request url to be redirected should not be empty' },
      {
        validator (rule: object, value: string) {
          return new Promise<void>((resolve, reject) => {
            try {
              new RegExp(value);
              resolve();
            } catch (e) {
              reject('Request url to be redirected should be a valid regex');
            }
          });
        }
      }
    ],
    res: [
      { required: true, message: 'Response url should not be empty' }
    ]
  };
  const [curRuleFields, setCurRuleFields] = useState(curRule);

  const redirectTypeIntro = 'Protocol of your response url, such as: http, file';

  const onAddRuleFormChange = (addRuleForm: RequestMappingRule) => {
    setCurRuleFields({ ...curRuleFields, ...addRuleForm });
  };
  const onResponseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addRuleForm.setFieldValue('redirectType', e.target.value.substring(0, 4));
  };
  const onFinish = (requestRule: RequestMappingRule) => {
    const newHansReResMap = [...hansReResMap];
    newHansReResMap.push(requestRule);
    setHansReResMap(newHansReResMap);
    if (!bg) {
      message.warning('Save rule to window.localStorage instead💔');
    } else {
      message.success('Save Success❤');
    }
  };
  const onReset = () => {
    addRuleForm.setFieldsValue(curRule);
    onAddRuleFormChange(addRuleForm.getFieldsValue());
  };
  const clearLocalStorage = () => {
    setHansReResMap([]);
    message.success('Clear success');
  };

  return (
    <div className="add-rule-form">
      <Form
        {...formLayout}
        form={addRuleForm}
        name="addRuleForm"
        initialValues={curRule}
        onFinish={onFinish}
        onValuesChange={onAddRuleFormChange}
        autoComplete="off"
      >
        <Form.Item label="If URL match" name="req" rules={rules.req}>
          <Input
            allowClear
            type="text"
            placeholder="Input request url to redirect"
          />
        </Form.Item>

        <Form.Item label="Response URL" name="res" rules={rules.res}>
          <Input
            allowClear
            type="text"
            placeholder="Input response url"
            onChange={onResponseUrlChange}
          />
        </Form.Item>

        <Form.Item
          {...redirectTypeLayout}
          label="Redirect type"
        >
          <span className="redirect-type">{getRedirectType(curRuleFields.res)}</span>
          <Tooltip placement="right" title={redirectTypeIntro}>
            <QuestionCircleOutlined />
          </Tooltip>
        </Form.Item>

        <Form.Item {...btnLayout}>
          <Button className="btn" type="primary" htmlType="submit">
            Submit
          </Button>
          <Button className="btn" htmlType="button" onClick={onReset}>
            Reset Form
          </Button>
          <Button className="btn" htmlType="button" onClick={clearLocalStorage}>
            Clear localStorage
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddRuleForm;
