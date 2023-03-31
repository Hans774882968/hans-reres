export enum OS {
  MAC = 'Mac OS',
  IOS = 'iOS',
  WIN = 'Windows',
  ANDROID = 'Android',
  LINUX = 'Linux',
  UNIX = 'Unix',
  OTHER = 'Other'
}

// TODO：根据MDN，这种方式是不可靠的，但似乎没有其他办法……
export function getPlatform (): OS {
  const ua = navigator.userAgent;
  if (ua.includes('Mac')) return OS.MAC;
  if (ua.includes('X11')) return OS.UNIX;
  if (ua.includes('Linux')) return OS.LINUX;
  if (ua.includes('Windows')) return OS.WIN;
  if (ua.includes('Android')) return OS.ANDROID;
  if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) return OS.IOS;
  return OS.OTHER;
}

export function isWindows () {
  return getPlatform() === OS.WIN;
}

export function isMac () {
  return getPlatform() === OS.MAC;
}
