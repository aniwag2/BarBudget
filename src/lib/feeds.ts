// Affiliate feed parsing. Networks (FlexOffers, Rakuten, …) publish product
// feeds as CSV or XML with, at minimum, a product name, price, and your tracked
// affiliate URL. Field names vary a lot between networks, so the parsers below
// are deliberately tolerant and best-effort — expect to tune the header/tag
// mapping per feed once you see real data.

export type FeedDef = {
  retailerName: string;
  network: string;
  format: 'csv' | 'xml';
  url: string;
};

export type ParsedFeedRow = {
  feedProductName: string;
  price: number;
  productUrl: string;
};

// AFFILIATE_FEEDS format: "retailer|network|format|url" entries, comma-separated.
export function parseFeedDefs(env: string | undefined): FeedDef[] {
  if (!env) return [];
  return env
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const [retailerName, network, format, url] = entry.split('|').map((p) => p.trim());
      return { retailerName, network, format: (format as 'csv' | 'xml') || 'csv', url };
    })
    .filter((d) => d.retailerName && d.url);
}

const NAME_KEYS = ['name', 'product_name', 'productname', 'title', 'product'];
const PRICE_KEYS = ['price', 'sale_price', 'saleprice', 'retail_price', 'current_price'];
const URL_KEYS = ['url', 'link', 'product_url', 'producturl', 'buy_url', 'aw_deep_link', 'clickurl'];

function pick(row: Record<string, string>, keys: string[]): string | undefined {
  const lowerEntries = Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v] as const);
  for (const key of keys) {
    const hit = lowerEntries.find(([k]) => k === key);
    if (hit && hit[1]) return hit[1];
  }
  return undefined;
}

function toPrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

// Minimal RFC-4180-ish CSV parser (handles quoted fields + embedded commas).
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { record.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      record.push(field); field = '';
      if (record.some((f) => f !== '')) rows.push(record);
      record = [];
    } else field += c;
  }
  if (field !== '' || record.length) { record.push(field); if (record.some((f) => f !== '')) rows.push(record); }
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => { obj[h] = r[idx] ?? ''; });
    return obj;
  });
}

function rowsToParsed(rows: Record<string, string>[]): ParsedFeedRow[] {
  const out: ParsedFeedRow[] = [];
  for (const row of rows) {
    const name = pick(row, NAME_KEYS);
    const price = toPrice(pick(row, PRICE_KEYS));
    const url = pick(row, URL_KEYS);
    if (name && price !== null && url) {
      out.push({ feedProductName: name.trim(), price, productUrl: url.trim() });
    }
  }
  return out;
}

export function parseCsvFeed(text: string): ParsedFeedRow[] {
  return rowsToParsed(parseCsv(text));
}

// Very small XML parser for typical <item>/<product>/<entry> feeds. Pulls the
// first name/price/url-ish child of each item. Not a full XML implementation.
export function parseXmlFeed(text: string): ParsedFeedRow[] {
  const items = text.match(/<(item|product|entry)\b[\s\S]*?<\/\1>/gi) ?? [];
  const rows: Record<string, string>[] = items.map((chunk) => {
    const obj: Record<string, string> = {};
    const tagRe = /<([a-zA-Z0-9_:-]+)\b[^>]*>([\s\S]*?)<\/\1>/g;
    let m: RegExpExecArray | null;
    while ((m = tagRe.exec(chunk)) !== null) {
      const tag = m[1].split(':').pop()!.toLowerCase();
      const val = m[2]
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/<[^>]+>/g, '')
        .trim();
      if (val && !(tag in obj)) obj[tag] = val;
    }
    return obj;
  });
  return rowsToParsed(rows);
}

export function parseFeed(def: FeedDef, text: string): ParsedFeedRow[] {
  return def.format === 'xml' ? parseXmlFeed(text) : parseCsvFeed(text);
}
