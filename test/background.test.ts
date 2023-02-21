import getRedirectUrl from '../src/background/get-redirect-url';

jest.mock('../src/background/utils', () => {
  return {
    ...jest.requireActual('../src/background/utils'),
    xhr () {
      return 'console.log(\'hello world\')\n';
    }
  };
});

describe('background.ts', () => {
  it('res is file protocol', () => {
    const hansReResMap = [
      {
        req: 'https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js',
        res: 'file://D:\\js_practice\\hans-reres\\chrome-plugin-hans-reres-v0.0.0\\1.js'
      }
    ];
    const url = getRedirectUrl('https://g.csdnimg.cn/side-toolbar/3.0/side-toolbar.js', hansReResMap);
    expect(url).toBe('data:text/javascript;charset=utf-8,console.log(\'hello%20world\')%0A');
  });

  it('res is http protocol', () => {
    const hansReResMap = [
      {
        req: 'zhihu.com',
        res: 'baidu.com'
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
});
