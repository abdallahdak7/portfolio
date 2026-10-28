export const profile = {
  name: "Abdallah Daknache",
  role: "Senior Mobile Engineer",
  company: "Pepperstone",
  location: "Limassol, Cyprus",
  availability: "Open to Lead & Senior Mobile roles",
  email: "abdallah.daknache@gmail.com",
  linkedin: "https://www.linkedin.com/in/abdallah-daknache/",
  github: "https://github.com/abdallahdak7",
  resume: "/Abdallah_Daknache_Resume.pdf",
  headline:
    "On the platform team behind a global trading app, I own core initiatives across mobile and web, from shaping the problem with product to shipping it to production. I work AI-first every day.",
  summary:
    "7+ years across backend, web, and mobile. That breadth is what lets me work across team boundaries, and it's why I'm ready to take on more leadership next.",
};

export const glance = [
  { label: "Experience", value: "7+ years · backend, web, mobile" },
  { label: "Team", value: "Platform team · 10-engineer org" },
  { label: "Way of working", value: "AI-first, every day" },
  { label: "Domain", value: "Fintech · Trading" },
];

export const leadershipIntro =
  "I connect systems, people, and product goals, and choose solutions that hold up over time without adding unnecessary complexity.";

export const principles = [
  {
    title: "Own the outcome",
    body: "I take initiatives from requirements to release and stay accountable for how they perform in users' hands.",
  },
  {
    title: "Align people around trade-offs",
    body: "I work with product, design, and engineering to agree on scope, make trade-offs explicit, and keep stakeholders informed.",
  },
  {
    title: "Share what I know",
    body: "I share knowledge through code reviews and guidance, support mid-level and junior engineers, and take part in technical interviews as the team grows.",
  },
  {
    title: "Improve how we work",
    body: "I put practices in place that scale beyond me, so the team decides with data and ships with confidence.",
  },
];

export type SpotlightRow = { label: string; text: string; highlight?: boolean };

export const spotlight = {
  title: "Tom, the AI assistant on this page",
  tag: "AI · Personal project",
  summary:
    "Tom answers recruiters' and hiring managers' questions about my work at any hour, and can pass on a message or help book a call. I designed and built him myself, using AI throughout.",
  rows: [
    {
      label: "The goal",
      text: "Give visitors quick, reliable answers about my experience, without waiting for me to reply.",
    },
    {
      label: "Judgment calls",
      text: "Tom only shares what I've reviewed and approved, and says so when he doesn't know. Built-in limits keep him on topic and keep running costs in check.",
    },
    {
      label: "Why it matters",
      highlight: true,
      text: "It's live on this page, not a demo, and it shows how I approach AI: useful, grounded in facts I've approved, and given clear limits.",
    },
  ] satisfies SpotlightRow[] as SpotlightRow[],
  cta: { label: "Try Tom", href: "#ask-tom" },
};

export const ai = {
  badge: "Daily practice, not an experiment",
  intro:
    "I focus on turning AI into real productivity, for me and for the team, while keeping it safe in a regulated product.",
  pillars: [
    {
      title: "In my daily work",
      body: "AI supports me from planning to code, review, testing, and documentation, so my time goes to decisions rather than repetition.",
    },
    {
      title: "Across the team",
      body: "I share reusable AI workflows with my team and keep trying new AI tools, so we adopt what genuinely works.",
    },
    {
      title: "With guardrails",
      body: "AI speeds up the work; engineers stay accountable for it. Everything is reviewed and tested, with care for security and compliance.",
    },
  ],
};

export type Role = { title: string; period: string; points?: string[] };
export type Job = {
  company: string;
  context?: string;
  location: string;
  roles: Role[];
};

export const experience: Job[] = [
  {
    company: "Pepperstone",
    context: "Multi-award-winning global online broker",
    location: "Limassol, Cyprus",
    roles: [
      {
        title: "Senior Mobile Engineer",
        period: "Aug 2024 — Present",
        points: [
          "Own core initiatives on the platform team, from requirements through release.",
          "Built the shared sign-in platform used across Pepperstone's web and mobile apps, giving clients one secure, consistent experience and removing duplicated work across teams.",
          "Align product, design, and engineering on scope, risks, and progress.",
          "Took part in growing the engineering team to 10 people through technical interviews, and share knowledge with mid-level and junior engineers.",
          "Champion AI adoption in the team by sharing reusable workflows that make engineers more efficient.",
        ],
      },
      {
        title: "Mobile Engineer",
        period: "Jul 2022 — Jul 2024",
        points: [
          "Delivered features for a production trading app where speed and reliability are business-critical.",
          "Made app performance measurable, so performance work could be prioritised on data.",
          "Made releases more reliable and issues in production quicker to spot.",
        ],
      },
    ],
  },
  {
    company: "EverestCM",
    location: "Limassol, Cyprus · Remote",
    roles: [
      {
        title: "Senior Frontend Engineer",
        period: "Oct 2021 — Jul 2022",
        points: ["Delivered web features and made the site faster and easier to maintain."],
      },
    ],
  },
  {
    company: "Orea.io",
    location: "Limassol, Cyprus",
    roles: [
      {
        title: "Mid-Level Frontend Engineer",
        period: "Feb 2021 — Oct 2021",
        points: ["Built a web app for traders with product and design, focused on speed and handling large amounts of data."],
      },
    ],
  },
  {
    company: "GO.MEDIA KG",
    location: "Germany · Remote",
    roles: [
      { title: "Mid-Level Backend Engineer", period: "Jul 2020 — Feb 2021" },
      {
        title: "Junior Backend Engineer",
        period: "May 2019 — Jun 2020",
        points: ["Built the backend services behind the product, including integrations with third-party providers."],
      },
    ],
  },
];

export const engineeringSkills = ["React Native", "TypeScript", "iOS", "Platform & authentication", "Performance"];

export const askTom = {
  title: "Got a question? Ask Tom",
  intro:
    "Ask Tom about my work and experience. He answers from a profile I've reviewed and approved, and can pass a message on to me or share a link to book a call. Tom can get things wrong, so check anything important with me directly.",
};

export const lookingFor = {
  title: "Hiring for a mobile lead or senior mobile engineer? Let's talk.",
  roles: "Mobile Lead / Tech Lead or Senior Mobile Engineer",
  where: "Cyprus (hybrid) or relocation",
  domains: "Fintech and product-led companies",
};
