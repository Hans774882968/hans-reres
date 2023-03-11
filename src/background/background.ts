import {
  RequestMappingRule
} from '@/action-types';
import {
  filterRulesForHeaderListener,
  getHeadersMap,
  hansReResMapName,
  mapToHttpHeaderArray,
  parsePostBody,
  processHeaders,
  processRequest,
  processUserAgent
} from '@/utils';
import WebRequestBodyDetails = chrome.webRequest.WebRequestBodyDetails;

function getMapFromLocalStorage (): RequestMappingRule[] {
  const hansReResMap = window.localStorage.getItem(hansReResMapName);
  return hansReResMap ? JSON.parse(hansReResMap) : [];
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const requestHeaders = details.requestHeaders;
    if (!requestHeaders) return {};
    const hansReResMap = getMapFromLocalStorage();
    const requestRules = filterRulesForHeaderListener(details.url, hansReResMap);

    const { headersModified: modified1, requestHeadersMap: headersMap1 } = processHeaders(requestRules, getHeadersMap(requestHeaders), true);
    const { headersModified: modified2, requestHeadersMap: headersMap2 } = processUserAgent(requestRules, headersMap1, requestHeaders);
    const headersModified = modified1 || modified2;

    if (!headersModified) return {};
    return { requestHeaders: mapToHttpHeaderArray(headersMap2) };
  },
  { urls: ['<all_urls>'] },
  ['blocking', 'requestHeaders', 'extraHeaders']
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const responseHeaders = details.responseHeaders;
    if (!responseHeaders) return {};
    const hansReResMap = getMapFromLocalStorage();
    const requestRules = filterRulesForHeaderListener(details.url, hansReResMap);

    const { headersModified, responseHeadersMap } = processHeaders(requestRules, getHeadersMap(responseHeaders), false);

    if (!headersModified) return {};
    return { responseHeaders: mapToHttpHeaderArray(responseHeadersMap) };
  },
  { urls: ['<all_urls>'] },
  ['blocking', 'responseHeaders', 'extraHeaders']
);

const onBeforeRequestListener = (details: WebRequestBodyDetails) => {
  const hansReResMap = getMapFromLocalStorage();
  const postBodyList = parsePostBody(details.requestBody?.raw);
  const actionDescription = processRequest(details.url, hansReResMap, postBodyList);

  const {
    redirectUrl = '',
    cancel,
    queryParamsModified,
    postBodyParamsShouldBlock
  } = actionDescription;
  // 约定优先级：cancel > redirect > queryParamsModified
  if (cancel) {
    return { cancel: true };
  }
  if (postBodyParamsShouldBlock) {
    return { cancel: true };
  }
  if (redirectUrl) {
    try {
      // Unchecked runtime.lastError: redirectUrl 'baidu.com/' is not a valid URL.
      // 针对Chrome的这种报错，我们只会尝试给出一个友好点的报错提示，不会擅自阻止报错的产生
      new URL(redirectUrl);
    } catch (e) {
      console.error(`Please make sure that redirectURL '${redirectUrl}' is a valid url when using hans-reres. For example, 'baidu.com' is not a valid url.`);
    }
    return redirectUrl === details.url ? {} : { redirectUrl };
  }
  if (queryParamsModified) {
    const { urlObject } = actionDescription;
    urlObject.search = actionDescription.queryParams.toString();
    return { redirectUrl: urlObject.toString() };
  }
  return {};
};

chrome.webRequest.onBeforeRequest.addListener(
  onBeforeRequestListener,
  { urls: ['<all_urls>'] },
  ['blocking', 'requestBody']
);
