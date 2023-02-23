import xhr from './xhr';

export const hansReResMapName = 'hansReResMap';

export interface RequestMappingRule {
  req: string
  res: string
  checked: boolean
}

export const getRedirectType = (res: string) => {
  if (res.startsWith('file://')) return 'file';
  if (res.length <= 3) return 'unknown';
  return 'http';
};

export function getRedirectUrl (url: string, hansReResMap: RequestMappingRule[]) {
  hansReResMap
    .filter((requestRule) => requestRule.checked)
    .forEach((requestRule) => {
      const reg = new RegExp(requestRule.req, 'gi');
      if (typeof requestRule.res !== 'string' || !reg.test(url)) {
        return;
      }
      if (/^file:\/\//.test(requestRule.res)) {
        do {
          url = url.replace(reg, requestRule.res);
          url = getLocalFileUrl(url);
        } while (reg.test(url));
      } else {
        do {
          url = url.replace(reg, requestRule.res);
        } while (reg.test(url));
      }
    });
  return url;
}

const typeMap = {
  'txt': 'text/plain',
  'html': 'text/html',
  'css': 'text/css',
  'js': 'text/javascript',
  'json': 'text/json',
  'xml': 'text/xml',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'png': 'image/png',
  'webp': 'image/webp'
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
