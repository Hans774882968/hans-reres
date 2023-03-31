import {
  ResponseType,
  RewriteType,
  newMockResponseAction,
  newRedirectAction,
  newSetUAAction
} from '@/action-types';
import {
  filterRulesForHeaderListener,
  getHeadersMap,
  mapToHttpHeaderArray,
  overrideQueryParams,
  parsePostBody,
  processHeaders,
  processRequest,
  processUserAgent
} from '@/utils';
import expect from 'expect';
// TODO：搞清楚为什么不能 import shuffle from 'lodash/shuffle';
import { orderBy, sample, shuffle } from 'lodash-es';
import xhr from '@/xhr';

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
        action: newRedirectAction('file://D:\\js_practice\\hans-reres\\chrome-plugin-hans-reres-v0.0.0\\1.js'),
        checked: true,
        req: 'https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js'
      }
    ];
    const { redirectUrl: url } = processRequest('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js', hansReResMap);
    expect(url).toBe('data:text/javascript;charset=utf-8,console.log(\'hello%20world\')%0A');
  });

  it('redirect rule does not match', () => {
    const hansReResMap = [
      {
        action: newRedirectAction('file://D:\\js_practice\\hans-reres\\chrome-plugin-hans-reres-v0.0.0\\2.js'),
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
        action: newRedirectAction('baidu.com'),
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
    tests.forEach((test) => {
      const { redirectUrl: url } = processRequest(test.req, hansReResMap);
      expect(url).toBe(test.res);
    });
  });

  it('not checked', () => {
    const hansReResMap = [
      {
        action: newRedirectAction('file://D:\\js_practice\\hans-reres\\chrome-plugin-hans-reres-v0.0.0\\1.js'),
        checked: false,
        req: 'https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js'
      }
    ];
    const { redirectUrl: url } = processRequest('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js', hansReResMap);
    expect(url).toBeUndefined();
  });

  it('redirect rule regexp', () => {
    const hansReResMap = [
      {
        action: newRedirectAction('https://baidu.com/?role=acmer'),
        checked: true,
        req: '.*\\.csdn\\.net.*'
      }
    ];
    const { redirectUrl } = processRequest('https://yunchong.blog.csdn.net/article/details/128901550?src=abc', hansReResMap);
    expect(redirectUrl).toBe('https://baidu.com/?role=acmer');
  });

  it('add query param', () => {
    const hansReResMap = [
      {
        action: newSetUAAction('Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5'),
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
        action: newSetUAAction('Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5'),
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
        action: newSetUAAction('Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5'),
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
        action: newRedirectAction('https://baidu.com'),
        checked: true,
        req: '.*\\.csdn\\.net'
      },
      {
        action: newSetUAAction('Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 FingerBrowser/1.5'),
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
        action: newRedirectAction('https://baidu.com'),
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
        action: newRedirectAction('file://D:/1.js'),
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

  it('overrideQueryParams() exception', () => {
    const redirectUrl = overrideQueryParams(new URL('http://baidu.com'), 'foo bar', newRedirectAction('https://baidu.com', true));
    expect(redirectUrl).toBe('foo bar');
  });

  it('RedirectAction keepQueryParams = true', () => {
    const hansReResMap = [
      {
        action: newRedirectAction('https://baidu.com/?role=acmer', true),
        checked: true,
        req: '.*\\.csdn\\.net'
      }
    ];
    const { redirectUrl } = processRequest('https://blog.csdn.net/?rate=2400&has_job=false', hansReResMap);
    expect(redirectUrl).toBe('https://baidu.com/?rate=2400&has_job=false');
  });

  it('RedirectAction keepQueryParams = true', () => {
    const hansReResMap = [
      {
        action: newRedirectAction('https://baidu.com/?role=acmer', true),
        checked: true,
        req: '.*\\.csdn\\.net.*'
      }
    ];
    const { redirectUrl } = processRequest('https://yunchong.blog.csdn.net/article/details/128901550?src=abc', hansReResMap);
    expect(redirectUrl).toBe('https://baidu.com/?src=abc');
  });

  it('Multiple RedirectActions', () => {
    const hansReResMap = [
      {
        action: newRedirectAction('https://baidu.com/?role=acmer', true),
        checked: true,
        req: '.*\\.csdn\\.net'
      },
      {
        action: newRedirectAction('https://zhihu.com/?foo=bar', true),
        checked: true,
        req: '.*baidu.com'
      }
    ];
    const { redirectUrl } = processRequest('https://blog.csdn.net/?rate=2400&has_job=false', hansReResMap);
    expect(redirectUrl).toBe('https://zhihu.com/?rate=2400&has_job=false');
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

function object2ArrayBuffer (o: unknown) {
  return new TextEncoder().encode(JSON.stringify(o)).buffer;
}

describe('Post Body params modification', () => {
  it('parsePostBody()', () => {
    const tests = [
      { a: [], q: undefined },
      { a: [], q: [] },
      {
        a: [{ age: 18, name: 'hans' }],
        q: [{}, { bytes: object2ArrayBuffer({ age: 18, name: 'hans' }) }]
      },
      {
        a: [
          {},
          { role: 'acmer' },
          { rate: 2500, role: 'acmer' }
        ],
        q: [
          {},
          { bytes: object2ArrayBuffer(1234) },
          { bytes: object2ArrayBuffer('1234') },
          { bytes: object2ArrayBuffer({}) },
          { bytes: object2ArrayBuffer([]) },
          { bytes: object2ArrayBuffer([1, 2, 3]) },
          { bytes: object2ArrayBuffer({ role: 'acmer' }) },
          { bytes: object2ArrayBuffer({ rate: 2500, role: 'acmer' }) }
        ]
      },
      // nested object
      {
        a: [
          { girlFriend: { isExist: false, name: 'amy' }, name: 'sam' }
        ],
        q: [
          { bytes: object2ArrayBuffer({ girlFriend: { isExist: false, name: 'amy' }, name: 'sam' }) }
        ]
      }
    ];
    tests.forEach((test) => {
      expect(parsePostBody(test.q)).toStrictEqual(test.a);
    });
  });

  it('post body param rule: nested JSON object', () => {
    const hansReResMap = [
      {
        action: {
          name: 'girlFriend',
          type: RewriteType.BLOCK_IF_POST_BODY_PARAM_CONTAINS_NAME
        },
        checked: true,
        req: 'https://www.jianshu.com/shakespeare/notes/(.*)/mark_viewed'
      }
    ];
    const inputPostBodyList = parsePostBody([
      { bytes: object2ArrayBuffer({ girlFriend: { isExist: false, name: 'amy' }}) }
    ]);
    const { postBodyParamsShouldBlock } = processRequest('https://www.jianshu.com/shakespeare/notes/(.*)/mark_viewed?rate=2500', hansReResMap, inputPostBodyList);
    expect(postBodyParamsShouldBlock).toBeTruthy();
  });

  it('post body param rule: nested JSON object. I will only check the outermost keys.', () => {
    const hansReResMap = [
      {
        action: {
          name: sample(['isExist', 'name']),
          type: RewriteType.BLOCK_IF_POST_BODY_PARAM_CONTAINS_NAME
        },
        checked: true,
        req: '.*idu\\.com'
      }
    ];
    const inputPostBodyList = parsePostBody([
      { bytes: object2ArrayBuffer({ girlFriend: { isExist: false, name: 'amy' }}) }
    ]);
    const { postBodyParamsShouldBlock } = processRequest('https://baidu.com/?rate=2500', hansReResMap, inputPostBodyList);
    expect(postBodyParamsShouldBlock).toBeFalsy();
  });

  it('query param rule and post body param rule', () => {
    const inputPostBodyList = parsePostBody([
      { bytes: object2ArrayBuffer(1234) },
      { bytes: object2ArrayBuffer('1234') },
      { bytes: object2ArrayBuffer({}) },
      { bytes: object2ArrayBuffer({ name: 'sam' }) },
      { bytes: object2ArrayBuffer({ age: 18 }) },
      { bytes: object2ArrayBuffer({ hobby: 'math', isStudent: true }) }
    ]);
    for (let i = 0; i < 10; ++i) {
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
          action: {
            name: sample(['name', 'age', 'hobby', 'isStudent']),
            type: RewriteType.BLOCK_IF_POST_BODY_PARAM_CONTAINS_NAME
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
      const tempMap = shuffle(hansReResMap);
      const {
        cancel,
        postBodyParamsShouldBlock,
        queryParamsModified,
        queryParams
      } = processRequest('https://baidu.com/?rate=2500', tempMap, inputPostBodyList);
      expect(cancel).toBeTruthy();
      expect(postBodyParamsShouldBlock).toBeTruthy();
      expect(queryParamsModified).toBeTruthy();
      expect(queryParams.toString()).toBe('rate=2400');
    }
  });

  it('cancel rule and post body param rule', () => {
    const inputPostBodyList = parsePostBody([
      { bytes: object2ArrayBuffer(1234) },
      { bytes: object2ArrayBuffer('1234') },
      { bytes: object2ArrayBuffer({ role: 'acmer' }) },
      { bytes: object2ArrayBuffer({ rate: 2500, role: 'acmer' }) }
    ]);
    for (let i = 0; i < 4; ++i) {
      const hansReResMap = [
        {
          action: {
            name: sample(['rate', 'role']),
            type: RewriteType.BLOCK_IF_POST_BODY_PARAM_CONTAINS_NAME
          },
          checked: true,
          req: 'https://www.jianshu.com/shakespeare/notes/(.*)/mark_viewed'
        },
        {
          action: { type: RewriteType.BLOCK_REQUEST },
          checked: true,
          req: 'https://www.jianshu.com/shakespeare/notes/(.*)/mark_viewed'
        }
      ];
      const tempMap = shuffle(hansReResMap);
      const { cancel, postBodyParamsShouldBlock } = processRequest('https://www.jianshu.com/shakespeare/notes/610c4e850250/mark_viewed', tempMap, inputPostBodyList);
      expect(cancel).toBeTruthy();
      expect(postBodyParamsShouldBlock).toBeTruthy();
    }
  });

  it('mock response rule: JSON', () => {
    const hansReResMap = [
      {
        action: newMockResponseAction(ResponseType.JSON, '{ "retcode": 0, "message": "success" }'),
        checked: true,
        req: 'baidu'
      }
    ];
    const { redirectUrl } = processRequest('https://baidu.com', hansReResMap);
    expect(redirectUrl).toBe('data:text/json;charset=utf-8,%7B%20%22retcode%22%3A%200%2C%20%22message%22%3A%20%22success%22%20%7D');
  });

  it('mock response rule: Other', () => {
    const hansReResMap = [
      {
        action: newMockResponseAction(ResponseType.OTHER, '### title3\n#### title4'),
        checked: true,
        req: 'baidu'
      }
    ];
    const { redirectUrl } = processRequest('https://baidu.com', hansReResMap);
    expect(redirectUrl).toBe('data:text/plain;charset=utf-8,%23%23%23%20title3%0A%23%23%23%23%20title4');
  });

  it('mock response rule goes after redirect rule', () => {
    const hansReResMap = [
      {
        action: newRedirectAction('https://www.csdn.com'),
        checked: true,
        req: '.*baidu.com'
      },
      {
        action: newMockResponseAction(ResponseType.JSON, '{ "retcode": 0, "message": "success" }'),
        checked: true,
        req: '.*csdn.com'
      }
    ];
    const { redirectUrl } = processRequest('https://baidu.com', hansReResMap);
    expect(redirectUrl).toBe('data:text/json;charset=utf-8,%7B%20%22retcode%22%3A%200%2C%20%22message%22%3A%20%22success%22%20%7D');
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
      action: newSetUAAction('foo bar'),
      checked: true,
      req: 'baidu\\.com'
    },
    {
      action: newSetUAAction(resultUA),
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
