import xhr from './xhr';

export const hansReResMapName = 'hansReResMap';

export enum RewriteType {
  SET_UA = 'Set UA',
  REDIRECT = 'Redirect',
  ADD_QUERY_PARAM = 'Add Query Param'
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

export interface RedirectAction extends Action{
  res: string
}

export interface SetUAAction extends Action {
  newUA: string
}

export interface AddQueryParamAction extends Action{
  name: string
  value: string
}

export function isRedirectAction (o: Action): o is RedirectAction {
  return o.type === RewriteType.REDIRECT;
}

export function isSetUAAction (o: Action): o is SetUAAction {
  return o.type === RewriteType.SET_UA;
}

export function isAddQueryParamAction (o: Action): o is AddQueryParamAction {
  return o.type === RewriteType.ADD_QUERY_PARAM;
}

export const actionDefaultResultValueMap = {
  [RewriteType.REDIRECT]: { res: 'https://baidu.com' },
  [RewriteType.SET_UA]: { newUA: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5' },
  [RewriteType.ADD_QUERY_PARAM]: { name: 'role', value: 'acmer' }
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

export const getRedirectType = (res: string) => {
  if (!res) return 'unknown';
  if (res.startsWith('file://')) return 'file';
  if (res.length <= 3) return 'unknown';
  return 'http';
};

export function getRedirectUrl (url: string, hansReResMap: RequestMappingRule[]) {
  let redirectUrl = url;

  hansReResMap
    .filter((requestRule) => requestRule.checked)
    .forEach((requestRule) => {
      const reg = new RegExp(requestRule.req, 'gi');
      if (!reg.test(redirectUrl)) return;

      if (isRedirectAction(requestRule.action)) {
        if (/^file:\/\//.test(requestRule.action.res)) {
          do {
            redirectUrl = redirectUrl.replace(reg, requestRule.action.res);
            redirectUrl = getLocalFileUrl(redirectUrl);
          } while (reg.test(redirectUrl));
        } else {
          do {
            redirectUrl = redirectUrl.replace(reg, requestRule.action.res);
          } while (reg.test(redirectUrl));
        }
      }
      if (isAddQueryParamAction(requestRule.action)) {
        const urlObj = new URL(redirectUrl);
        const queryParams = urlObj.searchParams;
        queryParams.set(requestRule.action.name, requestRule.action.value);
        urlObj.search = queryParams.toString();
        redirectUrl = urlObj.toString();
      }
    });

  return redirectUrl;
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
