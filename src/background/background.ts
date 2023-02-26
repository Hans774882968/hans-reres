import { getRedirectUrl, hansReResMapName, RequestMappingRule, RewriteType } from '../utils';

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
          if (requestRule.action !== RewriteType.SET_HEADER) return;
          header.value = requestRule.res;
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
    return url === details.url ? {} : { redirectUrl: url };
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);
