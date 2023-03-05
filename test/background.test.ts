import { RewriteType } from '../src/action-types';
import {
  filterRulesForHeaderListener,
  getHeadersMap, mapToHttpHeaderArray,
  processHeaders,
  processRequest,
  processUserAgent
} from '../src/utils';
import expect from 'expect';
// TODO：搞清楚为什么不能 import shuffle from 'lodash/shuffle';
import { orderBy, shuffle } from 'lodash';
import xhr from '../src/xhr';

jest.mock('../src/xhr', () => {
  return {
    __esModule: true,
    default: () => {
      return 'console.log(\'hello world\')\n';
    }
  };
});

describe('processRequest()', () => {
  it('mock successfully', () => {
    const result = xhr('file://D:/1.js');
    expect(result).toBe('console.log(\'hello world\')\n');
  });

  it('res is file protocol', () => {
    const hansReResMap = [
      {
        action: {
          res: 'file://D:\\js_practice\\hans-reres\\chrome-plugin-hans-reres-v0.0.0\\1.js',
          type: RewriteType.REDIRECT
        },
        checked: true,
        req: 'https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js'
      }
    ];
    const { redirectUrl: url } = processRequest('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js', hansReResMap);
    expect(url).toBe('data:text/javascript;charset=utf-8,console.log(\'hello%20world\')%0A');
  });

  it('rule does not match', () => {
    const hansReResMap = [
      {
        action: {
          res: 'file://D:\\js_practice\\hans-reres\\chrome-plugin-hans-reres-v0.0.0\\2.js',
          type: RewriteType.REDIRECT
        },
        checked: true,
        req: 'https://g.csdnimg.cn/side-toolbar/3.4/side-toolbar.js'
      }
    ];
    const { redirectUrl: url } = processRequest('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js', hansReResMap);
    expect(url).toBeUndefined();
  });

  it('res is http protocol', () => {
    const hansReResMap = [
      {
        action: {
          res: 'baidu.com',
          type: RewriteType.REDIRECT
        },
        checked: true,
        req: 'zhihu.com'
      }
    ];
    const tests = [
      { req: 'https://zhihu.com/', res: 'https://baidu.com/' },
      { req: 'https://zhihu.com', res: 'https://baidu.com' },
      { req: 'https://www.zhihu.com', res: 'https://www.baidu.com' },
      {
        req: 'https://www.zhihu.com/question/305638940/answer/670034343',
        res: 'https://www.baidu.com/question/305638940/answer/670034343'
      }
    ];
    tests.forEach(test => {
      const { redirectUrl: url } = processRequest(test.req, hansReResMap);
      expect(url).toBe(test.res);
    });
  });

  it('not checked', () => {
    const hansReResMap = [
      {
        action: {
          res: 'file://D:\\js_practice\\hans-reres\\chrome-plugin-hans-reres-v0.0.0\\1.js',
          type: RewriteType.REDIRECT
        },
        checked: false,
        req: 'https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js'
      }
    ];
    const { redirectUrl: url } = processRequest('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js', hansReResMap);
    expect(url).toBeUndefined();
  });

  it('add query param', () => {
    const hansReResMap = [
      {
        action: {
          newUA: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5',
          type: RewriteType.SET_UA
        },
        checked: true,
        req: '.*idu\\.com'
      },
      {
        action: {
          name: 'role',
          type: RewriteType.ADD_QUERY_PARAM,
          value: 'acmer'
        },
        checked: true,
        req: '.*idu\\.com'
      },
      {
        action: {
          name: 'rate',
          type: RewriteType.ADD_QUERY_PARAM,
          value: '2400'
        },
        checked: true,
        req: '.*idu\\.com'
      }
    ];
    const { queryParams, queryParamsModified } = processRequest('https://baidu.com', hansReResMap);
    expect(queryParamsModified).toBeTruthy();
    expect(queryParams.toString()).toBe('role=acmer&rate=2400');
  });

  it('set query param', () => {
    const hansReResMap = [
      {
        action: {
          newUA: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5',
          type: RewriteType.SET_UA
        },
        checked: true,
        req: '.*idu\\.com'
      },
      {
        action: {
          name: 'role',
          type: RewriteType.MODIFY_QUERY_PARAM,
          value: 'acmer'
        },
        checked: true,
        req: '.*idu\\.com'
      },
      {
        action: {
          name: 'rate',
          type: RewriteType.MODIFY_QUERY_PARAM,
          value: '2400'
        },
        checked: true,
        req: '.*idu\\.com'
      }
    ];
    const { queryParams, queryParamsModified } = processRequest('https://baidu.com/?role=ctfer&rate=2500&unemployment=true', hansReResMap);
    expect(queryParamsModified).toBeTruthy();
    expect(queryParams.toString()).toBe('role=acmer&rate=2400&unemployment=true');
  });

  it('delete query param', () => {
    const hansReResMap = [
      {
        action: {
          newUA: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5',
          type: RewriteType.SET_UA
        },
        checked: true,
        req: '.*idu\\.com'
      },
      {
        action: {
          name: 'role',
          type: RewriteType.DELETE_QUERY_PARAM
        },
        checked: true,
        req: '.*idu\\.com'
      },
      {
        action: {
          name: 'rate',
          type: RewriteType.DELETE_QUERY_PARAM,
          value: '2400'
        },
        checked: true,
        req: '.*idu\\.com'
      }
    ];
    const { queryParams, queryParamsModified } = processRequest('https://baidu.com/?role=ctfer&rate=2500&unemployment=true', hansReResMap);
    expect(queryParamsModified).toBeTruthy();
    expect(queryParams.toString()).toBe('unemployment=true');
  });

  it('If add query param and redirect appear at the same time, we should only redirect the request', () => {
    const hansReResMap = [
      {
        action: {
          res: 'https://baidu.com',
          type: RewriteType.REDIRECT
        },
        checked: true,
        req: '.*\\.csdn\\.net'
      },
      {
        action: {
          newUA: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5',
          type: RewriteType.SET_UA
        },
        checked: true,
        req: '.*\\.csdn\\.net'
      },
      {
        action: {
          name: 'role',
          type: RewriteType.ADD_QUERY_PARAM,
          value: 'acmer'
        },
        checked: true,
        req: '.*idu\\.com'
      },
      {
        action: {
          name: 'rate',
          type: RewriteType.ADD_QUERY_PARAM,
          value: '2400'
        },
        checked: true,
        req: '.*idu\\.com'
      }
    ];
    for (let i = 0; i < 24; ++i) {
      const tempMap = shuffle(hansReResMap);
      const { redirectUrl: url } = processRequest('https://blog.csdn.net', tempMap);
      expect(url).toBe('https://baidu.com');
    }
  });

  it('cancel rule goes before redirect rule', () => {
    const hansReResMap = [
      {
        action: { type: RewriteType.BLOCK_REQUEST },
        checked: true,
        req: '.*\\.csdn\\.net'
      },
      {
        action: {
          res: 'https://baidu.com',
          type: RewriteType.REDIRECT
        },
        checked: true,
        req: '.*\\.csdn\\.net'
      }
    ];
    const { cancel, redirectUrl } = processRequest('https://blog.csdn.net', hansReResMap);
    expect(cancel).toBeTruthy();
    expect(redirectUrl).toBe('https://baidu.com');
  });

  // 这里是用不断迭代的 redirectUrl 来过滤的，所以cancel的规则出现在重定向的规则之后，就可能被忽略。改成和request-interceptor一样，用标签页url来过滤，就没有这个奇怪的feature了。
  it('cancel rule goes after redirect rule', () => {
    const hansReResMap = [
      {
        action: {
          res: 'file://D:/1.js',
          type: RewriteType.REDIRECT
        },
        checked: true,
        req: '.*\\.csdn\\.net'
      },
      {
        action: { type: RewriteType.BLOCK_REQUEST },
        checked: true,
        req: '.*\\.csdn\\.net'
      }
    ];
    const { cancel, redirectUrl } = processRequest('https://blog.csdn.net', hansReResMap);
    expect(redirectUrl).toBe('data:text/javascript;charset=utf-8,console.log(\'hello%20world\')%0A');
    expect(cancel).toBeFalsy();
  });

  it('cancel rule and query param rule', () => {
    const hansReResMap = [
      {
        action: {
          name: 'rate',
          type: RewriteType.MODIFY_QUERY_PARAM,
          value: '2400'
        },
        checked: true,
        req: '.*idu\\.com'
      },
      {
        action: { type: RewriteType.BLOCK_REQUEST },
        checked: true,
        req: '.*idu\\.com'
      }
    ];
    for (let i = 0; i < 2; ++i) {
      const tempMap = shuffle(hansReResMap);
      const { cancel, queryParamsModified, queryParams } = processRequest('https://baidu.com/?rate=2500', tempMap);
      expect(cancel).toBeTruthy();
      expect(queryParamsModified).toBeTruthy();
      expect(queryParams.toString()).toBe('rate=2400');
    }
  });
});

describe('processHeaders() and processUserAgent()', () => {
  const requestHeaderRules = [
    {
      action: { name: 'X-role', type: RewriteType.ADD_REQ_HEADER, value: 'acmer' },
      checked: true,
      req: '.*idu\\.com'
    },
    {
      action: { name: 'X-rate', type: RewriteType.ADD_REQ_HEADER, value: '2400' },
      checked: true,
      req: 'baidu\\.com'
    },
    {
      action: { name: 'has-job', type: RewriteType.MODIFY_REQ_HEADER, value: 'false' },
      checked: true,
      req: '.*du\\.com'
    },
    {
      action: { name: 'solved-problems', type: RewriteType.DELETE_REQ_HEADER },
      checked: true,
      req: 'baidu\\.com'
    }
  ];
  const responseHeaderRules = [
    {
      action: { name: 'Y-role', type: RewriteType.ADD_RESP_HEADER, value: 'ctfer' },
      checked: true,
      req: '.*idu\\.com'
    },
    {
      action: { name: 'Y-rate', type: RewriteType.ADD_RESP_HEADER, value: '2500' },
      checked: true,
      req: 'baidu\\.com'
    },
    {
      action: { name: 'has-job', type: RewriteType.MODIFY_RESP_HEADER, value: 'false' },
      checked: true,
      req: '.*du\\.com'
    },
    {
      action: { name: 'flag-number', type: RewriteType.DELETE_RESP_HEADER },
      checked: true,
      req: 'baidu\\.com'
    }
  ];
  const resultUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5';
  const setUARules = [
    {
      action: { newUA: 'foo bar', type: RewriteType.SET_UA },
      checked: true,
      req: 'baidu\\.com'
    },
    {
      action: { newUA: resultUA, type: RewriteType.SET_UA },
      checked: true,
      req: '.*du\\.com'
    }
  ];
  const requestRules = [...requestHeaderRules, ...responseHeaderRules, ...setUARules];

  it('process request header rules', () => {
    const requestHeaders = new Map<string, string>([
      ['has-job', 'true'],
      ['solved-problems', '2000+']
    ]);
    const { headersModified, requestHeadersMap } = processHeaders(requestRules, requestHeaders, true);
    expect(headersModified).toBeTruthy();
    expect(requestHeadersMap).toStrictEqual(new Map([
      ['X-role', 'acmer'],
      ['X-rate', '2400'],
      ['has-job', 'false']
    ]));
  });

  it('process response header rules', () => {
    const headers = new Map<string, string>([
      ['has-job', 'true'],
      ['flag-number', '2000+']
    ]);
    const { headersModified, responseHeadersMap } = processHeaders(requestRules, headers, false);
    expect(headersModified).toBeTruthy();
    expect(responseHeadersMap).toStrictEqual(new Map([
      ['Y-role', 'ctfer'],
      ['Y-rate', '2500'],
      ['has-job', 'false']
    ]));
  });

  it('getHeadersMap()', () => {
    const headers = [
      { name: 'X-role', value: 'ctfer' },
      { name: 'User-Agent', value: 'none' }
    ];
    const res = getHeadersMap(headers);
    expect(res).toStrictEqual(new Map([
      ['X-role', 'ctfer'],
      ['User-Agent', 'none']
    ]));
  });

  it('mapToHttpHeaderArray()', () => {
    const headersMap = new Map([
      ['X-role', 'ctfer'],
      ['User-Agent', 'none']
    ]);
    const result = mapToHttpHeaderArray(headersMap);
    const orderedResult = orderBy(result, ['name', 'value'], ['asc', 'asc']);
    expect(orderedResult).toStrictEqual([
      { name: 'User-Agent', value: 'none' },
      { name: 'X-role', value: 'ctfer' }
    ]);
  });

  // 多条 SET_UA 规则只有最后一条生效
  it('processUserAgent()', () => {
    const headers = [
      { name: 'X-role', value: 'ctfer' },
      { name: 'User-Agent', value: 'none' }
    ];
    const { headersModified, requestHeadersMap } = processUserAgent(requestRules, getHeadersMap(headers), headers);
    expect(headersModified).toBeTruthy();
    expect(requestHeadersMap).toStrictEqual(new Map([
      ['X-role', 'ctfer'],
      ['User-Agent', resultUA]
    ]));
  });
});

describe('filterRulesForHeaderListener()', () => {
  it('basic case', () => {
    const requestRules = [
      {
        action: { name: 'X-role', type: RewriteType.ADD_REQ_HEADER, value: 'acmer' },
        checked: false,
        req: '.*idu\\.com'
      },
      {
        action: { name: 'X-rate', type: RewriteType.ADD_REQ_HEADER, value: '2400' },
        checked: true,
        req: '.*idu\\.com'
      },
      {
        action: { name: 'X-hasjob', type: RewriteType.ADD_REQ_HEADER, value: 'false' },
        checked: true,
        req: 'zhihu\\.com'
      }
    ];
    const url = 'https://www.baidu.com';
    for (let i = 0; i < 6; ++i) {
      const res = filterRulesForHeaderListener(url, requestRules);
      expect(res).toStrictEqual([
        {
          action: { name: 'X-rate', type: RewriteType.ADD_REQ_HEADER, value: '2400' },
          checked: true,
          req: '.*idu\\.com'
        }
      ]);
    }
  });
});
