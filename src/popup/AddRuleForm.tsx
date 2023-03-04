import { $gt } from '../i18n/i18n-init';
import {
  FlatRequestMappingRule,
  RewriteType,
  actionDefaultResultValueMap,
  transformIntoRequestMappingRule
} from '../action-types';
import { PopupContext } from './PopupApp';
import {
  getRedirectType,
  isSubSequence
} from '../utils';
import Button from 'antd/es/button';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';
import React, { useContext } from 'react';
import Select from 'antd/es/select';
import Tooltip from 'antd/es/tooltip';
import message from 'antd/es/message';
import styles from './AddRuleForm.module.less';

interface Props {
  ruleToEdit: FlatRequestMappingRule | null
  minWidth?: number
  onFinish?: (requestRule: FlatRequestMappingRule) => unknown
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
const reqUrlIntro = 'Request URL to match. It should be a regex.';
const respUrlIntro = 'Response URL. It can start with \'file://\' to represent a local file.';

function getActionOptions () {
  return Object.values(RewriteType).map(action => ({ label: action, value: action }));
}

const AddRuleForm: React.FC<Props> = (props) => {
  const { hansReResMap, setHansReResMap, bg } = useContext(PopupContext)!;

  const initialRule: FlatRequestMappingRule = props.ruleToEdit || {
    action: RewriteType.REDIRECT,
    checked: true,
    name: '',
    newUA: '',
    req: '.*hub\\.com',
    res: actionDefaultResultValueMap[RewriteType.REDIRECT].res,
    value: ''
  };
  const [addRuleForm] = Form.useForm<FlatRequestMappingRule>();
  const requestURLShouldBeRegexMessage = $gt('Request url to be redirected should be a valid regex');
  const rules = {
    action: [
      { message: $gt('You should choose an action'), required: true }
    ],
    name: [
      { message: $gt('Field name should not be empty'), required: true }
    ],
    newUA: [
      { message: $gt('New User Agent should not be empty'), required: true }
    ],
    req: [
      { message: $gt('Request url to be redirected should not be empty'), required: true },
      {
        validator (rule: object, value: string) {
          return new Promise<void>((resolve, reject) => {
            try {
              new RegExp(value);
              resolve();
            } catch (e) {
              reject(requestURLShouldBeRegexMessage);
            }
          });
        }
      }
    ],
    res: [
      { message: $gt('Response url should not be empty'), required: true },
      { message: $gt('Response url must be at least 4 characters'), min: 4 }
    ],
    value: [
      { message: $gt('Field value should not be empty'), required: true }
    ]
  };
  const requestRuleResultFieldValue = Form.useWatch('res', addRuleForm);
  const requestRuleActionFieldValue = Form.useWatch('action', addRuleForm);

  const handleExpectedActionChange = (newAction: RewriteType) => {
    addRuleForm.setFieldsValue({ ...actionDefaultResultValueMap[newAction] });
  };
  const saveToWindowLSMessage = $gt('Save rule to window.localStorage instead💔');
  const saveSuccessMessage = $gt('Save Success❤');
  const clearSuccessMessage = $gt('Clear success');
  const onFinish = props.onFinish || ((flatRequestRule: FlatRequestMappingRule) => {
    const newHansReResMap = [...hansReResMap];
    const requestRule = transformIntoRequestMappingRule(flatRequestRule);
    newHansReResMap.push(requestRule);
    setHansReResMap(newHansReResMap);
    if (!bg) {
      message.warning(saveToWindowLSMessage);
    } else {
      message.success(saveSuccessMessage);
    }
  });
  const onReset = () => {
    addRuleForm.resetFields();
  };
  const clearLocalStorage = () => {
    setHansReResMap([]);
    message.success(clearSuccessMessage);
  };

  const reqUrlTooltip = (
    <>
      <Tooltip placement="top" title={$gt(reqUrlIntro)}>
        <QuestionCircleOutlined className={styles['request-url-tooltip-icon']} />
      </Tooltip>
      {$gt('If URL match')}
    </>
  );
  const respUrlTooltip = (
    <>
      <Tooltip placement="top" title={$gt(respUrlIntro)}>
        <QuestionCircleOutlined className={styles['response-url-tooltip-icon']} />
      </Tooltip>
      {$gt('Response URL')}
    </>
  );
  function getNameValueFormFields (nameFieldPlaceholder: string, valueFieldPlaceholder: string) {
    return (
      <>
        <Form.Item label={$gt('Name')} name="name" rules={rules.name}>
          <Input
            allowClear
            type="text"
            placeholder={nameFieldPlaceholder}
          />
        </Form.Item>

        <Form.Item label={$gt('Value')} name="value" rules={rules.value}>
          <Input
            allowClear
            type="text"
            placeholder={valueFieldPlaceholder}
          />
        </Form.Item>
      </>
    );
  }
  function getNameFormField (nameFieldPlaceholder: string) {
    return (
      <Form.Item label={$gt('Name')} name="name" rules={rules.name}>
        <Input
          allowClear
          type="text"
          placeholder={nameFieldPlaceholder}
        />
      </Form.Item>
    );
  }
  const actionFieldMap = {
    [RewriteType.REDIRECT]: (
      <>
        <Form.Item label={respUrlTooltip} name="res" rules={rules.res}>
          <Input
            allowClear
            type="text"
            placeholder={$gt('Input response url')}
          />
        </Form.Item>

        <Form.Item
          {...redirectTypeLayout}
          label={$gt('Redirect Type')}
        >
          <span className={styles['redirect-type']}>
            {getRedirectType(requestRuleResultFieldValue)}
          </span>
          <Tooltip placement="right" title={$gt(redirectTypeIntro)}>
            <QuestionCircleOutlined />
          </Tooltip>
        </Form.Item>
      </>
    ),
    [RewriteType.SET_UA]: (
      <Form.Item label={$gt('New User Agent')} name="newUA" rules={rules.newUA}>
        <Input.TextArea rows={2} placeholder={$gt('Input new User Agent')} />
      </Form.Item>
    ),
    [RewriteType.BLOCK_REQUEST]: null,
    [RewriteType.ADD_QUERY_PARAM]: getNameValueFormFields(
      $gt('Input param name'), $gt('Input param value')
    ),
    [RewriteType.MODIFY_QUERY_PARAM]: getNameValueFormFields(
      $gt('Input param name'), $gt('Input param value')
    ),
    [RewriteType.DELETE_QUERY_PARAM]: getNameFormField($gt('Input param name')),
    [RewriteType.ADD_REQ_HEADER]: getNameValueFormFields(
      $gt('Input request header key'), $gt('Input request header value')
    ),
    [RewriteType.MODIFY_REQ_HEADER]: getNameValueFormFields(
      $gt('Input request header key'), $gt('Input request header value')
    ),
    [RewriteType.DELETE_REQ_HEADER]: getNameFormField($gt('Input request header key')),
    [RewriteType.ADD_RESP_HEADER]: getNameValueFormFields(
      $gt('Input response header key'), $gt('Input response header value')
    ),
    [RewriteType.MODIFY_RESP_HEADER]: getNameValueFormFields(
      $gt('Input response header key'), $gt('Input response header value')
    ),
    [RewriteType.DELETE_RESP_HEADER]: getNameFormField($gt('Input response header key'))
  };

  return (
    <div style={{ minWidth: props.minWidth }} className={styles['add-rule-form']}>
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
            placeholder={$gt('Input request url to match')!}
          />
        </Form.Item>

        <Form.Item label={$gt('Action')} name="action" rules={rules.action}>
          <Select
            placeholder={$gt('Select action')}
            options={getActionOptions()}
            onChange={handleExpectedActionChange}
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
            {$gt('Submit')}
          </Button>
          <Button className={styles['btn']} htmlType="button" onClick={onReset}>
            {$gt('Reset Form')}
          </Button>
          {
            props.showClearStorageBtn ? (
              <Button className={styles['btn']} htmlType="button" onClick={clearLocalStorage}>
                {$gt('Clear localStorage')}
              </Button>
            ) : null
          }
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddRuleForm;
