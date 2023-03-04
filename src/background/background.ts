import { RequestMappingRule, isSetUAAction } from '../action-types';
import {
  getRedirectUrl,
  hansReResMapName
} from '../utils';

function getMapFromLocalStorage (): RequestMappingRule[] {
  const hansReResMap = window.localStorage.getItem(hansReResMapName);
  return hansReResMap ? JSON.parse(hansReResMap) : [];
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    details.requestHeaders && details.requestHeaders.forEach((header) => {
      if (header.name.toLowerCase() !== 'user-agent') return;
      const hansReResMap = getMapFromLocalStorage();
      hansReResMap
        .filter((requestRule) => requestRule.checked)
        .forEach((requestRule) => {
          const reg = new RegExp(requestRule.req, 'gi');
          if (!reg.test(details.url)) return;
          if (!isSetUAAction(requestRule.action)) return;
          header.value = requestRule.action.newUA;
        });
    });
    return { requestHeaders: details.requestHeaders };
  },
  { urls: ['<all_urls>'] },
  ['blocking', 'requestHeaders']
);

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const hansReResMap = getMapFromLocalStorage();
    const url = getRedirectUrl(details.url, hansReResMap);
    try {
      // Unchecked runtime.lastError: redirectUrl 'baidu.com/' is not a valid URL.
      // 针对Chrome的这种报错，我们只会尝试给出一个友好点的报错提示，不会擅自阻止报错的产生
      new URL(url);
    } catch (e) {
      console.error(`Please make sure that redirectURL '${url}' is a valid url when using hans-reres. For example, 'baidu.com' is not a valid url.`);
    }
    return url === details.url ? {} : { redirectUrl: url };
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);
