export function isRouterPath(path: string): boolean {
  return (
    (path.startsWith('/') || path.startsWith('./')) &&
    !path.startsWith('//') &&
    !path.endsWith('.html') &&
    !path.endsWith('.htm') &&
    !path.endsWith('.php') &&
    !path.endsWith('.asp') &&
    !path.endsWith('.aspx') &&
    !path.endsWith('.jsp') &&
    !path.endsWith('.xml') &&
    !path.endsWith('.json') &&
    !path.endsWith('.txt') &&
    !path.endsWith('.svg') &&
    !path.endsWith('.png') &&
    !path.endsWith('.jpg') &&
    !path.endsWith('.jpeg') &&
    !path.endsWith('.gif') &&
    !path.endsWith('.webp') &&
    !path.endsWith('.pdf') &&
    !path.endsWith('.doc') &&
    !path.endsWith('.docx') &&
    !path.endsWith('.xls') &&
    !path.endsWith('.xlsx') &&
    !path.endsWith('.ppt') &&
    !path.endsWith('.pptx') &&
    !path.endsWith('.zip')
  );
}

export function isExternalPath(path: string): boolean {
  return (
    path.startsWith('http') ||
    path?.startsWith('//') ||
    path?.startsWith('mailto') ||
    path?.startsWith('tel') ||
    path?.startsWith('sms') ||
    path?.startsWith('callto') ||
    path?.startsWith('skype') ||
    path?.startsWith('sip') ||
    path?.startsWith('ws') ||
    path?.startsWith('wss') ||
    path?.startsWith('irc') ||
    path?.startsWith('gopher') ||
    path?.startsWith('whatsapp')
  );
}

export default {
  isRouterPath,
  isExternalPath,
}
