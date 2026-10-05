const CATEGORIES = ['technology', 'sports', 'business', 'entertainment', 'science', 'health'];

const HANDLES = ['@devdaily', '@filmbuff', '@marketwatch', '@sportsdesk', '@sciencenow', '@healthhub'];

const CONTENT = {
  technology: {
    headlines: ['Chipmaker unveils faster AI accelerator', 'Open-source browser engine hits a new milestone', 'Startup ships a pocket-sized quantum sensor'],
    posts: ['Just tried the new release and the speed-up is real. #technology', 'Hot take: tooling matters more than frameworks. #technology #webdev'],
  },
  sports: {
    headlines: ['Last-minute goal decides the derby', 'Veteran sprinter breaks a decade-old record', 'Coach announces surprise lineup for the final'],
    posts: ['What a finish! The whole stadium is on its feet. #sports', 'Early mornings, big goals. Season starts now. #sports #fitness'],
  },
  business: {
    headlines: ['Markets edge higher ahead of rate decision', 'Retailer reports stronger than expected quarter', 'Central bank hints at a slower pace of cuts'],
    posts: ['Automate your savings before you can spend it. #finance', 'Markets are mixed today, patience pays. #finance'],
  },
  entertainment: {
    headlines: ['Surprise sequel announced for fan-favourite film', 'Festival lineup revealed with a few big names', 'Soundtrack tops the streaming charts overnight'],
    posts: ['Just watched the new release and the soundtrack is unreal. #entertainment #movies', 'Nothing beats a good movie night. #entertainment'],
  },
  science: {
    headlines: ['New telescope images reveal distant galaxies', 'Researchers map a previously unknown deep-sea habitat', 'Probe returns samples from a near-Earth asteroid'],
    posts: ['Space never stops being amazing. #science #space', 'Peer review is slow, but it works. #science'],
  },
  health: {
    headlines: ['Study links short walks after meals to better sleep', 'Hospital pilots a faster screening method', 'Nutrition guidelines updated for the new year'],
    posts: ['Ten minutes of walking after meals really does help. #health', 'Hydration check: have you had water today? #health'],
  },
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];

let counter = 0;

export function generateLiveItem() {
  counter += 1;
  const category = pick(CATEGORIES);
  const id = `live-${Date.now()}-${counter}`;
  const base = {
    id,
    category,
    url: `https://example.com/live/${id}`,
    publishedAt: new Date().toISOString(),
  };

  if (Math.random() < 0.6) {
  return {
    ...base,
    type: 'social',
    title: pick(HANDLES),
    url: `https://www.google.com/search?q=${encodeURIComponent('#' + category)}`,  
    description: pick(CONTENT[category].posts),
    image: `https://picsum.photos/seed/${id}/600/400`,
    source: 'Live',
    likes: Math.floor(Math.random() * 200),
  };
}

  const title = pick(CONTENT[category].headlines);

return {
  ...base,
  type: 'news',
  title,
  url: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
  description: 'Live update from the newsroom. More details are expected shortly.',
  image: `https://picsum.photos/seed/${id}/600/400`,
  source: 'Live Wire',
};
}