import {
  ActionDescription,
  HeadersMap,
  MockHttpHeader,
  MockUploadData,
  PostBodyParamAction,
  ProcessHeadersReturn,
  QueryParamAction,
  RedirectAction,
  ReqHeaderAction,
  RequestMappingRule,
  RespHeaderAction,
  ResponseType,
  isAddQueryParamAction,
  isAddReqHeaderAction,
  isAddRespHeaderAction,
  isBlockRequestAction,
  isDeleteQueryParamAction,
  isDeleteReqHeaderAction,
  isDeleteRespHeaderAction,
  isMockResponseAction,
  isModifyQueryParamAction,
  isModifyReqHeaderAction,
  isModifyRespHeaderAction,
  isPostBodyParamAction,
  isQueryParamAction,
  isRedirectAction,
  isReqHeaderAction,
  isRespHeaderAction,
  isSetUAAction,
  plainObject
} from './action-types';
import { isPlainObject } from 'lodash-es';
import isValidJson from './is-valid-json';
import xhr from './xhr';

export const hansReResMapName = 'hansReResMap';

export const getRedirectType = (res: string) => {
  if (!res) return 'unknown';
  if (res.startsWith('file://')) return 'file';
  if (res.length <= 3) return 'unknown';
  return 'http';
};

export function filterRulesForHeaderListener (url: string, hansReResMap: RequestMappingRule[]) {
  return hansReResMap
    .filter((requestRule) => requestRule.checked)
    .filter((requestRule) => {
      const reg = new RegExp(requestRule.req, 'gi');
      return reg.test(url);
    });
}

export function mapToHttpHeaderArray (mp: HeadersMap): MockHttpHeader[] {
  return [...mp.entries()].map(([name, value]) => ({ name, value }));
}

export function getHeadersMap (headers: MockHttpHeader[]) {
  return new Map(headers.map(header => [header.name, header.value || '']));
}

export function modifyHeaders (headersMap: HeadersMap, action: ReqHeaderAction | RespHeaderAction) {
  if (isAddReqHeaderAction(action) || isAddRespHeaderAction(action)) {
    headersMap.set(action.name, action.value);
  }
  if ((isModifyReqHeaderAction(action) || isModifyRespHeaderAction(action)) && headersMap.has(action.name)) {
    headersMap.set(action.name, action.value);
  }
  if (isDeleteReqHeaderAction(action) || isDeleteRespHeaderAction(action)) {
    headersMap.delete(action.name);
  }
}

export function modifyQueryParams (queryParams: URLSearchParams, action: QueryParamAction) {
  if (isAddQueryParamAction(action)) {
    queryParams.set(action.name, action.value);
  }
  if (isModifyQueryParamAction(action) && queryParams.has(action.name)) {
    queryParams.set(action.name, action.value);
  }
  if (isDeleteQueryParamAction(action)) {
    queryParams.delete(action.name);
  }
}

export function parsePostBody (rawData: MockUploadData[] | undefined): plainObject[] {
  if (!rawData) return [];
  return rawData.filter((item) => {
    let strData = '';
    try {
      strData = new TextDecoder().decode(item.bytes);
    } catch (e) {
      return false;
    }
    if (!isValidJson(strData)) return false;
    const obj = JSON.parse(strData);
    if (!isPlainObject(obj)) return false;
    return true;
  }).map((item) => JSON.parse(new TextDecoder().decode(item.bytes)));
}

export function shouldPostBodyParamsBlock (postBodyList: plainObject[], action: PostBodyParamAction) {
  return postBodyList.reduce((res, postBody) => {
    return res || Object.hasOwnProperty.call(postBody, action.name);
  }, false);
}

// 约定： requestRules 是 filterRulesForHeaderListener 筛过的
export function processHeaders (
  requestRules: RequestMappingRule[],
  headersMap: HeadersMap,
  isRequest: boolean
) {
  const returnObject: ProcessHeadersReturn = {
    headersModified: false,
    requestHeadersMap: isRequest ? headersMap : new Map<string, string>(),
    responseHeadersMap: !isRequest ? headersMap : new Map<string, string>()
  };
  requestRules.forEach((requestRule) => {
    const action = requestRule.action;
    if (!isReqHeaderAction(action) && !isRespHeaderAction(action)) return;
    const modifyObject = isReqHeaderAction(action) ? returnObject.requestHeadersMap : returnObject.responseHeadersMap;
    modifyHeaders(modifyObject, action);
    returnObject.headersModified = true;
  });
  return returnObject;
}

export function processUserAgent (
  requestRules: RequestMappingRule[],
  headersMap: HeadersMap,
  requestHeaders: MockHttpHeader[]
) {
  const returnObject: ProcessHeadersReturn = {
    headersModified: false,
    requestHeadersMap: headersMap,
    responseHeadersMap: new Map<string, string>()
  };
  requestHeaders.forEach((header) => {
    if (header.name.toLowerCase() !== 'user-agent') return;
    requestRules.forEach((requestRule) => {
      const action = requestRule.action;
      if (!isSetUAAction(action)) return;
      headersMap.set(header.name, action.newUA);
      returnObject.headersModified = true;
    });
  });
  return returnObject;
}

export function overrideQueryParams (urlObject: URL, redirectUrl: string, action: RedirectAction) {
  if (!action.keepQueryParams) return redirectUrl;
  try {
    const redirectUrlObject = new URL(redirectUrl);
    redirectUrlObject.search = urlObject.search;
    redirectUrl = redirectUrlObject.toString();
  } catch (e) {
    console.error('overrideQueryParams() error', e);
  }
  return redirectUrl;
}

const dataTypeToSupportedDataProtocolType: Record<ResponseType, string> = {
  [ResponseType.JSON]: 'json',
  [ResponseType.CSS]: 'css',
  [ResponseType.JS]: 'js',
  [ResponseType.XML]: 'xml',
  [ResponseType.HTML]: 'html',
  [ResponseType.OTHER]: 'text'
};

export function processRequest (url: string, hansReResMap: RequestMappingRule[], postBodyList?: plainObject[]): ActionDescription {
  const urlObject = new URL(url);
  const actionDescription: ActionDescription = {
    postBodyParamsShouldBlock: false,
    queryParams: new URLSearchParams(urlObject.search),
    urlObject
  };
  let redirectUrl = url;

  hansReResMap
    .filter((requestRule) => requestRule.checked)
    .forEach((requestRule) => {
      /* TODO：这里是用不断迭代的 redirectUrl 来过滤的，所以cancel的规则出现在重定向的规则之后，
       *  就可能被忽略。改成和request-interceptor一样，用标签页url来过滤，就没有这个奇怪的feature了。
       */
      const reg = new RegExp(requestRule.req, 'gi');
      if (!reg.test(redirectUrl)) return;

      const action = requestRule.action;
      if (isBlockRequestAction(action)) {
        actionDescription.cancel = true;
      }
      if (isPostBodyParamAction(action)) {
        actionDescription.postBodyParamsShouldBlock = actionDescription.postBodyParamsShouldBlock || shouldPostBodyParamsBlock(postBodyList || [], action);
      }
      if (isMockResponseAction(action)) {
        const supportedDataProtocolType = dataTypeToSupportedDataProtocolType[action.dataType];
        actionDescription.redirectUrl = getDataProtocolString(action.value, supportedDataProtocolType);
      }
      if (isRedirectAction(action)) {
        if (/^file:\/\//.test(action.res)) {
          do {
            redirectUrl = redirectUrl.replace(reg, action.res);
            redirectUrl = getLocalFileUrl(redirectUrl);
          } while (reg.test(redirectUrl));
        } else {
          do {
            redirectUrl = redirectUrl.replace(reg, action.res);
          } while (reg.test(redirectUrl));
        }
        redirectUrl = overrideQueryParams(urlObject, redirectUrl, action);
        actionDescription.redirectUrl = redirectUrl;
      }
      if (isQueryParamAction(action)) {
        modifyQueryParams(actionDescription.queryParams, action);
        actionDescription.queryParamsModified = true;
      }
    });

  return actionDescription;
}

const typeMap = {
  'css': 'text/css',
  'gif': 'image/gif',
  'html': 'text/html',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'text/javascript',
  'json': 'text/json',
  'png': 'image/png',
  'txt': 'text/plain',
  'webp': 'image/webp',
  'xml': 'text/xml'
};

export function getDataProtocolString (content: string, type: string) {
  content = encodeURIComponent(
    type === 'js' ?
      content.replace(/[\u0080-\uffff]/g, ($0: string) => {
        const str = $0.charCodeAt(0).toString(16);
        return '\\u' + '00000'.substring(0, 4 - str.length) + str;
      }) : content
  );
  // TODO：ReRes遗留问题：图片能重定向，但最终的数据无法显示。但我还没有解决。
  if (['jpg', 'jpeg', 'png'].includes(type)) {
    const b64result = btoa(content);
    return `data:${typeMap[type as 'jpg' | 'jpeg' | 'png']};base64,${b64result}`;
  }
  return `data:${
    type in typeMap ? typeMap[type as keyof typeof typeMap] : typeMap.txt
  };charset=utf-8,${content}`;
}

export function getLocalFileUrl (url: string) {
  const arr = url.split('.');
  let type = arr[arr.length - 1];
  let content: string | Document | null = '';
  try {
    content = xhr(url);
  } catch (e) {
    content = '{ "retcode": -404, "message": "Sorry to tell you that the request to local file failed. The possible reason is that the local file does not exist. -- from chrome plugin hans-reres", "data": null }';
    type = 'json';
  }
  if (typeof content !== 'string') {
    return '';
  }
  return getDataProtocolString(content, type);
}

export const isSubSequence = (long: string, short: string) => {
  if (!short) return true;
  if (long.length < short.length) return false;
  const longStr = long.toLowerCase();
  const shortStr = short.toLowerCase();
  if (longStr.length === shortStr.length && longStr !== shortStr) return false;
  let j = 0;
  for (let i = 0;i < longStr.length;++i) {
    if (longStr[i] !== shortStr[j]) continue;
    ++j;
    if (j === shortStr.length) return true;
  }
  return j === shortStr.length;
};
