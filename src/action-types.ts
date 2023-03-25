export enum RewriteType {
  SET_UA = 'Set UA',
  REDIRECT = 'Redirect',
  BLOCK_REQUEST = 'Block Request',
  BLOCK_IF_POST_BODY_PARAM_CONTAINS_NAME = 'Block If Post Body Param Contains Name',
  MOCK_RESPONSE = 'Mock Response',
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
  keepQueryParams: boolean
  newUA: string
  name: string
  value: string
  dataType: ResponseType
}

export interface Action {
  type: RewriteType
}

export interface RedirectAction extends Action {
  res: string
  keepQueryParams: boolean
}

export interface SetUAAction extends Action {
  newUA: string
}

export type BlockRequestAction = Action;

export interface PostBodyParamAction extends Action {
  name: string
}

export interface MockResponseAction extends Action {
  dataType: ResponseType
  value: string
}

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

export type QueryParamAction = AddQueryParamAction | ModifyQueryParamAction | DeleteQueryParamAction;

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

export type ReqHeaderAction = AddReqHeaderAction | ModifyReqHeaderAction | DeleteReqHeaderAction;

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

export type RespHeaderAction = AddRespHeaderAction | ModifyRespHeaderAction | DeleteRespHeaderAction;

export function isRedirectAction (o: Action): o is RedirectAction {
  return o.type === RewriteType.REDIRECT;
}

export function isSetUAAction (o: Action): o is SetUAAction {
  return o.type === RewriteType.SET_UA;
}

export function isBlockRequestAction (o: Action): o is BlockRequestAction {
  return o.type === RewriteType.BLOCK_REQUEST;
}

export function isPostBodyParamAction (o: Action): o is PostBodyParamAction {
  return o.type === RewriteType.BLOCK_IF_POST_BODY_PARAM_CONTAINS_NAME;
}

export function isMockResponseAction (o: Action): o is MockResponseAction {
  return o.type === RewriteType.MOCK_RESPONSE;
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

export function isQueryParamAction (o: Action): o is QueryParamAction {
  return isAddQueryParamAction(o) ||
    isModifyQueryParamAction(o) ||
    isDeleteQueryParamAction(o);
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

export function isReqHeaderAction (o: Action): o is ReqHeaderAction {
  return isAddReqHeaderAction(o) ||
    isModifyReqHeaderAction(o) ||
    isDeleteReqHeaderAction(o);
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

export function isRespHeaderAction (o: Action): o is RespHeaderAction {
  return isAddRespHeaderAction(o) ||
    isModifyRespHeaderAction(o) ||
    isDeleteRespHeaderAction(o);
}

export function newRedirectAction (res: string, keepQueryParams = false) {
  return { keepQueryParams, res, type: RewriteType.REDIRECT };
}

export function newSetUAAction (newUA: string) {
  return { newUA, type: RewriteType.SET_UA };
}

export function newMockResponseAction (dataType: ResponseType, value: string) {
  return { dataType, type: RewriteType.MOCK_RESPONSE, value };
}

export enum ResponseType {
  JSON = 'JSON',
  JS = 'JS',
  CSS = 'CSS',
  XML = 'XML',
  HTML = 'HTML',
  OTHER = 'Other'
}

export const dataTypeToDefaultValue = {
  [ResponseType.JSON]: '{ "message": "success", "retcode": 0 }',
  [ResponseType.JS]: 'function main(){console.log("hello world");}main()',
  [ResponseType.CSS]: 'body {color: red;}',
  [ResponseType.XML]: '<user id="1"><male>man</male><age>18</age></user>',
  [ResponseType.HTML]: '<h1><div><span style="font-weight: normal">hello</span> world</div></h1>',
  [ResponseType.OTHER]: ''
};

export const actionDefaultResultValueMap: Record<RewriteType, Partial<FlatRequestMappingRule>> = {
  [RewriteType.REDIRECT]: { keepQueryParams: false, res: 'https://baidu.com' },
  [RewriteType.SET_UA]: { newUA: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5' },
  [RewriteType.BLOCK_REQUEST]: {},
  [RewriteType.BLOCK_IF_POST_BODY_PARAM_CONTAINS_NAME]: { name: 'param_to_detect' },
  [RewriteType.MOCK_RESPONSE]: {
    dataType: ResponseType.JSON,
    value: dataTypeToDefaultValue[ResponseType.JSON]
  },
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

export const flatRuleInitialValue = {
  action: RewriteType.REDIRECT,
  checked: true,
  dataType: ResponseType.JSON,
  keepQueryParams: false,
  name: '',
  newUA: '',
  req: '.*hub\\.com',
  res: actionDefaultResultValueMap[RewriteType.REDIRECT].res as string,
  value: ''
};

export function transformIntoRequestMappingRule (o: FlatRequestMappingRule): RequestMappingRule {
  const action: Action = (() => {
    if (o.action === RewriteType.REDIRECT) return newRedirectAction(o.res, o.keepQueryParams);
    if (o.action === RewriteType.SET_UA) return newSetUAAction(o.newUA);
    if (o.action === RewriteType.MOCK_RESPONSE) return newMockResponseAction(o.dataType, o.value);
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
    dataType: ResponseType.JSON,
    keepQueryParams: false,
    name: '',
    newUA: '',
    req: o.req,
    res: '',
    value: ''
  };
  return { ...ret, ...o.action };
}

export type plainObject = Record<string, unknown>;

export interface ActionDescription {
  cancel?: boolean
  redirectUrl?: string
  queryParamsModified?: boolean
  urlObject: URL
  queryParams: URLSearchParams
  postBodyParamsShouldBlock?: boolean
}

export type HeadersMap = Map<string, string>;

export interface ProcessHeadersReturn {
  headersModified: boolean
  requestHeadersMap: HeadersMap
  responseHeadersMap: HeadersMap
}

export interface MockHttpHeader {
  name: string;
  value?: string | undefined;
  binaryValue?: ArrayBuffer | undefined;
}

export interface MockUploadData {
  bytes?: ArrayBuffer | undefined;
  file?: string | undefined;
}
