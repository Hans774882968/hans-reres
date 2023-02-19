import { RequestMappingRule } from './utils';
import getLocalFileUrl from './get-local-file-url';

export default function getRedirectUrl (url: string, hansReResMap: RequestMappingRule[]) {
  hansReResMap.forEach((requestRule: RequestMappingRule) => {
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
