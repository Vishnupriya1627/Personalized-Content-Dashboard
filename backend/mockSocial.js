const handles = [
  "@devdaily",
  "@filmbuff",
  "@marketwatch",
  "@sportsdesk",
  "@sciencenow",
  "@healthhub",
];
const templates = [
  {
    tag: "technology",
    text: "New framework release is changing how we build UIs. Thoughts? #technology #webdev",
  },
  {
    tag: "technology",
    text: "AI tooling keeps getting better every month. #technology #ai",
  },
  {
    tag: "sports",
    text: "What a finish! That last-minute goal had the whole stadium on its feet. #sports",
  },
  {
    tag: "sports",
    text: "Training season starts now. Early mornings, big goals. #sports #fitness",
  },
  {
    tag: "finance",
    text: "Markets are mixed today as investors wait for the next rate decision. #finance",
  },
  {
    tag: "finance",
    text: "Budgeting tip: automate your savings before you can spend it. #finance",
  },
  {
    tag: "entertainment",
    text: "Just watched the new release and the soundtrack is unreal. #entertainment #movies",
  },
  {
    tag: "science",
    text: "New telescope images reveal galaxies we never knew existed. #science #space",
  },
  {
    tag: "health",
    text: "Ten minutes of walking after meals really does help. #health",
  },
  {
    tag: "business",
    text: "Markets are mixed today as investors wait for the next rate decision. #finance",
  },
  {
    tag: "business",
    text: "Budgeting tip: automate your savings before you can spend it. #finance",
  },
];

export const posts = Array.from({ length: 60 }, (_, i) => {
  const t = templates[i % templates.length];
  const handle = handles[i % handles.length];
  return {
    id: `social-${i + 1}`,
    type: "social",
    title: handle,
    description: t.text,
    image:
      i % 3 === 0 ? `https://picsum.photos/seed/pulse${i}/600/400` : undefined,
    url: `https://www.google.com/search?q=${encodeURIComponent('#' + t.tag)}`,
    category: t.tag,
    source: "Social",
    publishedAt: new Date(Date.now() - i * 3600_000).toISOString(),
    likes: ((i * 37) % 500) + 5,
  };
});
