import {
  RequestMappingRule,
  isAddQueryParamAction,
  isRedirectAction
} from './action-types';
import xhr from './xhr';

export const hansReResMapName = 'hansReResMap';

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
