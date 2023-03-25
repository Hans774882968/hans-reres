import { $gt } from '@/i18n/i18n-init';
import { FlatRequestMappingRule, ResponseType, dataTypeToDefaultValue } from '@/action-types';
import { FormInstance } from 'antd/es/form/hooks/useForm';
import { isSubSequence } from '@/utils';
import CssEditor from './CssEditor';
import Form from 'antd/es/form';
import HtmlEditor from './HtmlEditor';
import JsEditor from './JsEditor';
import JsonEditor from './JsonEditor';
import React from 'react';
import Select from 'antd/es/select';
import TextEditor from './TextEditor';
import XmlEditor from './XmlEditor';

interface Props {
  addRuleForm: FormInstance<FlatRequestMappingRule>
}

const responseOptions = Object.values(ResponseType).map(action => ({ label: action, value: action }));

const MockResponseEditor: React.FC<Props> = (props) => {
  const { addRuleForm } = props;
  const requestRuleDataTypeFieldValue = Form.useWatch('dataType', addRuleForm);

  const changeResponseType = (dataType: ResponseType) => {
    addRuleForm.setFieldValue('value', dataTypeToDefaultValue[dataType]);
  };

  const editorsMap: Record<ResponseType, JSX.Element> = {
    [ResponseType.JSON]: <JsonEditor addRuleForm={addRuleForm} />,
    [ResponseType.JS]: <JsEditor addRuleForm={addRuleForm} />,
    [ResponseType.CSS]: <CssEditor addRuleForm={addRuleForm} />,
    [ResponseType.HTML]: <HtmlEditor addRuleForm={addRuleForm} />,
    [ResponseType.XML]: <XmlEditor addRuleForm={addRuleForm} />,
    [ResponseType.OTHER]: <TextEditor />
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
      {/* 补充结论：上一版Button原先存在再消失会报错是因为 $gt */}
      {
        editorsMap[requestRuleDataTypeFieldValue]
      }
    </>
  );
};

export default MockResponseEditor;
