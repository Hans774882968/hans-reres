import { xhr } from './utils';

const typeMap = {
  'txt': 'text/plain',
  'html': 'text/html',
  'css': 'text/css',
  'js': 'text/javascript',
  'json': 'text/json',
  'xml': 'text/xml',
  'jpg': 'image/jpeg',
  'gif': 'image/gif',
  'png': 'image/png',
  'webp': 'image/webp'
};

export default function getLocalFileUrl (url: string) {
  const arr = url.split('.');
  let type = arr[arr.length - 1];
  let content: string | Document | null = '';
  try {
    content = xhr(url);
  } catch (e) {
    content = `{
      "retcode": -404,
      "message": "Sorry to tell you that the request to local file failed. This may be because the local file does not exist. -- from hans-reres",
      "data": null
    }`;
    type = 'json';
  }
  if (typeof content !== 'string') {
    return '';
  }
  content = encodeURIComponent(
    type === 'js' ?
      content.replace(/[\u0080-\uffff]/g, ($0: string) => {
        const str = $0.charCodeAt(0).toString(16);
        return '\\u' + '00000'.substring(0, 4 - str.length) + str;
      }) : content
  );
  return `data:${
    type in typeMap ? typeMap[type as keyof typeof typeMap] : typeMap.txt
  };charset=utf-8,${content}`;
}
