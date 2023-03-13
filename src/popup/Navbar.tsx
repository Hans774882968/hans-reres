import { ThemeContext } from './PopupApp';
import Col from 'antd/es/col';
import React, { useContext } from 'react';
import Row from 'antd/es/row';
import Select from 'antd/es/select';
import Switch from 'antd/es/switch';
import i18n, { $gt, langOptions } from '@/i18n/i18n-init';
import icon48 from '../assets/icon48.png';
import styles from './Navbar.module.less';

const Navbar: React.FC = () => {
  const { curClassNamePrefix, preferDarkTheme, setPreferDarkTheme } = useContext(ThemeContext)!;
  const changeLang = (langValue: string) => {
    i18n.changeLanguage(langValue);
  };

  return (
    <header>
      <Row className={styles[`${curClassNamePrefix}-navbar`]}>
        <Col span={6}>
          {/* 多套一层div，修复 flex-gap-polyfill 导致同一行右侧的元素产生偏移的bug */}
          <div className={styles.navbarCol}>
            <img src={icon48} alt="icon48.png" />
            <span className={styles[`${curClassNamePrefix}-plugin-name`]}>hans-reres</span>
          </div>
        </Col>

        <Col className={styles.navbarCol}>
          <Select
            className={styles.selectLang}
            defaultValue={i18n.resolvedLanguage}
            placeholder={$gt('Select language')}
            options={langOptions}
            onChange={changeLang}
          />
          <Switch
            checkedChildren="暗黑"
            unCheckedChildren="默认"
            defaultChecked={preferDarkTheme}
            onChange={setPreferDarkTheme}
          />
        </Col>
      </Row>
    </header>
  );
};

export default Navbar;
