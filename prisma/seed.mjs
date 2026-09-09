// Seed script (plain ESM so it runs with `node` in the container — no tsx needed).
// Populates categories, a broad sample of bottles with affiliate links, a sample
// ingredient_cache, and the bootstrap admin user.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Vodka', type: 'base_spirit', description: 'Neutral base spirit; the backbone of countless mixed drinks.' },
  { name: 'Gin', type: 'base_spirit', description: 'Juniper-forward spirit for martinis, negronis and highballs.' },
  { name: 'Bourbon & Whiskey', type: 'base_spirit', description: 'American and world whiskies for old fashioneds, sours and more.' },
  { name: 'Rum', type: 'base_spirit', description: 'Cane-based spirit spanning light, dark and aged styles.' },
  { name: 'Tequila & Agave', type: 'base_spirit', description: 'Agave spirits for margaritas, palomas and sipping.' },
  { name: 'Orange Liqueur', type: 'essential_liqueur', description: 'Triple sec / curaçao family — the workhorse modifier.' },
  { name: 'Vermouth', type: 'essential_liqueur', description: 'Aromatized fortified wine, sweet and dry.' },
  { name: 'Bitter Aperitivo', type: 'essential_liqueur', description: 'Campari-style bitters for negronis and spritzes.' },
  { name: 'Amaro & Digestivo', type: 'supplemental', description: 'Herbal after-dinner liqueurs that add depth.' },
  { name: 'Bitters', type: 'supplemental', description: 'Concentrated aromatic tinctures dashed into drinks.' },
  { name: 'Mixers & Syrups', type: 'mixer', description: 'Tonic, soda, juices and simple syrup.' },
  { name: 'Barware', type: 'tool', description: 'Shakers, jiggers, strainers and glassware.' },
];

// { cat, name, brand, cdb (TheCocktailDB ingredient), tier, low, high, abv, score, summary, trending }
const BOTTLES = [
  // ── Vodka ──────────────────────────────────────────────────────────────────
  { cat: 'Vodka', name: 'Wheat Vodka (House Well)', brand: 'Svedka', cdb: 'Vodka', tier: 'budget', low: 13, high: 18, abv: 40, score: 7.2, summary: 'A clean, inoffensive well vodka that disappears into mixed drinks — exactly what you want from a budget bottle you pour a lot of.' },
  { cat: 'Vodka', name: 'Corn Vodka', brand: 'Tito’s', cdb: 'Vodka', tier: 'mid', low: 20, high: 28, abv: 40, score: 8.1, summary: 'Corn-based and gluten-free with a soft, slightly sweet finish. The default upgrade over a well bottle for most home bars.', trending: true },
  { cat: 'Vodka', name: 'French Wheat Vodka', brand: 'Grey Goose', cdb: 'Vodka', tier: 'premium', low: 30, high: 40, abv: 40, score: 8.3, summary: 'Smooth, faintly citrusy and famously marketed; a safe premium pour for a vodka martini or a gift.' },
  { cat: 'Vodka', name: 'Rye & Wheat Vodka', brand: 'Belvedere', cdb: 'Vodka', tier: 'premium', low: 34, high: 45, abv: 40, score: 8.6, summary: 'Polish rye-and-wheat vodka with a rounded, peppery character that holds up neat or in a spirit-forward martini.' },
  { cat: 'Vodka', name: 'Potato Vodka', brand: 'Chopin', cdb: 'Vodka', tier: 'premium', low: 28, high: 38, abv: 40, score: 8.2, summary: 'Creamy, full-bodied potato vodka with real texture — a change of pace from crisp grain styles.' },
  { cat: 'Vodka', name: 'Value Vodka', brand: 'New Amsterdam', cdb: 'Vodka', tier: 'budget', low: 11, high: 16, abv: 40, score: 6.9, summary: 'Rock-bottom pricing for big-batch punches and jungle juice where nuance is beside the point.' },

  // ── Gin ────────────────────────────────────────────────────────────────────
  { cat: 'Gin', name: 'London Dry Gin', brand: 'Beefeater', cdb: 'Gin', tier: 'budget', low: 18, high: 24, abv: 44, score: 8.0, summary: 'A benchmark London dry: bold juniper, bright citrus, and enough proof to cut through tonic. Punches above its price.' },
  { cat: 'Gin', name: 'London Dry Gin', brand: 'Tanqueray', cdb: 'Gin', tier: 'mid', low: 22, high: 30, abv: 47.3, score: 8.6, summary: 'Crisp, piney and dry at a healthy proof — arguably the most reliable gin & tonic gin on the shelf.', trending: true },
  { cat: 'Gin', name: 'Small Batch Gin', brand: 'Hendrick’s', cdb: 'Gin', tier: 'mid', low: 30, high: 38, abv: 44, score: 8.4, summary: 'Cucumber and rose set this apart from juniper bombs; a crowd-pleaser in a G&T.', trending: true },
  { cat: 'Gin', name: 'Navy Strength Gin', brand: 'Plymouth', cdb: 'Gin', tier: 'premium', low: 38, high: 48, abv: 57, score: 8.7, summary: 'At 57% ABV the botanicals stay vivid even in a shaken cocktail — the martini-with-backbone pick.' },
  { cat: 'Gin', name: 'Contemporary Gin', brand: 'The Botanist', cdb: 'Gin', tier: 'premium', low: 32, high: 42, abv: 46, score: 8.5, summary: 'Twenty-two foraged botanicals give a floral, herbaceous profile that shines in a Martinez or a fancy G&T.' },
  { cat: 'Gin', name: 'Old Tom Gin', brand: 'Ransom', cdb: 'Gin', tier: 'premium', low: 35, high: 45, abv: 44, score: 8.3, summary: 'Barrel-rested, lightly sweet old tom style — the historically correct choice for a Tom Collins or Martinez.' },

  // ── Bourbon & Whiskey ────────────────────────────────────────────────────────
  { cat: 'Bourbon & Whiskey', name: 'Kentucky Straight Bourbon', brand: 'Buffalo Trace', cdb: 'Bourbon', tier: 'mid', low: 26, high: 36, abv: 45, score: 8.8, summary: 'The value darling of American whiskey: caramel, vanilla and spice that make a flawless old fashioned.', trending: true },
  { cat: 'Bourbon & Whiskey', name: 'Bourbon (Bottled-in-Bond)', brand: 'Evan Williams', cdb: 'Bourbon', tier: 'budget', low: 15, high: 22, abv: 50, score: 7.9, summary: 'A 100-proof bonded bourbon at a well-bottle price. Enough character to sip, enough proof to carry a cocktail.' },
  { cat: 'Bourbon & Whiskey', name: 'Small Batch Bourbon', brand: 'Four Roses', cdb: 'Bourbon', tier: 'mid', low: 24, high: 32, abv: 45, score: 8.5, summary: 'Fruity, floral and endlessly mixable; a versatile everyday bourbon that also sips well.' },
  { cat: 'Bourbon & Whiskey', name: 'Wheated Bourbon', brand: 'Maker’s Mark', cdb: 'Bourbon', tier: 'mid', low: 25, high: 33, abv: 45, score: 8.3, summary: 'Soft and wheat-forward with less rye spice — an easy, approachable pour for newcomers.' },
  { cat: 'Bourbon & Whiskey', name: 'Rye Whiskey', brand: 'Rittenhouse', cdb: 'Rye Whiskey', tier: 'mid', low: 26, high: 34, abv: 50, score: 8.6, summary: 'Spicy bonded rye that is the go-to for Manhattans and sazeracs; dry and assertive where bourbon is sweet.' },
  { cat: 'Bourbon & Whiskey', name: 'Single Malt Scotch', brand: 'Glenfiddich 12', cdb: 'Scotch', tier: 'premium', low: 45, high: 60, abv: 40, score: 8.5, summary: 'An approachable Speyside single malt — pear, oak and a whisper of smoke — for sipping rather than mixing.' },
  { cat: 'Bourbon & Whiskey', name: 'Blended Scotch', brand: 'Monkey Shoulder', cdb: 'Scotch', tier: 'mid', low: 30, high: 40, abv: 43, score: 8.2, summary: 'A malt-heavy blend built for cocktails; makes a smooth whisky sour without breaking the bank.', trending: true },
  { cat: 'Bourbon & Whiskey', name: 'Irish Whiskey', brand: 'Jameson', cdb: 'Irish whiskey', tier: 'budget', low: 22, high: 30, abv: 40, score: 8.0, summary: 'Triple-distilled, smooth and gentle; the friendly default for highballs and shots alike.' },
  { cat: 'Bourbon & Whiskey', name: 'Tennessee Whiskey', brand: 'Jack Daniel’s', cdb: 'Tennessee whiskey', tier: 'mid', low: 22, high: 30, abv: 40, score: 7.8, summary: 'Charcoal-mellowed and banana-sweet; a recognizable crowd-pleaser for whiskey-and-cola.' },

  // ── Rum ──────────────────────────────────────────────────────────────────────
  { cat: 'Rum', name: 'White Rum', brand: 'Bacardi Superior', cdb: 'Light rum', tier: 'budget', low: 13, high: 19, abv: 40, score: 7.4, summary: 'The default daiquiri and mojito rum: light, dry and mixable. Nothing fancy, endlessly useful.' },
  { cat: 'Rum', name: 'Aged Rum', brand: 'Appleton Estate Reserve', cdb: 'Dark rum', tier: 'mid', low: 26, high: 34, abv: 40, score: 8.5, summary: 'Jamaican pot-still funk with oak and dried fruit; characterful for a rum old fashioned or serious tiki.', trending: true },
  { cat: 'Rum', name: 'Spiced Rum', brand: 'Sailor Jerry', cdb: 'Spiced rum', tier: 'budget', low: 18, high: 24, abv: 46, score: 7.6, summary: 'Vanilla and baking-spice rum that headlines a rum-and-cola; higher proof than most spiced bottles.' },
  { cat: 'Rum', name: 'Gold Rum', brand: 'Mount Gay Eclipse', cdb: 'Gold rum', tier: 'mid', low: 20, high: 28, abv: 43, score: 8.1, summary: 'Barbados workhorse: lightly aged, balanced and versatile across daiquiris and punches.' },
  { cat: 'Rum', name: 'Demerara Rum', brand: 'El Dorado 12', cdb: 'Dark rum', tier: 'premium', low: 35, high: 45, abv: 40, score: 8.8, summary: 'Rich Guyanese demerara with molasses and toffee depth; a tiki cornerstone and a fine sipper.' },
  { cat: 'Rum', name: 'Overproof Rum', brand: 'Wray & Nephew', cdb: 'Light rum', tier: 'mid', low: 24, high: 32, abv: 63, score: 8.4, summary: 'Fiery Jamaican overproof for floats and authentic tiki builds — a little goes a long way.' },

  // ── Tequila & Agave ──────────────────────────────────────────────────────────
  { cat: 'Tequila & Agave', name: 'Blanco Tequila', brand: 'Espolón', cdb: 'Tequila', tier: 'budget', low: 20, high: 28, abv: 40, score: 8.2, summary: '100% agave at a mixer-friendly price, with a clean citrus-pepper snap for a genuinely good margarita.', trending: true },
  { cat: 'Tequila & Agave', name: 'Blanco Tequila', brand: 'Fortaleza', cdb: 'Tequila', tier: 'premium', low: 50, high: 65, abv: 40, score: 9.2, summary: 'Cult blanco with bright cooked-agave and a savory, oily texture that margarita geeks obsess over.' },
  { cat: 'Tequila & Agave', name: 'Reposado Tequila', brand: 'Fortaleza', cdb: 'Tequila', tier: 'premium', low: 55, high: 75, abv: 40, score: 9.1, summary: 'Cult reposado with cooked-agave sweetness and gentle oak. A splurge sipping fans chase down.' },
  { cat: 'Tequila & Agave', name: 'Reposado Tequila', brand: 'Cimarron', cdb: 'Tequila', tier: 'budget', low: 22, high: 30, abv: 40, score: 8.3, summary: 'Astonishing value repo: real agave character and light oak for cocktail duty.' },
  { cat: 'Tequila & Agave', name: 'Añejo Tequila', brand: 'Herradura', cdb: 'Tequila', tier: 'premium', low: 45, high: 58, abv: 40, score: 8.6, summary: 'Barrel-aged, mellow and vanilla-laced; a sipping añejo or a luxe tequila old fashioned.' },
  { cat: 'Tequila & Agave', name: 'Espadín Mezcal', brand: 'Del Maguey Vida', cdb: 'Mezcal', tier: 'mid', low: 32, high: 42, abv: 42, score: 8.7, summary: 'The bartender’s default mezcal: campfire smoke over bright agave, built to mix into a mezcal margarita.', trending: true },

  // ── Orange Liqueur ─────────────────────────────────────────────────────────────
  { cat: 'Orange Liqueur', name: 'Triple Sec', brand: 'De Kuyper', cdb: 'Triple sec', tier: 'budget', low: 9, high: 14, abv: 30, score: 6.8, summary: 'A serviceable, sweeter triple sec for high-volume margaritas where premium liqueur is wasted.' },
  { cat: 'Orange Liqueur', name: 'Orange Curaçao', brand: 'Cointreau', cdb: 'Cointreau', tier: 'mid', low: 30, high: 40, abv: 40, score: 9.0, summary: 'The gold-standard orange liqueur: bright, boozy and balanced. Upgrades every margarita and sidecar.' },
  { cat: 'Orange Liqueur', name: 'Cognac Orange Liqueur', brand: 'Grand Marnier', cdb: 'Grand Marnier', tier: 'premium', low: 38, high: 50, abv: 40, score: 8.7, summary: 'Richer and rounder than triple sec thanks to a cognac base; excellent in a Grand Margarita.' },
  { cat: 'Orange Liqueur', name: 'Dry Curaçao', brand: 'Pierre Ferrand', cdb: 'Triple sec', tier: 'mid', low: 28, high: 36, abv: 40, score: 8.9, summary: 'A brandy-based, less-sweet curaçao beloved by bartenders for balanced, complex orange lift.' },

  // ── Vermouth ─────────────────────────────────────────────────────────────────
  { cat: 'Vermouth', name: 'Sweet Vermouth', brand: 'Carpano Antica', cdb: 'Sweet Vermouth', tier: 'mid', low: 25, high: 34, abv: 16, score: 9.0, summary: 'A vanilla-rich sweet vermouth that single-handedly elevates a Manhattan or negroni. Keep it cold.' },
  { cat: 'Vermouth', name: 'Dry Vermouth', brand: 'Dolin', cdb: 'Dry Vermouth', tier: 'mid', low: 14, high: 20, abv: 17.5, score: 8.6, summary: 'Crisp, floral Chambéry-style dry vermouth — the martini maker’s reliable default. Buy small, keep cold.' },
  { cat: 'Vermouth', name: 'Sweet Vermouth', brand: 'Cocchi Vermouth di Torino', cdb: 'Sweet Vermouth', tier: 'mid', low: 18, high: 26, abv: 16, score: 8.9, summary: 'Bittersweet and cocoa-tinged; many bartenders’ house pour for red-vermouth cocktails.', trending: true },
  { cat: 'Vermouth', name: 'Blanc Vermouth', brand: 'Dolin Blanc', cdb: 'Dry Vermouth', tier: 'mid', low: 15, high: 22, abv: 16, score: 8.4, summary: 'Sweet-but-crisp white vermouth, lovely in a white negroni or over ice with a twist.' },

  // ── Bitter Aperitivo ────────────────────────────────────────────────────────
  { cat: 'Bitter Aperitivo', name: 'Bitter Aperitivo', brand: 'Campari', cdb: 'Campari', tier: 'mid', low: 26, high: 34, abv: 25, score: 8.8, summary: 'The unmistakable bitter-orange backbone of the negroni and Americano. Divisive, then indispensable.', trending: true },
  { cat: 'Bitter Aperitivo', name: 'Orange Aperitivo', brand: 'Aperol', cdb: 'Aperol', tier: 'budget', low: 22, high: 28, abv: 11, score: 8.3, summary: 'Lower-proof and gently bitter — the whole point of a spritz. Summer in a bottle.', trending: true },
  { cat: 'Bitter Aperitivo', name: 'Bitter Liqueur', brand: 'Luxardo Bitter', cdb: 'Campari', tier: 'mid', low: 24, high: 32, abv: 25, score: 8.5, summary: 'A Campari alternative with a slightly more herbal edge; natural-colored and negroni-ready.' },
  { cat: 'Bitter Aperitivo', name: 'Gentian Aperitif', brand: 'Salers', cdb: 'Aperol', tier: 'premium', low: 30, high: 40, abv: 16, score: 8.4, summary: 'Bracingly bitter French gentian aperitif for low-proof, adventurous spritzes.' },

  // ── Amaro & Digestivo (supplemental) ──────────────────────────────────────────
  { cat: 'Amaro & Digestivo', name: 'Amaro', brand: 'Averna', cdb: 'Amaro', tier: 'mid', low: 26, high: 34, abv: 29, score: 8.7, summary: 'Cola-and-caramel amaro that’s approachable neat and superb in a Black Manhattan.', trending: true },
  { cat: 'Amaro & Digestivo', name: 'Amaro', brand: 'Montenegro', cdb: 'Amaro', tier: 'mid', low: 24, high: 32, abv: 23, score: 8.5, summary: 'Floral, orange-peel amaro; the gateway bottle and a versatile modifier.' },
  { cat: 'Amaro & Digestivo', name: 'Fernet', brand: 'Fernet-Branca', cdb: 'Amaro', tier: 'mid', low: 26, high: 34, abv: 39, score: 8.4, summary: 'Menthol-and-bitterness bomb; the bartender’s handshake and a bracing digestivo.' },
  { cat: 'Amaro & Digestivo', name: 'Maraschino Liqueur', brand: 'Luxardo', cdb: 'Maraschino cherry', tier: 'mid', low: 28, high: 36, abv: 32, score: 8.6, summary: 'Funky, nutty cherry liqueur essential to the Last Word and Aviation.' },
  { cat: 'Amaro & Digestivo', name: 'Coffee Liqueur', brand: 'Kahlúa', cdb: 'Kahlua', tier: 'budget', low: 18, high: 26, abv: 20, score: 7.7, summary: 'The espresso-martini and White Russian standby; sweet, rich and familiar.', trending: true },
  { cat: 'Amaro & Digestivo', name: 'Elderflower Liqueur', brand: 'St-Germain', cdb: 'Elderflower cordial', tier: 'mid', low: 30, high: 40, abv: 20, score: 8.5, summary: 'Floral, pear-and-lychee liqueur that flatters gin, bubbles and spritzes alike.' },
  { cat: 'Amaro & Digestivo', name: 'Herbal Liqueur', brand: 'Green Chartreuse', cdb: 'Green Chartreuse', tier: 'premium', low: 55, high: 75, abv: 55, score: 9.0, summary: 'Intense, 130-herb monastic liqueur; the soul of the Last Word and a hundred modern classics.' },

  // ── Bitters (supplemental) ──────────────────────────────────────────────────
  { cat: 'Bitters', name: 'Aromatic Bitters', brand: 'Angostura', cdb: 'Angostura bitters', tier: 'budget', low: 8, high: 12, abv: 44.7, score: 9.2, summary: 'A few dashes go in nearly everything; one small bottle lasts years. Arguably the highest-impact buy here.' },
  { cat: 'Bitters', name: 'Creole Bitters', brand: 'Peychaud’s', cdb: 'Peychaud bitters', tier: 'budget', low: 9, high: 14, abv: 35, score: 8.7, summary: 'Bright, anise-cherry bitters that define the Sazerac and lend color to spritzy drinks.' },
  { cat: 'Bitters', name: 'Orange Bitters', brand: 'Regans’ No.6', cdb: 'Orange bitters', tier: 'budget', low: 9, high: 14, abv: 45, score: 8.5, summary: 'The classic orange bitters for martinis and old fashioneds; a citrus lift most bars keep on hand.' },
  { cat: 'Bitters', name: 'Chocolate Bitters', brand: 'Fee Brothers', cdb: 'Chocolate bitters', tier: 'budget', low: 8, high: 13, abv: 2.5, score: 8.0, summary: 'Cocoa-forward bitters that pair beautifully with aged spirits and amari.' },

  // ── Mixers & Syrups (mixer) ───────────────────────────────────────────────────
  { cat: 'Mixers & Syrups', name: 'Indian Tonic Water (4-pack)', brand: 'Fever-Tree', cdb: 'Tonic water', tier: 'budget', low: 5, high: 9, abv: 0, score: 8.6, summary: 'Crisp, less-sweet tonic that makes a supermarket gin taste expensive.', trending: true },
  { cat: 'Mixers & Syrups', name: 'Club Soda (6-pack)', brand: 'Topo Chico', cdb: 'Soda water', tier: 'budget', low: 6, high: 10, abv: 0, score: 8.2, summary: 'Aggressively fizzy mineral water for highballs, spritzes and rickeys.' },
  { cat: 'Mixers & Syrups', name: 'Ginger Beer (4-pack)', brand: 'Fever-Tree', cdb: 'Ginger ale', tier: 'budget', low: 5, high: 9, abv: 0, score: 8.3, summary: 'Spicy, dry ginger beer built for a proper Moscow Mule or Dark ’n’ Stormy.' },
  { cat: 'Mixers & Syrups', name: 'Simple Syrup', brand: 'Small Hand Foods', cdb: 'Sugar syrup', tier: 'budget', low: 8, high: 13, abv: 0, score: 8.4, summary: 'A quality gum/simple syrup for silky texture — or make your own 1:1 in two minutes.' },
  { cat: 'Mixers & Syrups', name: 'Orgeat Syrup', brand: 'Small Hand Foods', cdb: 'Orgeat syrup', tier: 'mid', low: 12, high: 18, abv: 0, score: 8.7, summary: 'Real almond orgeat — the nutty heart of a Mai Tai that bottled versions can’t match.' },

  // ── Barware (tool) ────────────────────────────────────────────────────────────
  { cat: 'Barware', name: 'Boston Shaker Set', brand: 'Koriko', cdb: null, tier: 'budget', low: 18, high: 28, abv: 0, score: 9.0, summary: 'Weighted tin-on-tin shaker that seals reliably and out-performs pretty cobbler shakers.', trending: true },
  { cat: 'Barware', name: 'Japanese Jigger (¾/1½ oz)', brand: 'Cocktail Kingdom', cdb: null, tier: 'budget', low: 10, high: 16, abv: 0, score: 8.8, summary: 'Tall, precise jigger with interior measures — the single biggest upgrade to consistency.' },
  { cat: 'Barware', name: 'Hawthorne Strainer', brand: 'Cocktail Kingdom', cdb: null, tier: 'budget', low: 9, high: 15, abv: 0, score: 8.6, summary: 'Tight-sprung strainer that fits standard tins; pair with a fine mesh for shaken drinks.' },
  { cat: 'Barware', name: 'Barspoon & Mixing Glass', brand: 'Yarai', cdb: null, tier: 'mid', low: 20, high: 30, abv: 0, score: 8.5, summary: 'Weighted spoon and fluted mixing glass for stirred drinks that look as good as they taste.' },
];

const INGREDIENT_CACHE = [
  { name: 'Vodka', alc: true, type: 'Vodka', abv: 40 },
  { name: 'Gin', alc: true, type: 'Gin', abv: 40 },
  { name: 'Bourbon', alc: true, type: 'Whiskey', abv: 45 },
  { name: 'Rye Whiskey', alc: true, type: 'Whiskey', abv: 50 },
  { name: 'Scotch', alc: true, type: 'Whiskey', abv: 40 },
  { name: 'Irish whiskey', alc: true, type: 'Whiskey', abv: 40 },
  { name: 'Tennessee whiskey', alc: true, type: 'Whiskey', abv: 40 },
  { name: 'Light rum', alc: true, type: 'Rum', abv: 40 },
  { name: 'Dark rum', alc: true, type: 'Rum', abv: 40 },
  { name: 'Spiced rum', alc: true, type: 'Rum', abv: 46 },
  { name: 'Gold rum', alc: true, type: 'Rum', abv: 43 },
  { name: 'Tequila', alc: true, type: 'Tequila', abv: 40 },
  { name: 'Mezcal', alc: true, type: 'Agave', abv: 42 },
  { name: 'Triple sec', alc: true, type: 'Liqueur', abv: 30 },
  { name: 'Cointreau', alc: true, type: 'Liqueur', abv: 40 },
  { name: 'Grand Marnier', alc: true, type: 'Liqueur', abv: 40 },
  { name: 'Sweet Vermouth', alc: true, type: 'Fortified Wine', abv: 16 },
  { name: 'Dry Vermouth', alc: true, type: 'Fortified Wine', abv: 17.5 },
  { name: 'Campari', alc: true, type: 'Liqueur', abv: 25 },
  { name: 'Aperol', alc: true, type: 'Liqueur', abv: 11 },
  { name: 'Amaro', alc: true, type: 'Liqueur', abv: 29 },
  { name: 'Maraschino cherry', alc: true, type: 'Liqueur', abv: 32 },
  { name: 'Kahlua', alc: true, type: 'Liqueur', abv: 20 },
  { name: 'Elderflower cordial', alc: true, type: 'Liqueur', abv: 20 },
  { name: 'Green Chartreuse', alc: true, type: 'Liqueur', abv: 55 },
  { name: 'Angostura bitters', alc: true, type: 'Bitters', abv: 44.7 },
  { name: 'Peychaud bitters', alc: true, type: 'Bitters', abv: 35 },
  { name: 'Orange bitters', alc: true, type: 'Bitters', abv: 45 },
  { name: 'Chocolate bitters', alc: false, type: 'Bitters', abv: 2.5 },
  { name: 'Lime juice', alc: false, type: 'Juice', abv: null },
  { name: 'Lemon juice', alc: false, type: 'Juice', abv: null },
  { name: 'Sugar syrup', alc: false, type: 'Syrup', abv: null },
  { name: 'Orgeat syrup', alc: false, type: 'Syrup', abv: null },
  { name: 'Tonic water', alc: false, type: 'Soda', abv: null },
  { name: 'Soda water', alc: false, type: 'Soda', abv: null },
  { name: 'Ginger ale', alc: false, type: 'Soda', abv: null },
  { name: 'Orange juice', alc: false, type: 'Juice', abv: null },
];

function retailerLinks(bottleName, brand) {
  const q = encodeURIComponent(`${brand} ${bottleName}`.slice(0, 60));
  return [
    { retailerName: 'Total Wine', affiliateNetwork: 'flexoffers', url: `https://www.totalwine.com/search/all?text=${q}`, trackingId: 'REPLACE_WITH_FLEXOFFERS_ID', isAffiliate: true },
    { retailerName: 'Wine.com', affiliateNetwork: 'rakuten', url: `https://www.wine.com/search/${q}/0`, trackingId: 'REPLACE_WITH_RAKUTEN_ID', isAffiliate: true },
  ];
}

async function main() {
  console.log('[seed] Categories...');
  const catByName = {};
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({ where: { name: c.name }, update: { type: c.type, description: c.description }, create: c });
    catByName[c.name] = row.id;
  }

  console.log(`[seed] Bottles + affiliate links (${BOTTLES.length})...`);
  for (const b of BOTTLES) {
    await prisma.bottle.upsert({
      where: { id: (await findBottleId(b)) ?? -1 },
      update: {},
      create: {
        categoryId: catByName[b.cat],
        name: b.name,
        brand: b.brand,
        abv: b.abv,
        sizeMl: b.cat === 'Barware' || b.cat === 'Mixers & Syrups' ? null : 750,
        cocktaildbIngredientName: b.cdb,
        expertScore: b.score,
        expertSummary: b.summary,
        sourceLinks: [
          { label: 'Producer site', url: 'https://example.com/producer' },
          { label: 'Tasting notes (attribution)', url: 'https://example.com/notes' },
        ],
        priceLow: b.low,
        priceHigh: b.high,
        priceSource: 'manual',
        priceUpdatedAt: new Date(),
        budgetTier: b.tier,
        trending: !!b.trending,
        imageUrl: null,
        affiliateLinks: { create: retailerLinks(b.name, b.brand) },
      },
    });
  }

  console.log('[seed] Ingredient cache sample...');
  for (const i of INGREDIENT_CACHE) {
    await prisma.ingredientCache.upsert({
      where: { ingredientName: i.name },
      update: { isAlcoholic: i.alc, type: i.type, abv: i.abv, lastSyncedAt: new Date() },
      create: { ingredientName: i.name, isAlcoholic: i.alc, type: i.type, abv: i.abv },
    });
  }

  console.log('[seed] Admin user...');
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'change-me-admin-password';
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });
  console.log(`[seed] Admin: ${email}`);

  console.log('[seed] Done.');
}

// Bottles have no natural unique key, so look one up by name+brand for idempotency.
async function findBottleId(b) {
  const existing = await prisma.bottle.findFirst({ where: { name: b.name, brand: b.brand }, select: { id: true } });
  return existing?.id ?? null;
}

main()
  .catch((e) => {
    console.error('[seed] Failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
