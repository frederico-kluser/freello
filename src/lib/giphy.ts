/**
 * Search Giphy and return a direct CDN URL for the first matching GIF.
 * We only ever pass the URL to <img src>; bytes stay on Giphy's CDN.
 */
export async function searchGiphyUrl(opts: {
  apiKey: string;
  query: string;
}): Promise<string | undefined> {
  if (!opts.apiKey || !opts.query.trim()) return undefined;

  const url =
    'https://api.giphy.com/v1/gifs/search' +
    `?api_key=${encodeURIComponent(opts.apiKey)}` +
    `&q=${encodeURIComponent(opts.query)}` +
    '&limit=1&rating=pg&lang=en';

  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const data = await res.json();
    const first = data?.data?.[0];
    return (
      first?.images?.fixed_height?.url ??
      first?.images?.downsized_medium?.url ??
      first?.images?.original?.url ??
      undefined
    );
  } catch {
    return undefined;
  }
}
