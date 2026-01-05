const KLIPY_API_KEY = import.meta.env.VITE_KLIPY_API_KEY;

export async function searchKlipyGifs(
  query: string,
  limit = 10
) {
    console.log(import.meta.env.VITE_KLIPY_API_KEY);

  const response = await fetch(
    `https://api.klipy.com/v1/gifs/search?q=${encodeURIComponent(query)}&limit=${limit}&key=${KLIPY_API_KEY}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Klipy API error ${response.status}: ${text}`);
  }

  const text = await response.text();

  if (!text) {
    throw new Error("Klipy returned an empty response");
  }

  return JSON.parse(text);
}

