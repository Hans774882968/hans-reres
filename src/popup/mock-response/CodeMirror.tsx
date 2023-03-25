import { $gt } from '@/i18n/i18n-init';
import { ResponseType } from '@/action-types';
import { bespin } from '@uiw/codemirror-theme-bespin';
import { css } from '@codemirror/lang-css';
import { gruvboxDark } from '@uiw/codemirror-theme-gruvbox-dark';
import { html } from '@codemirror/lang-html';
import { isSubSequence } from '@/utils';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import CodeMirrorReact from '@uiw/react-codemirror';
import React, { ReactNode } from 'react';
import Select from 'antd/es/select';
import styles from './CodeMirror.module.less';
import useLocalStorageState from '@/hooks/useLocalStorageState';

type MockExtension = {
  extension: MockExtension;
} | readonly MockExtension[];

interface Props {
  children?: ReactNode
  lang: ResponseType
  code?: string;
  onChange?: (jsonString: string) => void
}

// TODO：目前编辑器支持jsx但美化器不支持
const extensionsMap: Record<ResponseType, MockExtension[]> = {
  [ResponseType.JSON]: [json()],
  [ResponseType.JS]: [javascript({ jsx: true })],
  [ResponseType.CSS]: [css()],
  [ResponseType.XML]: [xml()],
  [ResponseType.HTML]: [html()],
  [ResponseType.OTHER]: []
};

type supportedTheme = 'bespin' | 'gruvboxDark';

const themesMap: Record<supportedTheme, MockExtension> = {
  bespin,
  gruvboxDark
};
const editorThemeOptions = [
  { label: 'bespin', value: 'bespin' },
  { label: 'gruvbox-dark', value: 'gruvboxDark' }
];

const preferResponseEditorTheme = 'preferResponseEditorTheme';

const CodeMirror: React.FC<Props> = (props) => {
  const { lang, code, onChange } = props;
  const [currentEditorTheme, setCurrentEditorTheme] = useLocalStorageState<supportedTheme>(
    preferResponseEditorTheme, { defaultValue: 'bespin' }
  );

  const onCodeChange = (newCode: string) => {
    onChange && onChange(newCode);
  };
  // TODO：（1）有一个无伤大雅的样式bug：dialog里的编辑器的行号会缩在一起。（2）Select在表单校验不通过时样式应不变。
  return (
    <div>
      <div className={styles.toolbarContainer}>
        <div className={styles.toolbar}>
          {props.children}
          {/* 期望特性：dialog的编辑器主题和表单的编辑器主题会联动 */}
          <Select
            placeholder={$gt('Please select')}
            value={currentEditorTheme}
            options={editorThemeOptions}
            onChange={setCurrentEditorTheme}
            showSearch={true}
            optionFilterProp="children"
            filterOption={(input, option) => isSubSequence(option ? option.label : '', input)}
          />
        </div>
      </div>

      <CodeMirrorReact
        maxHeight="300px"
        theme={themesMap[currentEditorTheme]}
        value={code}
        extensions={extensionsMap[lang]}
        onChange={onCodeChange}
      />
    </div>
  );
};

export default CodeMirror;
