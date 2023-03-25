import { $gt } from '@/i18n/i18n-init';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import React from 'react';

const TextEditor: React.FC = () => {
  return (
    <Form.Item label={$gt('Value')} name="value">
      <Input.TextArea
        rows={10}
        placeholder={('Please input response')}
        allowClear
      />
    </Form.Item>
  );
};

export default TextEditor;
