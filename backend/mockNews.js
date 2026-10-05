const HEADLINES = {
  technology: [
    'Chipmaker unveils faster AI accelerator for data centers',
    'Open-source browser engine reaches a major milestone',
    'Startup ships a pocket-sized quantum sensor',
    'New framework promises faster page loads with less code',
    'Researchers demo battery that charges in five minutes',
  ],
  sports: [
    'Last-minute goal decides the derby',
    'Veteran sprinter breaks a decade-old record',
    'Coach announces surprise lineup for the final',
    'Young goalkeeper becomes the hero of the season opener',
    'Marathon organisers add a new city to the circuit',
  ],
  business: [
    'Markets edge higher ahead of the rate decision',
    'Retailer reports stronger than expected quarter',
    'Central bank hints at a slower pace of cuts',
    'Startup funding rebounds for the second straight quarter',
    'Airlines expect record travel demand this season',
  ],
  entertainment: [
    'Surprise sequel announced for a fan-favourite film',
    'Festival lineup revealed with several big names',
    'Soundtrack tops the streaming charts overnight',
    'Director teases a new project in an exclusive interview',
    'Indie drama sweeps the weekend awards',
  ],
  science: [
    'New telescope images reveal distant galaxies',
    'Researchers map a previously unknown deep-sea habitat',
    'Probe returns samples from a near-Earth asteroid',
    'Study finds ancient forests stored more carbon than expected',
    'Lab-grown coral shows promise for reef restoration',
  ],
  health: [
    'Study links short walks after meals to better sleep',
    'Hospital pilots a faster screening method',
    'Nutrition guidelines updated for the new year',
    'Trial shows promising results for a new migraine treatment',
    'Sleep experts weigh in on the four-day work week',
  ],
  general: [
    'City unveils plan for a new riverside park',
    'Community library launches free coding classes',
    'Weather service expects a mild week ahead',
    'Local bakery wins national award for sourdough',
    'Volunteers clean up record amount of coastline',
  ],
};

const now = Date.now();

const ALL = Object.entries(HEADLINES).flatMap(([category, titles]) =>
  titles.map((title, i) => ({
    id: `sample-news-${category}-${i}`,
    type: 'news',
    title,
    description: 'Sample headline shown because the live news service is temporarily unavailable.',
    image: `https://picsum.photos/seed/${category}${i}/600/400`,
    url: 'https://example.com/sample-news',
    category,
    source: 'Sample News',
    publishedAt: new Date(now - (i * 5 + 1) * 3600_000).toISOString(),
  }))
);

export function sampleByCategory(category, page, perPage) {
  const pool = ALL.filter((a) => a.category === category);
  const start = (page - 1) * perPage;
  return pool.slice(start, start + perPage);
}

export function sampleBySearch(q, page, pageSize) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const pool = ALL.filter((a) => {
    const text = `${a.title} ${a.category}`.toLowerCase();
    return words.every((w) => text.includes(w));
  });
  const start = (page - 1) * pageSize;
  return pool.slice(start, start + pageSize);
}