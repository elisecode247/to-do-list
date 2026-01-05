const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY;

interface TenorGif {
    id: string;
    media_formats: Record<
        string,
        { url: string; duration?: number; dims?: [number, number]; size?: number }
    >;
    url: string;

}

export async function searchTenorGifs(searchTerm: string, limit = 4): Promise<TenorGif[]> {
    const clientKey = "daily_checklist";
    const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
        searchTerm
    )}&key=${TENOR_API_KEY}&client_key=${clientKey}&limit=${limit}&random=true`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data?.results || !Array.isArray(data.results)) return [];
    return data.results as TenorGif[];
}

