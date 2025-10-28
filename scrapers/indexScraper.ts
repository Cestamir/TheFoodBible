const USDA_SEARCH = "https://api.nal.usda.gov/fdc/v1/foods/search";
const USDA_DETAIL = (fdcId: number) => `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`
const USDA_API_KEY = process.env.USDA_API_KEY?.trim()!;

export async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  await new Promise(res => setTimeout(res, 200));
  const defaultHeaders = {
    "Accept": "application/json",
    "User-Agent": "myFoodScraper/1.0 (http://localhost:5050)",
  };

  options.headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
}

export async function searchUsdaByName(name: string): Promise<any[]>{
    const url = new URL(USDA_SEARCH);
    url.searchParams.set("api_key",USDA_API_KEY)
    url.searchParams.set("query",name)
    url.searchParams.set("pageSize","5");

    const data = await fetchJson<any>(url.toString());
    return data.foods || [];
}

export async function getUsdaFoodDetail(fdcId: number): Promise<any>{
    const url = new URL(USDA_DETAIL(fdcId));
    url.searchParams.set("api_key",USDA_API_KEY);
    return await fetchJson<any>(url.toString());
}