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
    "I lead mobile initiatives on a global trading app, from shaping the problem with product, through architecture and delivery, to production. I work AI-first every day, and I help my team turn AI into faster, better delivery.",
  summary:
    "7+ years across backend, web, and mobile, growing from junior backend engineer to senior mobile engineer. That breadth is what lets me lead across team boundaries today.",
};

export const glance = [
  { label: "Experience", value: "7+ years · backend, web, mobile" },
  { label: "Leadership", value: "Initiative ownership · Mentoring" },
  { label: "Way of working", value: "AI-first, every day" },
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
    body: "Through mentoring, technical guidance, and code reviews that teach rather than gatekeep, I help teammates build judgment, not just ship tickets.",
  },
  {
    title: "Improve how the team works",
    body: "I put practices in place that scale beyond me, such as making app performance measurable so the team and product can prioritise with data instead of opinions.",
  },
];

export const ai = {
  intro:
    "AI is part of how I work every day, not an experiment. I use it across the whole delivery cycle, and as a lead I focus on turning individual productivity into team capability, safely, in a regulated fintech environment.",
  pillars: [
    {
      title: "Across my daily workflow",
      body: "From planning and breaking down work, to writing and refactoring code with AI agents, debugging, tests, code review, and documentation. AI handles the repetitive parts so I can spend my time on decisions.",
    },
    {
      title: "Leading team adoption",
      body: "I build and share reusable AI-assisted workflows with my team, helping engineers adopt them in their own work and lifting the team's delivery speed rather than just my own.",
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
          "Lead mobile initiatives end to end, from shaping requirements with product through architecture, delivery, and release, balancing business priorities, technical trade-offs, and long-term maintainability.",
          "Align engineering, product, design, and QA on scope, dependencies, and risks, and keep stakeholders informed on decisions and progress.",
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
    stack: ["Mobile leadership", "React Native", "TypeScript", "Native iOS", "AI-assisted development", "CI/CD"],
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
    items: ["Initiative ownership", "Technical direction", "Cross-functional delivery", "Stakeholder communication", "Mentoring", "Engineering practices"],
  },
  {
    group: "AI",
    items: ["AI-first development", "AI coding agents", "AI-assisted code review & testing", "Workflow automation", "Team AI enablement"],
  },
  {
    group: "Mobile",
    items: ["React Native (New Architecture)", "TypeScript", "Native iOS", "Performance", "App Store & Google Play releases"],
  },
  {
    group: "Engineering quality",
    items: ["Automated testing", "Observability", "CI/CD", "Feature flags & experimentation"],
  },
  { group: "Breadth", items: ["React", "Node.js", "NestJS", "Real-time data", "Cloud & infrastructure"] },
];

export const lookingFor = {
  roles: "Mobile Lead / Tech Lead or Senior Mobile Engineer",
  where: "Cyprus (hybrid) or relocation",
  domains: "Fintech and product-led companies",
};
