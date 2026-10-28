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

export const spotlight = {
  title: "One sign-in for web and mobile",
  tag: "Platform · Ownership",
  rows: [
    {
      label: "Goal",
      text: "Give clients one secure, consistent way to sign in across Pepperstone's website and apps, and stop each product team from building its own.",
    },
    {
      label: "What I did",
      text: "Designed and built the shared authentication module the platform team provides to web and mobile, and own it as a foundation other teams build on.",
    },
    {
      label: "Key decision",
      text: "Rely on industry standards and a trusted identity provider rather than custom security, and ship it as one module every platform reuses.",
    },
    {
      label: "Impact",
      text: "One source of truth for sign-in: a consistent client experience, a smaller security surface in a regulated business, and less duplicated work across teams.",
    },
  ],
};

export const ai = {
  intro:
    "AI is part of how I work every day, not an experiment. I focus on turning it into real productivity, for me and for the team, safely, in a regulated product.",
  pillars: [
    {
      title: "In my daily work",
      body: "Cursor and Claude support me from planning to code, review, testing, and documentation, so my time goes to decisions rather than repetition.",
    },
    {
      title: "Across the team",
      body: "I share reusable AI workflows with my team and keep trying new models and agents, so we adopt what genuinely works.",
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
          "Own core initiatives on the platform team, which owns the app's shared foundations, from requirements through release.",
          "Built the shared sign-in platform used across Pepperstone's web and mobile apps.",
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
          "Strengthened production readiness through monitoring, analytics, and automated releases.",
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
        points: ["Delivered web features and improved the maintainability and performance of the frontend."],
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
        points: ["Built a pre-trade web application with product and design, focused on fast, data-heavy trading workflows."],
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
        points: ["Built backend services and APIs, including business logic and third-party integrations."],
      },
    ],
  },
];

export const skills = [
  { group: "Ways of working", items: ["Initiative ownership", "Cross-team delivery", "Knowledge sharing", "Technical interviewing"] },
  { group: "AI", items: ["AI-first engineering", "Team AI enablement"] },
  { group: "Engineering", items: ["React Native", "TypeScript", "iOS", "Platform & authentication", "Performance"] },
];

export const askTom = {
  title: "Questions? Ask Tom",
  intro:
    "Tom is an AI assistant that answers questions about my work and experience, using a profile I've approved. He can also pass a message on to me or share a link to book a call.",
};

export const lookingFor = {
  roles: "Mobile Lead / Tech Lead or Senior Mobile Engineer",
  where: "Cyprus (hybrid) or relocation",
  domains: "Fintech and product-led companies",
};
