export function getCookieValue(name: string): string | null {
  const escapedName = name.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));

  return match && match[1] ? decodeURIComponent(match[1]) : null;
}