export const hansReResMapName = 'hansReResMap';

export const getRedirectType = (res: string) => {
  if (res.startsWith('file://')) return 'file';
  if (res.length <= 3) return 'unknown';
  return 'http';
};

export interface RequestMappingRule {
  req: string
  res: string
}
