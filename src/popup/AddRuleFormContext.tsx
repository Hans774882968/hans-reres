import { FlatRequestMappingRule } from '@/action-types';
import { FormInstance } from 'antd/es/form/hooks/useForm';
import Form from 'antd/es/form';
import React, { ReactNode, createContext, useContext } from 'react';

type ContextType = {
  addRuleForm: FormInstance<FlatRequestMappingRule>
} | null;

const AddRuleFormContext = createContext<ContextType>(null);

interface Props {
  children?: ReactNode
}

export const AddRuleFormProvider: React.FC<Props> = (props) => {
  const { children } = props;
  const [addRuleForm] = Form.useForm<FlatRequestMappingRule>();

  return (
    <AddRuleFormContext.Provider
      value={{
        addRuleForm
      }}
    >
      {children}
    </AddRuleFormContext.Provider>
  );
};

export const useAddRuleFormContext = () => {
  return useContext(AddRuleFormContext);
};
