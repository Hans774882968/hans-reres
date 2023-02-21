import { hansReResMapName, getRedirectUrl } from '../utils';

function getFromLocalStorage () {
  const hansReResMap = window.localStorage.getItem(hansReResMapName);
  return hansReResMap ? JSON.parse(hansReResMap) : [];
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const hansReResMap = getFromLocalStorage();
    const url = getRedirectUrl(details.url, hansReResMap);
    return url === details.url ? {} : { redirectUrl: url };
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);
