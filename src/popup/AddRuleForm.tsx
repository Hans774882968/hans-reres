import React, { useContext, useState } from 'react';
import Button from 'antd/es/button';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import Tooltip from 'antd/es/tooltip';
import Select from 'antd/es/select';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';
import {
  getRedirectType,
  isSubSequence,
  RequestMappingRule,
  RewriteType
} from '../utils';
import { PopupContext } from './PopupApp';
import styles from './AddRuleForm.module.less';

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

function getActionOptions () {
  return Object.values(RewriteType).map(action => ({ label: action, value: action }));
}

const AddRuleForm: React.FC<Props> = (props) => {
  const { hansReResMap, setHansReResMap, bg } = useContext(PopupContext)!;
  const actionDefaultResultValueMap = {
    [RewriteType.REDIRECT]: 'https://baidu.com',
    [RewriteType.SET_HEADER]: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5'
  };
  const initialRule: RequestMappingRule = props.ruleToEdit || {
    req: '.*hub\\.com',
    action: RewriteType.REDIRECT,
    res: actionDefaultResultValueMap[RewriteType.REDIRECT],
    checked: true
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
    action: [
      { required: true, message: 'You should choose an action' }
    ],
    res: [
      { required: true, message: 'Response url should not be empty' },
      { min: 4, message: 'Response url must be at least 4 characters' }
    ]
  };
  const requestRuleResultFieldValue = Form.useWatch('res', addRuleForm);
  const requestRuleActionFieldValue = Form.useWatch('action', addRuleForm);

  const handleExpectedActionChange = (newAction: RewriteType) => {
    addRuleForm.setFieldValue('res', actionDefaultResultValueMap[newAction]);
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
    addRuleForm.resetFields();
  };
  const clearLocalStorage = () => {
    setHansReResMap([]);
    message.success('Clear success');
  };

  const reqUrlTooltip = (
    <>
      <Tooltip placement="top" title={reqUrlIntro}>
        <QuestionCircleOutlined className={styles['request-url-tooltip-icon']} />
      </Tooltip>
      If URL match
    </>
  );
  const respUrlTooltip = (
    <>
      <Tooltip placement="top" title={respUrlIntro}>
        <QuestionCircleOutlined className={styles['response-url-tooltip-icon']} />
      </Tooltip>
      Response URL
    </>
  );
  const actionFieldMap = {
    [RewriteType.REDIRECT]: (
      <>
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
          <span className={styles['redirect-type']}>
            {getRedirectType(requestRuleResultFieldValue)}
          </span>
          <Tooltip placement="right" title={redirectTypeIntro}>
            <QuestionCircleOutlined />
          </Tooltip>
        </Form.Item>
      </>
    ),
    [RewriteType.SET_HEADER]: (
      <Form.Item label="New Header" name="res" rules={rules.res}>
        <Input.TextArea rows={2} placeholder="Input new header" />
      </Form.Item>
    )
  };

  return (
    <div className={styles['add-rule-form']}>
      <Form
        {...formLayout}
        form={addRuleForm}
        name="addRuleForm"
        initialValues={initialRule}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item label={reqUrlTooltip} name="req" rules={rules.req}>
          <Input
            allowClear
            type="text"
            placeholder="Input request url to redirect"
          />
        </Form.Item>

        <Form.Item label="Action" name="action" rules={rules.action}>
          <Select
            placeholder="Select action"
            options={getActionOptions()}
            onChange={(newAction: RewriteType) => handleExpectedActionChange(newAction)}
            showSearch={true}
            optionFilterProp="children"
            filterOption={(input, option) => isSubSequence(option ? option.label : '', input)}
          />
        </Form.Item>

        {
          actionFieldMap[requestRuleActionFieldValue]
        }

        <div style={{ display: 'none' }}>
          <Form.Item name="checked"><div></div></Form.Item>
        </div>

        <Form.Item {...btnLayout}>
          <Button className={styles['btn']} type="primary" htmlType="submit">
            Submit
          </Button>
          <Button className={styles['btn']} htmlType="button" onClick={onReset}>
            Reset Form
          </Button>
          {
            props.showClearStorageBtn ? (
              <Button className={styles['btn']} htmlType="button" onClick={clearLocalStorage}>
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
