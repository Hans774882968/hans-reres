// 将xhr分离到另一个文件，单纯是为了方便jest mock
export default function xhr (localUrl: string) {
  const xhr = new XMLHttpRequest();
  xhr.open('get', localUrl, false);
  xhr.send(null);
  return xhr.responseText || xhr.responseXML;
}
