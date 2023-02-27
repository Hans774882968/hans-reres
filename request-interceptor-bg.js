/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
extension = {};

const UNSET = '_unset_';
let dataSet = UNSET;
const storageKey = '__redirect__chrome__extension__configuration__vk__';
const REPLACE_REGEX = /\$\{([^\}]+)\}/g;
let tabMap = new Map();
const countMap = new Map();

// tabMap 包含了所有标签页，仅用于 getTabURL
// https://developer.chrome.com/docs/extensions/reference/tabs/#method-query
const registerTabEventListeners = () => {
  const queryTabs = () => {
    chrome.tabs.query({}, tabs => {
      tabMap = new Map();
      tabs.forEach(tab => tabMap.set(tab.id, tab));
    });
  };

  chrome.tabs.onCreated.addListener(() => queryTabs());
  chrome.tabs.onReplaced.addListener(() => queryTabs());
  chrome.tabs.onUpdated.addListener(() => queryTabs());
  chrome.tabs.onRemoved.addListener(() => queryTabs());
};

// getTabURL 仅用于 shouldRuleGroupBeApplied
const getTabURL = tabId => {
  if (tabMap.has(tabId)) {
    return tabMap.get(tabId).url;
  }
};

const isExtensionEnabled = () => dataSet?.uiSettings?.isExtensionEnabled;

const isRuleGroupEnabled = rg => rg && rg.enabled;

const getHeadersMap = headers => {
  if (!headers) {
    return new Map();
  }
  return new Map(
    headers.map(header => [header.name, header.value])
  );
};

const toArrayOfHeaderObjects = headersMap => {
  const h = [];
  for (let entry of headersMap.entries()) {
    h.push({ name: entry[0], value: entry[1] });
  }
  return h;
};

const getRegEx = v => {
  if (v.startsWith('/')) {
    v = v.substring(1);
  }
  if (v.endsWith('/')) {
    v = v.substring(0, v.length - 1);
  }
  return new RegExp(v);
};

const getMatches = (rule, details) => {
  if (!rule || !rule.criteria) {
    return;
  }
  if (rule.criteria.condition === 'regex') {
    const regex = getRegEx(rule.criteria.value);
    return details.url.match(regex);
  }
};

const patternMatchingReplace = (str, matchObj) => {
  if (!matchObj || !str) {
    return str;
  }

  return str.replace(REPLACE_REGEX, (_, index) => {
    if (matchObj && matchObj.groups) {
      return matchObj.groups[index];
    }

    return matchObj[index];
  });
};

// ruleGroup和rule共用。因为我们注意到ruleGroup的Filter Condition可选项是rule的When Request's的子集
// param用于 shouldRuleGroupBeApplied 为标签页url，用于 shouldRuleBeApplied 为请求的url（details.url）
const isConditionMatched = (param, condition, value) => {
  if (!param || !condition || !value) {
    return true;
  }

  if (condition === 'starts-with') {
    return param.startsWith(value);
  }

  if (condition === 'contains') {
    return param.includes(value);
  }

  if (condition === 'equals') {
    return param === value;
  }

  if (condition === 'regex') {
    const regex = getRegEx(value);
    return regex.test(param);
  }

  return false;
};

const shouldRuleGroupBeApplied = (rg = {}, details) => {
  // if filter condition is not provided, rules should be applied to all requests
  if (!rg.filter) {
    return true;
  }

  if (isConditionMatched(getTabURL(details.tabId), rg.filter.condition, rg.filter.value)) {
    return true;
  }

  return false;
};

const shouldRuleBeApplied = (rule = {}, details) => {
  if (!rule.criteria) {
    return true;
  }

  if (isConditionMatched(details.url, rule.criteria.condition, rule.criteria.value)) {
    return true;
  }

  return false;
};

/* action参数是actions[i].type.split('-')[0]
action命名设计借鉴了http状态码，用第一部分的字符表示大的类别。
比如add-response-header add-request-header都是add类型的操作。
*/
const modifyHeaders = (headers, action, name, value) => {
  if (!headers || !action) {
    return;
  }
  if (action === 'add') {
    headers.set(name, value);
  } else if (action === 'modify') {
    if (headers.has(name)) {
      headers.set(name, value);
    }
  } else if (action === 'delete') {
    headers.delete(name);
  }
};

const modifyQueryParams = (params, action, name, value) => {
  if (!params || !action) {
    return;
  }
  if (action === 'add') {
    params.set(name, value);
  } else if (action === 'modify') {
    if (params.has(name)) {
      params.set(name, value);
    }
  } else if (action === 'delete') {
    params.delete(name);
  }

};

// 整个函数只是对 obj 的副作用
const applyRuleActions = (rule, details, obj) => {
  if (!rule.actions || !rule.enabled) {
    return;
  }

  // const count = countMap.get(rule.id) ?? 0;
  // countMap.set(rule.id, count + 1);

  const matches = getMatches(rule, details);

  (rule.actions || []).forEach((action) => {
    if (!action.details) {
      action.details = {};
    }

    const { type, details: { name, value }} = action;
    const updatedName = patternMatchingReplace(name, matches);
    const updatedValue = patternMatchingReplace(value, matches);

    let actionType;

    switch (type) {
      case 'block-request':
        obj.cancel = true; break;
      case 'add-request-header':
      case 'modify-request-header':
      case 'delete-request-header':
        actionType = type.split('-')[0];
        modifyHeaders(obj.requestHeaders, actionType, updatedName, updatedValue);
        obj.requestHeadersModified = true;
        break;
      case 'add-response-header':
      case 'modify-response-header':
      case 'delete-response-header':
        actionType = type.split('-')[0];
        modifyHeaders(obj.responseHeaders, actionType, updatedName, updatedValue);
        obj.responseHeadersModified = true;
        break;
      case 'add-query-param':
      case 'modify-query-param':
      case 'delete-query-param':
        actionType = type.split('-')[0];
        modifyQueryParams(obj.queryParams, actionType, updatedName, updatedValue);
        obj.queryParamsModified = true;
        break;
      case 'redirect-to':
        // Preflight requests can not be redirected
        // 请求方法为Options即为Preflight请求
        if (details.method.toLowerCase() !== 'options') {
          obj.redirectUrl = updatedValue;
        }

        break;
      case 'throttle':
        obj.redirectUrl = `https://deelay.me/${updatedValue}/${details.url}`; break;
    }

  });
};

// details是透传chrome.webRequest.onBeforeRequest.addListener提供的details对象
// 整个函数只是对 retObj 的副作用
const applyRuleGroups = (rgs = [], details, retObj) => {

  rgs.forEach(rg => {
    if (!isRuleGroupEnabled(rg)) {
      return;
    }

    if (!shouldRuleGroupBeApplied(rg, details)) {
      return;
    }

    (rg.rules || []).forEach(rule => {
      if (!shouldRuleBeApplied(rule, details)) {
        return;
      }

      applyRuleActions(rule, details, retObj);
    });
  });

  return retObj;
};

const processRequest = details => {

  if (!isExtensionEnabled()) {
    return;
  }

  const url = new URL(details.url);
  // queryParams用于query-param增删改
  const retObj = {
    queryParams: new URLSearchParams(url.search)
  };

  applyRuleGroups(dataSet.ruleGroups, details, retObj);

  if (retObj.cancel) {
    return { cancel: true };
  }

  if (retObj.redirectUrl) {
    return { redirectUrl: retObj.redirectUrl };
  }

  if (retObj.queryParamsModified) {
    url.search = retObj.queryParams.toString();
    return { redirectUrl: url.toString() };
  }
};

const processRequestHeadersListener = details => {
  if (!isExtensionEnabled()) {
    return;
  }
  const retObj = {
    requestHeaders: getHeadersMap(details.requestHeaders)
  };

  applyRuleGroups(dataSet.ruleGroups, details, retObj);

  if (retObj.requestHeadersModified) {
    return { requestHeaders: toArrayOfHeaderObjects(retObj.requestHeaders) };
  }
};

const processResponseHeadersListener = details => {
  if (!isExtensionEnabled()) {
    return;
  }
  const retObj = {
    responseHeaders: getHeadersMap(details.responseHeaders)
  };

  applyRuleGroups(dataSet.ruleGroups, details, retObj);

  if (retObj.responseHeadersModified) {
    return { responseHeaders: toArrayOfHeaderObjects(retObj.responseHeaders) };
  }
};

const registerRequestInterceptorListeners = () => {
  if (!chrome.webRequest.onBeforeRequest.hasListener(processRequest)) {
    chrome.webRequest.onBeforeRequest.addListener(
      processRequest,
      { urls: ['<all_urls>'] },
      ['blocking']
    );
  }

  if (!chrome.webRequest.onBeforeSendHeaders.hasListener(processRequestHeadersListener)) {
    chrome.webRequest.onBeforeSendHeaders.addListener(
      processRequestHeadersListener,
      { urls: ['<all_urls>'] },
      ['blocking', 'requestHeaders', 'extraHeaders']
    );
  }

  if (!chrome.webRequest.onHeadersReceived.hasListener(processResponseHeadersListener)) {
    chrome.webRequest.onHeadersReceived.addListener(
      processResponseHeadersListener,
      { urls: ['<all_urls>'] },
      ['blocking', 'responseHeaders', 'extraHeaders']
    );
  }
};

// Called when the user clicks on the browser action icon.
// 点击图标时打开index.html（即options_page页）
chrome.browserAction.onClicked.addListener(() => {
  const optionsUrl = chrome.extension.getURL('index.html');
  chrome.tabs.query({}, tabs => {
    const found = tabs.some(tab => {
      if (tab.url === optionsUrl) {
        chrome.tabs.update(tab.id, { 'selected': true });
        return true;
      }
    });

    if (!found) {
      chrome.tabs.create({ url: 'index.html' });
    }
  });
});

/* 获取用于请求修改的数据结构。
{
    ruleGroups: [
        {
            enabled: true,
            filter: {
                condition: 'contains',
                key: 'page-url', // 从options_page来看是定值
                value: ''
            },
            rules: [
                {
                    actions: [
                        { details: { name: 'key', value: 'value' }, type: 'add-response-header' },
                        { details: { value: '<url>' }, type: 'redirect-to' }
                    ],
                    criteria: {
                        condition: 'contains',
                        key: 'url', // 从options_page来看是定值
                        value: '<url>'
                    }
                    enabled: true
                }
            ]
        }
    ]
}
*/
const readDataSet = () => {
  chrome.storage.local.get(storageKey, config => {
    dataSet = {};
    Object.assign(dataSet, (config || {})[storageKey] || {});
  });
};

//region: external-methods
// options_page 的规则数据从background page加载，见main.js
extension.getDataSet = () => {
  let timer, maxTrials = 20;
  return new Promise((resolve, reject) => {
    readDataSet();
    timer = setInterval(() => {
      if (dataSet !== UNSET) {
        clearInterval(timer);
        resolve(dataSet);
      } else {
        maxTrials--;
        if (!maxTrials) {
          clearInterval(timer);
          reject();
        } else {
          readDataSet();
        }
      }

    }, 500);
  });
};

extension.setDataSet = config => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(
      { [storageKey]: config },
      () => {
        dataSet = UNSET;
        resolve();
      }
    );
  });
};

extension.getCount = () => {
  return new Promise((resolve) => {
    resolve(countMap);
  });
};

extension.resetCount = () => {
  return new Promise(() => {
    countMap.clear();
  });
};

//end-region

const init  = () => {
  registerTabEventListeners();
  registerRequestInterceptorListeners();
  readDataSet();
};

init();
