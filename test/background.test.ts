import { RewriteType, getRedirectUrl } from '../src/utils';
import xhr from '../src/xhr';

jest.mock('../src/xhr', () => {
  return {
    __esModule: true,
    default: () => {
      return 'console.log(\'hello world\')\n';
    }
  };
});

describe('background.ts', () => {
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
    const url = getRedirectUrl('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js', hansReResMap);
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
    const url = getRedirectUrl('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js', hansReResMap);
    expect(url).toBe('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js');
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
      const url = getRedirectUrl(test.req, hansReResMap);
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
    const url = getRedirectUrl('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js', hansReResMap);
    expect(url).toBe('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js');
  });

  it('add query param', () => {
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
    const url = getRedirectUrl('https://blog.csdn.net', hansReResMap);
    expect(url).toBe('https://baidu.com/?role=acmer&rate=2400');
  });
});
