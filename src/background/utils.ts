export const hansReResMapName = 'hansReResMap';

// 这个封装单纯是为了方便jest mock
export function xhr (localUrl: string) {
  const xhr = new XMLHttpRequest();
  xhr.open('get', localUrl, false);
  xhr.send(null);
  return xhr.responseText || xhr.responseXML;
}

export interface RequestMappingRule {
  req: string
  res: string
}
