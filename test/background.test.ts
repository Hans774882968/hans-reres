import { getRedirectUrl, RewriteType } from '../src/utils';
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
        req: 'https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js',
        res: 'file://D:\\js_practice\\hans-reres\\chrome-plugin-hans-reres-v0.0.0\\1.js',
        checked: true,
        action: RewriteType.REDIRECT
      }
    ];
    const url = getRedirectUrl('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js', hansReResMap);
    expect(url).toBe('data:text/javascript;charset=utf-8,console.log(\'hello%20world\')%0A');
  });

  it('rule does not match', () => {
    const hansReResMap = [
      {
        req: 'https://g.csdnimg.cn/side-toolbar/3.4/side-toolbar.js',
        res: 'file://D:\\js_practice\\hans-reres\\chrome-plugin-hans-reres-v0.0.0\\2.js',
        checked: true,
        action: RewriteType.REDIRECT
      }
    ];
    const url = getRedirectUrl('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js', hansReResMap);
    expect(url).toBe('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js');
  });

  it('res is http protocol', () => {
    const hansReResMap = [
      {
        req: 'zhihu.com',
        res: 'baidu.com',
        checked: true,
        action: RewriteType.REDIRECT
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
        req: 'https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js',
        res: 'file://D:\\js_practice\\hans-reres\\chrome-plugin-hans-reres-v0.0.0\\1.js',
        checked: false,
        action: RewriteType.REDIRECT
      }
    ];
    const url = getRedirectUrl('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js', hansReResMap);
    expect(url).toBe('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js');
  });
});
