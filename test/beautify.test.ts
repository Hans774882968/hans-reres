import {
  beautifyCSS,
  beautifyJS,
  beautifyJSON,
  beautifyXML
} from '@/popup/mock-response/beautify';

describe('beautify', () => {
  it('beautifyJSON', () => {
    expect(beautifyJSON('{ "retcode": 0, "message": "success" }')).toStrictEqual({ hasError: false, result: '{\n  "retcode": 0,\n  "message": "success"\n}' });
    expect(beautifyJSON('{ retcode: 0, "message": "success" }')).toStrictEqual({ hasError: true, result: '{ retcode: 0, "message": "success" }' });
    expect(beautifyJSON('')).toStrictEqual({ hasError: true, result: '' });
  });

  it('beautifyJS', () => {
    expect(beautifyJS('function main(){let x=0,y=0;console.log("hello world",x+y)}main()')).toStrictEqual({ hasError: false, result: 'function main() {\n  let x = 0,\n    y = 0;\n  console.log("hello world", x + y)\n}\nmain()' });
    expect(beautifyJS('')).toStrictEqual({ hasError: false, result: '' });
  });

  it('beautifyCSS', () => {
    expect(beautifyCSS('.div{display:flex;justify-content:center;}.div>*{font-size:20px;}')).toStrictEqual({ hasError: false, result: '.div {\n  display: flex;\n  justify-content: center;\n}\n\n.div > * {\n  font-size: 20px;\n}' });
    expect(beautifyCSS('')).toStrictEqual({ hasError: false, result: '' });
  });

  it('beautifyXML', () => {
    expect(beautifyXML('<user id="1"><name>hans</name><age>18</age></user>')).toStrictEqual({ hasError: false, result: '<user id="1">\n  <name>hans</name>\n  <age>18</age>\n</user>' });
    expect(beautifyXML('<h1><div><span style="font-weight: normal">hello</span> world</div></h1>')).toStrictEqual({ hasError: false, result: '<h1>\n  <div><span style="font-weight: normal">hello</span> world</div>\n</h1>' });
    expect(beautifyXML('<h1><div><span style="font-weight: normal">hello</span> world</h1>')).toStrictEqual({ hasError: false, result: '<h1>\n  <div><span style="font-weight: normal">hello</span> world\n</h1>' });
    expect(beautifyXML('<h1><div><span style="font-weight: normal">hello</span> world')).toStrictEqual({ hasError: false, result: '<h1>\n  <div><span style="font-weight: normal">hello</span> world' });
    expect(beautifyXML('')).toStrictEqual({ hasError: false, result: '' });

    expect(beautifyXML('.div{display:flex;justify-content:center;}.div>*{font-size:20px;}')).toStrictEqual({ hasError: false, result: '.div{display:flex;justify-content:center;}.div>*{font-size:20px;}' });
  });
});
