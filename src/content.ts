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
    "I lead core platform initiatives for a global trading app across mobile and web, from shaping the problem with product, through architecture and delivery, to production. I work AI-first every day, and I help my team turn AI into faster, better delivery.",
  summary:
    "7+ years across backend, web, and mobile, growing from junior backend engineer to senior mobile engineer. That breadth is what lets me lead across team boundaries today.",
};

export const glance = [
  { label: "Experience", value: "7+ years · backend, web, mobile" },
  { label: "Team", value: "Platform team · 20–30 engineer org" },
  { label: "Way of working", value: "AI-first · Cursor & Claude" },
  { label: "Domain", value: "Fintech · Trading" },
];

export const leadershipIntro =
  "Working across the whole stack taught me that technical decisions reach well beyond the code. I lead by connecting the dots between systems, people, and product goals, and by choosing solutions that hold up now and in the long run without adding unnecessary complexity.";

export const principles = [
  {
    title: "Own the outcome, not just the code",
    body: "I take initiatives from requirements and architecture through release, and stay accountable for how they perform once they're in users' hands.",
  },
  {
    title: "Align people around clear trade-offs",
    body: "I work with product, design, backend, and QA to agree on scope, make trade-offs explicit, and keep stakeholders informed on decisions, dependencies, and risks.",
  },
  {
    title: "Grow the engineers around me",
    body: "Through mentoring, technical guidance, and code reviews that teach rather than gatekeep, I help teammates build judgment. I also help grow the team itself by running technical interviews and giving hiring input.",
  },
  {
    title: "Improve how the team works",
    body: "I put practices in place that scale beyond me, such as making app performance measurable so the team and product can prioritise with data instead of opinions.",
  },
];

export const spotlight = {
  title: "One sign-in platform for web and mobile",
  tag: "Platform · Security · Ownership",
  rows: [
    {
      label: "Goal",
      text: "Give clients one secure, consistent way to sign in across Pepperstone's website and mobile apps, and stop product teams from each building and maintaining their own authentication.",
    },
    {
      label: "What I owned",
      text: "I designed and built the core authentication module the platform team provides to both web and mobile, and own it as a shared foundation other teams build on.",
    },
    {
      label: "Key decisions",
      text: "Build on proven standards instead of custom security: OpenID Connect and OAuth 2.0 with Auth0, and token verification against published signing keys (JWKS). Package it as one well-defined module so web and mobile consume the same logic rather than reimplementing it.",
    },
    {
      label: "Impact",
      text: "A single source of truth for authentication across web and mobile: a consistent sign-in experience for clients, a smaller security surface to review in a regulated business, and less duplicated work for product teams.",
    },
  ],
  stack: ["OpenID Connect", "OAuth 2.0", "Auth0", "JWKS", "Web + Mobile"],
};

export const ai = {
  intro:
    "AI is part of how I work every day, not an experiment. I use it across the whole delivery cycle, and as a lead I focus on turning individual productivity into team capability, safely, in a regulated fintech environment.",
  pillars: [
    {
      title: "Across my daily workflow",
      body: "Cursor is my daily driver and Claude my thinking partner, from planning and breaking down work, to writing and refactoring code with AI agents, debugging, tests, code review, and documentation. AI handles the repetitive parts so I can spend my time on decisions.",
    },
    {
      title: "Leading team adoption",
      body: "I build and share reusable AI-assisted workflows with my team, and I keep testing new models and agents (Claude Code, Codex, Kimi, Grok) on side projects so the team adopts what actually works.",
    },
    {
      title: "With judgment and guardrails",
      body: "AI speeds up the work; engineers stay accountable for it. Output is reviewed and tested like any other code, with care for security, privacy, and compliance in a regulated product.",
    },
  ],
};

export type Role = { title: string; period: string; points?: string[] };
export type Job = {
  company: string;
  context?: string;
  location: string;
  roles: Role[];
  stack: string[];
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
          "Lead core initiatives on the platform team, which owns the app's shared foundations, taking them end to end from requirements with product through architecture, delivery, and release.",
          "Align engineering, product, design, and QA on scope, dependencies, and risks, and keep stakeholders informed on decisions and progress.",
          "Designed and built the shared authentication module used across Pepperstone's web and mobile apps, standardising sign-in on OpenID Connect and OAuth 2.0 (Auth0) with JWKS-based token verification.",
          "Helped scale engineering to 20–30 engineers by running technical interviews and contributing to hiring decisions.",
          "Mentor engineers through technical guidance and code reviews that build judgment, not just catch bugs.",
          "Use AI across my daily workflow and lead its adoption in the team, building and sharing reusable AI-assisted workflows that make engineers more efficient.",
        ],
      },
      {
        title: "Mobile Engineer",
        period: "Jul 2022 — Jul 2024",
        points: [
          "Delivered features for a production React Native trading app where responsiveness and reliability are business-critical.",
          "Made app performance measurable by introducing startup-time tracking, then resolved rendering bottlenecks, so performance work could be prioritised on data.",
          "Strengthened production readiness through monitoring, analytics, and automated CI/CD releases.",
        ],
      },
    ],
    stack: ["Platform", "Authentication", "React Native", "TypeScript", "Native iOS", "AI-assisted development", "CI/CD"],
  },
  {
    company: "EverestCM",
    location: "Limassol, Cyprus · Remote",
    roles: [
      {
        title: "Senior Frontend Engineer",
        period: "Oct 2021 — Jul 2022",
        points: [
          "Delivered React and TypeScript features, improving frontend maintainability and resolving performance bottlenecks.",
          "Integrated backend APIs and contributed to Docker and Terraform workflows supporting application delivery.",
        ],
      },
    ],
    stack: ["React", "TypeScript", "Docker", "Terraform"],
  },
  {
    company: "Orea.io",
    location: "Limassol, Cyprus",
    roles: [
      {
        title: "Mid-Level Frontend Engineer",
        period: "Feb 2021 — Oct 2021",
        points: [
          "Built a React pre-trade application with responsive interfaces for data-intensive trading workflows.",
          "Partnered with product and design on usability, reusable components, and frontend architecture decisions.",
        ],
      },
    ],
    stack: ["React", "TypeScript", "REST APIs"],
  },
  {
    company: "GO.MEDIA KG",
    location: "Remote · Germany",
    roles: [
      { title: "Mid-Level Backend Engineer", period: "Jul 2020 — Aug 2021" },
      {
        title: "Junior Backend Engineer",
        period: "May 2019 — Jun 2020",
        points: [
          "Developed and maintained backend services and REST APIs with NestJS, Node.js, and TypeScript.",
          "Implemented business logic, third-party integrations, and data-processing workflows.",
        ],
      },
    ],
    stack: ["NestJS", "Node.js", "TypeScript"],
  },
];

export const skills = [
  {
    group: "Leadership",
    items: ["Initiative ownership", "Technical direction", "Cross-functional delivery", "Stakeholder communication", "Mentoring", "Technical interviewing & hiring"],
  },
  {
    group: "AI",
    items: ["Cursor", "Claude & Claude Code", "AI coding agents", "AI-assisted code review & testing", "Team AI enablement", "Evaluating new models (Codex, Kimi, Grok)"],
  },
  {
    group: "Mobile",
    items: ["React Native (New Architecture)", "TypeScript", "Native iOS", "Performance", "App Store & Google Play releases"],
  },
  {
    group: "Engineering quality",
    items: ["Automated testing", "Observability", "CI/CD", "Feature flags & experimentation"],
  },
  { group: "Platform & security", items: ["Authentication architecture", "OpenID Connect", "OAuth 2.0", "Auth0", "JWT / JWKS", "Shared web & mobile modules"] },
  { group: "Breadth", items: ["React", "Node.js", "NestJS", "Real-time data", "Cloud & infrastructure"] },
];

export const lookingFor = {
  roles: "Mobile Lead / Tech Lead or Senior Mobile Engineer",
  where: "Cyprus (hybrid) or relocation",
  domains: "Fintech and product-led companies",
};
