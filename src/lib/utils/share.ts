export async function shareUrl(title: string, url: string): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  await navigator.share({
    title,
    url,
  });

  return true;
}