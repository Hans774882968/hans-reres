export enum RewriteType {
  SET_UA = 'Set UA',
  REDIRECT = 'Redirect',
  BLOCK_REQUEST = 'Block Request',
  ADD_QUERY_PARAM = 'Add Query Param',
  MODIFY_QUERY_PARAM = 'Modify Query Param',
  DELETE_QUERY_PARAM = 'Delete Query Param',
  ADD_REQ_HEADER = 'Add Req Header',
  MODIFY_REQ_HEADER = 'Modify Req Header',
  DELETE_REQ_HEADER = 'Delete Req Header',
  ADD_RESP_HEADER = 'Add Resp Header',
  MODIFY_RESP_HEADER = 'Modify Resp Header',
  DELETE_RESP_HEADER = 'Delete Resp Header',
}

export interface RequestMappingRule {
  req: string
  action: Action
  checked: boolean
}

export interface FlatRequestMappingRule {
  req: string
  checked: boolean
  action: RewriteType
  res: string
  newUA: string
  name: string
  value: string
}

export interface Action {
  type: RewriteType
}

export interface RedirectAction extends Action {
  res: string
}

export interface SetUAAction extends Action {
  newUA: string
}

export type BlockRequestAction = Action

export interface AddQueryParamAction extends Action {
  name: string
  value: string
}

export interface ModifyQueryParamAction extends Action {
  name: string
  value: string
}

export interface DeleteQueryParamAction extends Action {
  name: string
}

export interface AddReqHeaderAction extends Action {
  name: string
  value: string
}

export interface ModifyReqHeaderAction extends Action {
  name: string
  value: string
}

export interface DeleteReqHeaderAction extends Action {
  name: string
}

export interface AddRespHeaderAction extends Action {
  name: string
  value: string
}

export interface ModifyRespHeaderAction extends Action {
  name: string
  value: string
}

export interface DeleteRespHeaderAction extends Action {
  name: string
}

export function isRedirectAction (o: Action): o is RedirectAction {
  return o.type === RewriteType.REDIRECT;
}

export function isSetUAAction (o: Action): o is SetUAAction {
  return o.type === RewriteType.SET_UA;
}

export function isBlockRequestAction (o: Action): o is BlockRequestAction {
  return o.type === RewriteType.BLOCK_REQUEST;
}

export function isAddQueryParamAction (o: Action): o is AddQueryParamAction {
  return o.type === RewriteType.ADD_QUERY_PARAM;
}

export function isModifyQueryParamAction (o: Action): o is ModifyQueryParamAction {
  return o.type === RewriteType.MODIFY_QUERY_PARAM;
}

export function isDeleteQueryParamAction (o: Action): o is DeleteQueryParamAction {
  return o.type === RewriteType.DELETE_QUERY_PARAM;
}

export function isAddReqHeaderAction (o: Action): o is AddReqHeaderAction {
  return o.type === RewriteType.ADD_REQ_HEADER;
}

export function isModifyReqHeaderAction (o: Action): o is ModifyReqHeaderAction {
  return o.type === RewriteType.MODIFY_REQ_HEADER;
}

export function isDeleteReqHeaderAction (o: Action): o is DeleteReqHeaderAction {
  return o.type === RewriteType.DELETE_REQ_HEADER;
}

export function isAddRespHeaderAction (o: Action): o is AddRespHeaderAction {
  return o.type === RewriteType.ADD_RESP_HEADER;
}

export function isModifyRespHeaderAction (o: Action): o is ModifyRespHeaderAction {
  return o.type === RewriteType.MODIFY_RESP_HEADER;
}

export function isDeleteRespHeaderAction (o: Action): o is DeleteRespHeaderAction {
  return o.type === RewriteType.DELETE_RESP_HEADER;
}

export const actionDefaultResultValueMap = {
  [RewriteType.REDIRECT]: { res: 'https://baidu.com' },
  [RewriteType.SET_UA]: { newUA: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5' },
  [RewriteType.BLOCK_REQUEST]: {},
  [RewriteType.ADD_QUERY_PARAM]: { name: 'role', value: 'acmer' },
  [RewriteType.MODIFY_QUERY_PARAM]: { name: 'rate', value: '2400' },
  [RewriteType.DELETE_QUERY_PARAM]: { name: 'param_to_delete' },
  [RewriteType.ADD_REQ_HEADER]: { name: 'X-Role', value: 'ctfer' },
  [RewriteType.MODIFY_REQ_HEADER]: { name: 'X-Rate', value: '2400' },
  [RewriteType.DELETE_REQ_HEADER]: { name: 'Request-Header' },
  [RewriteType.ADD_RESP_HEADER]: { name: 'Y-Role', value: 'acmer' },
  [RewriteType.MODIFY_RESP_HEADER]: { name: 'Y-Rate', value: '2400' },
  [RewriteType.DELETE_RESP_HEADER]: { name: 'Response-Header' }
};

export function transformIntoRequestMappingRule (o: FlatRequestMappingRule): RequestMappingRule {
  const action: Action = (() => {
    if (o.action === RewriteType.REDIRECT) return { res: o.res, type: o.action };
    if (o.action === RewriteType.SET_UA) return { newUA: o.newUA, type: o.action };
    return { name: o.name, type: o.action, value: o.value };
  })();
  return {
    action,
    checked: o.checked,
    req: o.req
  };
}

export function transformIntoFlatRequestMappingRule (o: RequestMappingRule): FlatRequestMappingRule {
  const ret: FlatRequestMappingRule = {
    action: o.action.type,
    checked: o.checked,
    name: '',
    newUA: '',
    req: o.req,
    res: '',
    value: ''
  };
  return { ...ret, ...o.action };
}
