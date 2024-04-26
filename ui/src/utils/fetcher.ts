export async function fetcher(
  path: string
) {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
  return await fetch(`${BASE_URL}/${path}`);
}