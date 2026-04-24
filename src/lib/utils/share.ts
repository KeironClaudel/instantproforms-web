export async function shareUrl(title: string, url: string): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  await navigator.share({
    title,
    text: url,
    url,
  });

  return true;
}

export async function shareFile(
  file: File,
  options?: {
    title?: string;
    text?: string;
  },
): Promise<boolean> {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  const files = [file];

  if (!navigator.canShare({ files })) {
    return false;
  }

  await navigator.share({
    title: options?.title,
    text: options?.text,
    files,
  });

  return true;
}
