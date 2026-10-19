export const profile = {
  name: "Abdallah Daknache",
  role: "Senior Mobile Engineer",
  company: "Pepperstone",
  location: "Limassol, Cyprus",
  availability: "Open to Senior & Lead Mobile roles",
  email: "abdallah.daknache@gmail.com",
  linkedin: "https://www.linkedin.com/in/abdallah-daknache/",
  github: "https://github.com/abdallahdak7",
  resume: "/Abdallah_Daknache_Resume.pdf",
  headline:
    "I lead React Native delivery on a global trading app, where speed, reliability, and user trust directly affect the business. I turn product goals into fast, stable releases and help the engineers around me level up.",
  summary:
    "7+ years across backend, web, and mobile, progressing from junior backend engineer to senior mobile engineer. Today I own mobile initiatives end to end at Pepperstone, from requirements and architecture through release and production monitoring.",
};

export const glance = [
  { label: "Experience", value: "7+ years" },
  { label: "Focus", value: "React Native · TypeScript" },
  { label: "Domain", value: "Fintech · Trading" },
  { label: "Scope", value: "Architecture → Release" },
];

export const about = [
  "Working across the whole stack has taught me that technical decisions reach well beyond the code in front of me. I connect the dots between systems, understand what the product actually needs, and choose solutions that hold up now and in the long run.",
  "I've led initiatives spanning web and mobile, owning them from planning through delivery. I'm comfortable working through trade-offs with product, design, backend, and QA, and solving problems without adding unnecessary complexity.",
  "I care about the people side of engineering: mentoring, thorough code reviews, and sharing workflows that make the whole team faster. Good engineering comes from people working well together, not just from good code.",
];

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
          "Own mobile initiatives end to end, from requirements and architecture to release, balancing product priorities, technical trade-offs, and long-term maintainability.",
          "Drive cross-functional delivery with product, design, backend, and QA, keeping stakeholders aligned on scope, dependencies, risks, and progress.",
          "Raise the team's engineering bar through mentoring and code reviews, and share reusable AI-assisted development workflows that make the team faster.",
        ],
      },
      {
        title: "Mobile Engineer",
        period: "Jul 2022 — Jul 2024",
        points: [
          "Shipped React Native and TypeScript features for a production trading app with real-time market data, where responsiveness and reliability are business-critical.",
          "Improved runtime performance by profiling rendering and app-lifecycle issues with Hermes tooling and eliminating unnecessary re-renders.",
          "Built a native iOS module to measure app startup time, giving the team a performance baseline to track regressions and prioritise fixes.",
          "Set up production observability and product analytics (Sentry, Datadog, Segment) and supported automated CI/CD builds and App Store / Google Play releases.",
        ],
      },
    ],
    stack: ["React Native", "TypeScript", "Native iOS", "WebSockets", "Sentry", "Datadog", "CI/CD"],
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

export type CaseStudy = {
  title: string;
  tag: string;
  /** Optional headline result, e.g. "−35% cold start". Add real numbers here when available. */
  metric?: string;
  problem: string;
  role: string;
  approach: string;
  outcome: string;
  stack: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    title: "Startup performance visibility",
    tag: "Native iOS · Performance",
    problem:
      "Slow launches cost traders time at the moments that matter, but the team had no reliable way to measure startup time, so performance work was based on guesswork.",
    role: "Built the native module end to end.",
    approach:
      "Wrote a native iOS module that captures startup timings and reports them to the app's analytics pipeline, so every release can be measured against a baseline.",
    outcome:
      "Startup time became a tracked metric. The team can now spot regressions per release and prioritise performance fixes using data instead of anecdotes.",
    stack: ["Native iOS", "React Native", "Analytics"],
  },
  {
    title: "Rendering performance on trading screens",
    tag: "React Native · Performance",
    problem:
      "Screens fed by real-time market data were re-rendering far more than needed, risking dropped frames and a sluggish feel when markets move fast.",
    role: "Investigated the root causes and implemented the fixes.",
    approach:
      "Profiled with Hermes and React DevTools, traced unnecessary renders through state and app-lifecycle handling, and restructured components and subscriptions.",
    outcome:
      "Fewer wasted renders and a more responsive app when market data is moving fast.",
    stack: ["React Native", "Hermes", "TypeScript", "WebSockets"],
  },
  {
    title: "Production observability & release quality",
    tag: "Reliability · Delivery",
    problem:
      "In a regulated trading product, issues have to be caught early and diagnosed fast, and product decisions need real usage data.",
    role: "Integrated the tooling and supported the release pipeline.",
    approach:
      "Integrated Sentry for crash and error tracking, Datadog for monitoring, and Segment for analytics, alongside automated CI/CD builds, feature flags, and store releases.",
    outcome:
      "Faster detection and diagnosis of production issues, safer rollouts, and data-informed product decisions.",
    stack: ["Sentry", "Datadog", "Segment", "CI/CD", "Feature flags"],
  },
];

export const skills = [
  {
    group: "Mobile",
    items: ["React Native", "New Architecture (Fabric, TurboModules, JSI)", "Hermes", "Native iOS modules", "Xcode", "Android Studio"],
  },
  { group: "App architecture", items: ["TypeScript", "Redux", "Zustand", "React Query", "WebSockets / real-time data", "REST APIs"] },
  { group: "Quality", items: ["Jest", "React Native Testing Library", "Detox", "Performance profiling", "Code review"] },
  {
    group: "Delivery & ops",
    items: ["CI/CD", "App Store & Google Play releases", "Feature flags & A/B testing", "Sentry", "Datadog", "Segment"],
  },
  { group: "Also", items: ["React", "Next.js", "Node.js", "NestJS", "Docker", "Terraform", "AWS"] },
  { group: "Leadership", items: ["Technical ownership", "Cross-functional delivery", "Mentoring", "AI-assisted development"] },
];

export const lookingFor = {
  roles: "Senior or Lead Mobile Engineer",
  where: "Cyprus (hybrid) or relocation",
  domains: "Fintech and product-led companies",
};
