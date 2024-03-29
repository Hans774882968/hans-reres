import { $gt } from '@/i18n/i18n-init';
import { CHROME_DATA_LENGTH_LIMIT, getByteLength, getMockResponseData, isSubSequence } from '@/utils';
import { ResponseType } from '@/action-types';
import { Rule } from 'rc-field-form/lib/interface';
import { ThemeClassNamePrefix, useThemeContext } from '../ThemeContext';
import { bespin } from '@uiw/codemirror-theme-bespin';
import { css } from '@codemirror/lang-css';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { gruvboxDark, gruvboxLight } from '@uiw/codemirror-theme-gruvbox-dark';
import { html } from '@codemirror/lang-html';
import { isMac, isWindows } from '@/get-platform';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { solarizedDark, solarizedLight } from '@uiw/codemirror-theme-solarized';
import { useAddRuleFormContext } from '../AddRuleFormContext';
import { xml } from '@codemirror/lang-xml';
import Button from 'antd/es/button';
import CodeMirrorReact from '@uiw/react-codemirror';
import Form from 'antd/es/form';
import React, { KeyboardEvent } from 'react';
import Select from 'antd/es/select';
import humps from 'humps';
import styles from './CodeMirror.module.less';
import useLocalStorageState from '@/hooks/useLocalStorageState';

type MockExtension = {
  extension: MockExtension;
} | readonly MockExtension[];

interface Props {
  lang: ResponseType
  beautifyHandler?: () => void
  responseValueRule?: Rule[]
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

type supportedTheme = 'bespin' | 'gruvboxDark' | 'gruvboxLight' |
  'githubDark' | 'githubLight' | 'solarizedDark' | 'solarizedLight';

const themesMap: Record<supportedTheme, MockExtension> = {
  bespin,
  githubDark,
  githubLight,
  gruvboxDark,
  gruvboxLight,
  solarizedDark,
  solarizedLight
};
const editorThemeMap: Record<ThemeClassNamePrefix, Array<supportedTheme>> = {
  [ThemeClassNamePrefix.DARK]: ['bespin', 'gruvboxDark', 'githubDark', 'solarizedDark'],
  [ThemeClassNamePrefix.DEFAULT]: ['gruvboxLight', 'githubLight', 'solarizedLight']
};
const editorThemeOptionsMap: Record<ThemeClassNamePrefix, Array<{ label: string, value: supportedTheme }>> = {
  [ThemeClassNamePrefix.DARK]: editorThemeMap[ThemeClassNamePrefix.DARK].map((item) => ({ label: humps.decamelize(item, { separator: '-' }), value: item })),
  [ThemeClassNamePrefix.DEFAULT]: editorThemeMap[ThemeClassNamePrefix.DEFAULT].map((item) => ({ label: humps.decamelize(item, { separator: '-' }), value: item }))
};
const themeClassName2defaultEditorTheme: Record<ThemeClassNamePrefix, supportedTheme> = {
  [ThemeClassNamePrefix.DARK]: 'githubDark',
  [ThemeClassNamePrefix.DEFAULT]: 'gruvboxLight'
};

function getActualCurrentEditorTheme (
  curClassNamePrefix: ThemeClassNamePrefix,
  currentEditorTheme: supportedTheme,
  editorThemeDefault: supportedTheme
) {
  return editorThemeMap[curClassNamePrefix].includes(currentEditorTheme) ? currentEditorTheme : editorThemeDefault;
}

const preferResponseEditorTheme = 'preferResponseEditorTheme';

interface InnerProps {
  code?: string;
  onChange?: (codeString: string) => void
  lang: ResponseType
  beautifyHandler?: () => void
}

// TODO：耗时任务添加loading状态
const CodeMirrorInner: React.FC<InnerProps> = (props) => {
  const { code, onChange, lang, beautifyHandler } = props;
  const { addRuleForm } = useAddRuleFormContext()!;
  const { curClassNamePrefix } = useThemeContext()!;
  const editorThemeDefault = themeClassName2defaultEditorTheme[curClassNamePrefix];
  const [currentEditorTheme, setCurrentEditorTheme] = useLocalStorageState<supportedTheme>(
    preferResponseEditorTheme, { defaultValue: editorThemeDefault }
  );

  const onCodeChange = (newCode: string) => {
    onChange && onChange(newCode);
  };
  const beauty = async () => {
    beautifyHandler && beautifyHandler();
    addRuleForm.validateFields(); // addRuleForm.setField 没有触发校验执行，手动触发一下
  };
  const onBeautyBtnClick = () => {
    beauty();
  };
  // 快捷键 command+s 格式化
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!((isWindows() && e.ctrlKey) || (isMac() && e.metaKey)) || e.code !== 'KeyS') return;
    e.preventDefault();
    beauty();
  };

  const actualCurrentEditorTheme = getActualCurrentEditorTheme(curClassNamePrefix, currentEditorTheme, editorThemeDefault);

  return (
    <div onKeyDown={onKeyDown}>
      <div className={styles.toolbarContainer}>
        <div className={styles.toolbar}>
          <Button onClick={onBeautyBtnClick}>
            {$gt('Beautify {{language}}', { language: lang })}
          </Button>
          {/* 期望特性：dialog的编辑器主题和添加规则表单的编辑器主题能联动 */}
          <Select
            placeholder={$gt('Please select')}
            value={actualCurrentEditorTheme}
            options={editorThemeOptionsMap[curClassNamePrefix]}
            onChange={setCurrentEditorTheme}
            showSearch={true}
            optionFilterProp="children"
            filterOption={(input, option) => isSubSequence(option ? option.label : '', input)}
          />
        </div>
      </div>

      <CodeMirrorReact
        maxHeight="400px"
        theme={themesMap[actualCurrentEditorTheme]}
        value={code}
        extensions={extensionsMap[lang]}
        onChange={onCodeChange}
      />
    </div>
  );
};

const CodeMirror: React.FC<Props> = (props) => {
  const { responseValueRule, lang, beautifyHandler } = props;
  const { addRuleForm } = useAddRuleFormContext()!;
  const requestRuleDataTypeFieldValue = Form.useWatch('dataType', addRuleForm);

  const dataLengthTooLargeMessage = $gt('The length of the data protocol URL should meet the limit of the Chrome');
  const finalResponseValueRule = [
    ...(responseValueRule || []),
    {
      validator (rule: object, value: string) {
        const len = getByteLength(getMockResponseData(value, requestRuleDataTypeFieldValue));
        if (len > CHROME_DATA_LENGTH_LIMIT) return Promise.reject(`${dataLengthTooLargeMessage} (${len} bytes / 2MB).`);
        return Promise.resolve();
      }
    }
  ];

  // TODO：（1）有一个无伤大雅的样式bug：dialog里的编辑器的行号会缩在一起。（2）Select在表单校验不通过时样式应不变。
  return (
    <Form.Item
      label={$gt('Value')}
      name="value"
      rules={finalResponseValueRule}
      valuePropName="code"
    >
      <CodeMirrorInner
        lang={lang}
        beautifyHandler={beautifyHandler}
      />
    </Form.Item>
  );
};

export default CodeMirror;
