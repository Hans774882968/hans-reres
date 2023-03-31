import { getByteLength } from '@/utils';

describe('get-byte-length', () => {
  it('ascii only', () => {
    expect(getByteLength('ABC, acb.')).toBe(9);
    expect(getByteLength('0123456789 ')).toBe(11);
  });

  it('text contains chinese', () => {
    expect(getByteLength('I love you means "我爱你"')).toBe(28);
  });

  it('texr contains emoji', () => {
    expect(getByteLength('你好😊')).toBe(10);
  });
});
