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

interface Props {
  ruleToEdit: RequestMappingRule | null
  onFinish?: (requestRule: RequestMappingRule) => unknown
  showClearStorageBtn?: boolean
}

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

const redirectTypeIntro = 'Automatically detect the protocol of your response url, such as: http, file.';
const reqUrlIntro = 'Request URL to redirect. It should be a regex.';
const respUrlIntro = 'Response URL. It can start with \'file://\' to represent a local file.';

const AddRuleForm: React.FC<Props> = (props) => {
  const { hansReResMap, setHansReResMap, bg } = useContext(PopupContext)!;
  const initialRule: RequestMappingRule = props.ruleToEdit || {
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
      { required: true, message: 'Response url should not be empty' },
      { min: 4, message: 'Response url must be at least 4 characters' }
    ]
  };
  const [curRuleFields, setCurRuleFields] = useState(initialRule);

  const onAddRuleFormChange = (addRuleForm: RequestMappingRule) => {
    setCurRuleFields({ ...curRuleFields, ...addRuleForm });
  };
  const onFinish = props.onFinish || ((requestRule: RequestMappingRule) => {
    const newHansReResMap = [...hansReResMap];
    newHansReResMap.push(requestRule);
    setHansReResMap(newHansReResMap);
    if (!bg) {
      message.warning('Save rule to window.localStorage instead💔');
    } else {
      message.success('Save Success❤');
    }
  });
  const onReset = () => {
    addRuleForm.setFieldsValue(initialRule);
  };
  const clearLocalStorage = () => {
    setHansReResMap([]);
    message.success('Clear success');
  };

  const reqUrlTooltip = (
    <>
      <Tooltip placement="top" title={reqUrlIntro}>
        <QuestionCircleOutlined className="request-url-tooltip-icon" />
      </Tooltip>
      If URL match
    </>
  );
  const respUrlTooltip = (
    <>
      <Tooltip placement="top" title={respUrlIntro}>
        <QuestionCircleOutlined className="response-url-tooltip-icon" />
      </Tooltip>
      Response URL
    </>
  );

  return (
    <div className="add-rule-form">
      <Form
        {...formLayout}
        form={addRuleForm}
        name="addRuleForm"
        initialValues={initialRule}
        onFinish={onFinish}
        onValuesChange={onAddRuleFormChange}
        autoComplete="off"
      >
        <Form.Item label={reqUrlTooltip} name="req" rules={rules.req}>
          <Input
            allowClear
            type="text"
            placeholder="Input request url to redirect"
          />
        </Form.Item>

        <Form.Item label={respUrlTooltip} name="res" rules={rules.res}>
          <Input
            allowClear
            type="text"
            placeholder="Input response url"
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
          {
            props.showClearStorageBtn ? (
              <Button className="btn" htmlType="button" onClick={clearLocalStorage}>
                Clear localStorage
              </Button>
            ) : null
          }
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddRuleForm;
