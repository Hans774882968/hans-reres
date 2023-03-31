import { ResponseType } from '@/action-types';
import {
  getMockResponseData,
  safeGetDataProtocolString
} from '@/utils';

describe('get-data-protocol-url functions', () => {
  it('getMockResponseData', () => {
    expect(getMockResponseData('{"name":"xiaoming","is_student": true}', ResponseType.JSON)).toBe('data:text/json;charset=utf-8,%7B%22name%22%3A%22xiaoming%22%2C%22is_student%22%3A%20true%7D');
    expect(getMockResponseData('"我爱你" means I love you', ResponseType.OTHER)).toBe('data:text/plain;charset=utf-8,%22%E6%88%91%E7%88%B1%E4%BD%A0%22%20means%20I%20love%20you');
  });

  it('safeGetDataProtocolString', () => {
    expect(safeGetDataProtocolString('body{color: red}', 'css')).toBe('data:text/css;charset=utf-8,body%7Bcolor%3A%20red%7D');
    expect(safeGetDataProtocolString('I love you means "我爱你"', 'foo bar type')).toBe('data:text/plain;charset=utf-8,I%20love%20you%20means%20%22%E6%88%91%E7%88%B1%E4%BD%A0%22');
  });
});
