
const CLOUD_NAME = 'dhrvnkv1b';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload`;

export function getAudioUrl(filename: string): string {
  const clean = filename.replace(/\.mp3$/, '');
  return `${BASE_URL}/${clean}`;
}
