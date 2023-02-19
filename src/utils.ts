export const hansReResMapName = 'hansReResMap';

export const getRedirectType = (res: string) => {
  if (res.startsWith('file://')) return 'file';
  if (!res) return 'unknown';
  return 'http';
};

export function getHansReResMap (bgWindow: Window): Array<RequestMappingRule> {
  const hansReResMapTemp = JSON.parse(
    bgWindow.localStorage.getItem(hansReResMapName) || '[]'
  );
  return Array.isArray(hansReResMapTemp) ? hansReResMapTemp : [];
}

export interface RequestMappingRule {
  req: string
  res: string
}
