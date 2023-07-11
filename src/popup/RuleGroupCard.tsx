import { $gt } from '@/i18n/i18n-init';
import { RuleGroup } from '@/action-types';
import { useThemeContext } from '@/popup/ThemeContext';
import List from 'antd/es/list';
import React from 'react';
import Tooltip from 'antd/es/tooltip';
import styles from './RuleGroupCard.module.less';

const mockData: {ruleGroups: RuleGroup[]} = {
  ruleGroups: [
    { description: 'desc1', enabled: true, name: 'xxx' },
    { description: 'desc2', enabled: true, name: 'yyy' },
    { description: 'desc3', enabled: true, name: 'zzz' },
    { description: 'long long long long longlonglonglonglong1longlonglonglonglonglonglonglonglong1longlonglonglonglonglonglonglonglong1longlonglonglong  desc4', enabled: true, name: 'long long long long longlonglonglonglong1longlonglonglonglonglonglonglonglong1longlonglonglonglonglonglonglonglong1longlonglonglong title' }
  ]
};

function getTooltipTitle (item: RuleGroup) {
  return `${item.name} - ${item.description}`;
}

const RuleGroupCard: React.FC = () => {
  const { curClassNamePrefix } = useThemeContext()!;

  return (
    <List
      className={styles.ruleGroupCard}
      dataSource={mockData.ruleGroups}
      renderItem={(item) => (
        <Tooltip placement="top" title={getTooltipTitle(item)}>
          <List.Item className={styles[`${curClassNamePrefix}-rule-group-item`]}>
            <span className={styles.preventOverflow}>{item.name}</span>
          </List.Item>
        </Tooltip>
      )}
    />
  );
};

export default RuleGroupCard;
