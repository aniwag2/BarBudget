// Original long-form editorial content. This is genuine publisher writing (not
// scraped or API-sourced) — the substance AdSense looks for. Each guide is a set
// of headed sections so we can render clean, readable articles.

export type GuideSection = { heading?: string; paragraphs: string[] };
export type Guide = {
  slug: string;
  title: string;
  description: string;
  updated: string; // ISO date
  readingMinutes: number;
  sections: GuideSection[];
};

export const GUIDES: Guide[] = [
  {
    slug: 'how-to-build-a-home-bar',
    title: 'How to Build a Home Bar From Scratch',
    description:
      'A practical, budget-first roadmap for going from an empty shelf to a bar that can make dozens of classic cocktails — without overspending.',
    updated: '2026-09-01',
    readingMinutes: 7,
    sections: [
      {
        paragraphs: [
          'Most people build a home bar backwards. They buy a bottle because a single recipe called for it, then another, and another, until the shelf is a graveyard of half-used liqueurs that never get touched again. A better approach is to start from the drinks you actually want to make and work outward to the smallest set of bottles that unlocks them. Do that well and six or seven bottles will cover a surprising share of the classic canon.',
          'This guide walks through how we think about building a bar on a budget: which categories matter most, the order to buy them in, and where spending more genuinely improves the drink versus where it just improves the label. It pairs with our build-my-bar calculator, which turns these principles into a specific shopping list for your budget.',
        ],
      },
      {
        heading: 'Start with base spirits, not modifiers',
        paragraphs: [
          'A base spirit is the backbone of a drink — the vodka, gin, whiskey, rum, or tequila that makes up most of the glass. Modifiers (vermouth, orange liqueur, bitters, amari) shape and season it. Because a base spirit is the largest and most-tasted ingredient, it is where quality is most noticeable, and it is also the ingredient most recipes are built around. Buy one or two base spirits you genuinely enjoy before you buy a single modifier.',
          'If you like bright, citrus-forward drinks, gin and tequila open up an enormous range — gin & tonics, martinis, margaritas, palomas. If you prefer spirit-forward, brown-spirit drinks, a good bourbon or rye covers old fashioneds, Manhattans, and whiskey sours. You do not need all five base categories on day one; two chosen around your taste will make more drinks than five bought at random.',
        ],
      },
      {
        heading: 'Add the high-leverage modifiers',
        paragraphs: [
          'After base spirits, a few modifiers deliver an outsized return. A bottle of aromatic bitters costs less than a cocktail at a bar and finds its way into dozens of recipes; a small bottle lasts years. Sweet and dry vermouth unlock the entire martini-and-Manhattan family, but because they are wine-based they oxidize — buy the smallest bottles you can and keep them in the refrigerator. A good orange liqueur turns a so-so margarita into a great one and does the same for sidecars and cosmopolitans.',
          'These modifiers are cheap relative to how many drinks they enable, which is exactly why our calculator suggests them right after essentials: they are the highest ratio of drinks-unlocked to dollars-spent on the whole shelf.',
        ],
      },
      {
        heading: 'Buy fresh citrus and make your own syrup',
        paragraphs: [
          'The single biggest quality jump in home cocktails is not a more expensive bottle — it is fresh citrus and fresh syrup. Bottled sour mix and pre-squeezed juice taste flat and slightly cooked; a lime or lemon squeezed to order tastes alive. Simple syrup is just equal parts sugar and hot water, stirred until clear, and it keeps for a couple of weeks in the fridge. Between fresh juice and fresh syrup, a $15 bottle of tequila can make a better margarita than a $60 bottle shaken with sour mix.',
        ],
      },
      {
        heading: 'Grow the bar around what you drink',
        paragraphs: [
          'Once the essentials are in place, let your own habits guide expansion rather than a checklist. If you keep reaching for the negroni, a bitter aperitivo and a nicer sweet vermouth are the obvious next buys. If tiki drinks are your thing, an aged rum and real orgeat matter more than a fourth gin. The catalog and cocktail search on this site are built to support exactly this: filter cocktails by a spirit you already own to see what one more bottle would unlock before you buy it.',
          'Build slowly, buy for drinks you actually make, and prioritize freshness and technique over prestige labels. A thoughtfully assembled seven-bottle bar will out-pour a cluttered twenty-bottle one almost every time.',
        ],
      },
    ],
  },
  {
    slug: 'essential-bottles-every-home-bar-needs',
    title: 'The Bottles Every Home Bar Actually Needs',
    description:
      'The short, opinionated list of spirits and modifiers that unlock the most classic cocktails per dollar — and why each one earns its place.',
    updated: '2026-09-03',
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          'If you asked ten bartenders for their essential home-bar list you would get ten slightly different answers, but they would overlap far more than they differ. The overlap is what matters. Below is the core set we recommend to almost everyone, chosen not because any single bottle is irreplaceable but because together they make the widest range of recognizable, well-balanced drinks.',
        ],
      },
      {
        heading: 'A London dry gin',
        paragraphs: [
          'Gin is the most versatile base spirit for a beginning bar. A single bottle of a bold London dry makes gin & tonics, martinis, negronis, gimlets, Tom Collinses, and French 75s. Because gin is defined by its botanicals rather than by aging, you can buy an excellent one for the price of a mediocre aged spirit. Look for something juniper-forward with enough proof to stand up to tonic and citrus.',
        ],
      },
      {
        heading: 'A mixing whiskey — bourbon or rye',
        paragraphs: [
          'For brown-spirit drinks, one bottle of a solid bourbon or rye covers old fashioneds, Manhattans, whiskey sours, and boulevardiers. Bourbon leans sweeter and rounder; rye is drier and spicier and many people prefer it in a Manhattan. Either works as your one whiskey; pick the profile you enjoy sipping, because you will.',
        ],
      },
      {
        heading: 'A 100% agave blanco tequila',
        paragraphs: [
          'Tequila is non-negotiable if you like margaritas, palomas, or a good tequila sour, and a 100% agave blanco at a friendly price makes a genuinely excellent margarita when paired with fresh lime and orange liqueur. Avoid mixto (anything not labeled 100% agave); the difference in a shaken drink is dramatic.',
        ],
      },
      {
        heading: 'Sweet and dry vermouth',
        paragraphs: [
          'These two aromatized wines are the quiet workhorses of the classic canon. Dry vermouth makes the martini; sweet vermouth makes the Manhattan and the negroni. Because they are wine, treat them like wine: buy small bottles and refrigerate after opening so they do not turn dull and flat.',
        ],
      },
      {
        heading: 'Orange liqueur and aromatic bitters',
        paragraphs: [
          'A good orange liqueur is the difference between a flat margarita and a bright one, and it does the same work in sidecars and cosmopolitans. Aromatic bitters are the seasoning of the cocktail world — a few dashes deepen an old fashioned, a Manhattan, and dozens of other drinks, and one small bottle lasts for years. Dollar for dollar, bitters may be the highest-impact purchase on the entire list.',
        ],
      },
      {
        paragraphs: [
          'That is the core: a gin, a whiskey, a tequila, two vermouths, an orange liqueur, and a bottle of bitters. Add fresh citrus and simple syrup and you can make a genuinely impressive range of drinks. Everything after this is personalization — and our calculator will tailor the exact bottles and brands to your budget.',
        ],
      },
    ],
  },
  {
    slug: 'budget-vs-premium-spirits',
    title: 'Budget vs Premium: Where Your Money Actually Matters',
    description:
      'When trading up genuinely improves the drink, and when you are mostly paying for the bottle. A category-by-category breakdown.',
    updated: '2026-09-05',
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          'Spirits pricing is not a straight line from bad to good. In some categories an extra twenty dollars transforms the glass; in others it buys a heavier bottle and a nicer label with little change in what you actually taste — especially once the spirit is shaken with citrus and sugar. Knowing which is which is how you build a better bar for less.',
        ],
      },
      {
        heading: 'Vodka: spend the least',
        paragraphs: [
          'Vodka is defined by neutrality, so the more "premium" it is, the more you are paying for marketing and packaging rather than flavor. In a mixed drink, a mid-priced vodka is essentially indistinguishable from a luxury one. Buy a clean, inexpensive bottle and put the savings toward a category where quality is audible.',
        ],
      },
      {
        heading: 'Tequila and agave: spend more, carefully',
        paragraphs: [
          'Agave is the category where trading up is most rewarding. The jump from mixto to 100% agave is night and day, and within 100% agave, additive-free blancos and well-made reposados show real, tastable complexity. You do not need a cult bottle to make a great margarita, but this is a category where a mid-tier pour genuinely beats a budget one in the glass.',
        ],
      },
      {
        heading: 'Whiskey: diminishing returns arrive fast',
        paragraphs: [
          'For cocktails, a well-made $25–35 bourbon or rye is often indistinguishable from a $60 one once it meets bitters and sugar — and sometimes better, because many pricier bottles are built for sipping neat rather than mixing. Save the special bottle for the glass you drink slowly, and mix with something reliable and mid-priced.',
        ],
      },
      {
        heading: 'Gin: quality is cheap',
        paragraphs: [
          'Because gin gets its character from botanicals rather than years in a barrel, excellent gin is inexpensive to make and to buy. This is the rare category where a modestly priced, benchmark bottle is genuinely world-class in a drink. Spend a little more only if you want a specific contemporary style, not because you assume price tracks quality here.',
        ],
      },
      {
        heading: 'Modifiers: buy the good version',
        paragraphs: [
          'Vermouth, orange liqueur, and amari are the places where a small step up in price reliably improves the drink and where the bottle is cheap enough that trading up barely dents the budget. A better sweet vermouth can carry a whole Manhattan. Because you use these in small measures, a good bottle also lasts, making the per-drink cost trivial.',
        ],
      },
      {
        paragraphs: [
          'Our expert scores and budget tiers are built around exactly this logic: we weight how a bottle performs in a drink relative to its price, not its prestige. When the calculator suggests a "budget" tequila but a "mid" vermouth, that is this framework in action.',
        ],
      },
    ],
  },
  {
    slug: 'bar-tools-and-technique',
    title: 'Bar Tools and Techniques for Better Drinks at Home',
    description:
      'The handful of tools that actually change the drink, plus the core techniques — shaking, stirring, and measuring — that matter more than any bottle.',
    updated: '2026-09-07',
    readingMinutes: 6,
    sections: [
      {
        paragraphs: [
          'You can spend more on barware than on spirits, but you do not need to. A small, well-chosen tool kit and three basic techniques will do more for your drinks than any single upgrade to a bottle. Here is what actually matters and why.',
        ],
      },
      {
        heading: 'The four tools worth owning',
        paragraphs: [
          'A weighted tin-on-tin shaker seals reliably and chills fast; the pretty three-piece "cobbler" shakers tend to freeze shut at the worst moment. A jigger with clearly marked measures is the single biggest upgrade to consistency, because cocktails are ratios and eyeballing them is how good recipes go wrong. A Hawthorne strainer keeps ice out of the glass on shaken drinks, and a barspoon plus any pint glass lets you stir the spirit-forward ones properly. That is the whole essential kit.',
        ],
      },
      {
        heading: 'Shake or stir — and why it matters',
        paragraphs: [
          'The rule is simple: shake drinks with citrus or other cloudy ingredients, stir drinks that are all spirit. Shaking aerates and rapidly chills and dilutes, which is exactly what a margarita or whiskey sour wants; it also makes the drink cloudy, which is fine for those and wrong for a martini or Manhattan. Stirring chills and dilutes gently while keeping the drink silky and clear. Using the wrong method is one of the most common reasons a home cocktail tastes "off" despite good ingredients.',
        ],
      },
      {
        heading: 'Measure everything',
        paragraphs: [
          'Bartenders who look like they are free-pouring have made the same drink ten thousand times; you have not, and that is fine. Measuring with a jigger is not fussy, it is how you get the same good drink twice. A classic sour is roughly two parts spirit, one part citrus, three-quarters part syrup — but ratios only help if you actually measure them. This is also why our calculator and recipes lean on proportions rather than vague "splashes."',
        ],
      },
      {
        heading: 'Ice is an ingredient',
        paragraphs: [
          'Bigger, colder, fresher ice melts more slowly, so it chills without over-diluting. Cloudy, small, freezer-burned cubes water a drink down fast and can carry freezer odors. You do not need clear-ice gadgets to start — just use fresh ice, fill the shaker or glass properly full, and do not let a drink sit on melting ice longer than it takes to enjoy it.',
        ],
      },
      {
        paragraphs: [
          'Master measuring, learn when to shake versus stir, keep good ice, and buy four decent tools. Do that and inexpensive bottles will make drinks that taste like they came from a much more expensive bar.',
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
