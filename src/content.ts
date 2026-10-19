export const profile = {
  name: "Abdallah Daknache",
  role: "Senior Mobile Engineer",
  location: "Limassol, Cyprus",
  availability: "Open to new opportunities · Open to relocation",
  email: "abdallah.daknache@gmail.com",
  linkedin: "https://www.linkedin.com/in/abdallah-daknache/",
  github: "https://github.com/abdallahdak7",
  resume: "/Abdallah_Daknache_Resume.pdf",
  headline:
    "I build reliable, high-performance mobile apps with React Native and TypeScript, and help teams ship them well.",
  summary:
    "Software engineer with 7+ years across backend, frontend, and mobile. I currently own mobile engineering initiatives at Pepperstone, from requirements and architecture through to release, on a production trading app used by clients worldwide.",
};

export const about = [
  "Working across the whole stack has taught me that technical decisions reach well beyond the code in front of me. I like connecting the dots between systems, understanding what the product actually needs, and choosing solutions that hold up now and in the long run.",
  "I've led initiatives spanning web and mobile, taking ownership from planning through delivery. I enjoy working through trade-offs with other teams and solving problems without adding unnecessary complexity.",
  "I also value the people side of engineering: mentoring, code reviews, and sharing knowledge. Good engineering comes from people working well together, not just from good code.",
];

export type Role = { title: string; period: string; points?: string[] };
export type Job = {
  company: string;
  location: string;
  roles: Role[];
  stack: string[];
};

export const experience: Job[] = [
  {
    company: "Pepperstone",
    location: "Limassol, Cyprus",
    roles: [
      {
        title: "Senior Mobile Engineer",
        period: "Aug 2024 — Present",
        points: [
          "Own mobile engineering initiatives from requirements and architecture through implementation and release, balancing product priorities, technical trade-offs, and maintainability.",
          "Coordinate delivery across engineering, product, and other teams, keeping stakeholders aligned on decisions, dependencies, and progress.",
          "Mentor engineers through technical guidance and code reviews; use AI-assisted development daily and share reusable workflows that improve team efficiency.",
        ],
      },
      {
        title: "Mobile Engineer",
        period: "Jul 2022 — Jul 2024",
        points: [
          "Developed React Native and TypeScript features for a production trading app, focused on reliability, responsiveness, and maintainable code.",
          "Profiled rendering and app-lifecycle issues to cut unnecessary re-renders and improve runtime performance.",
          "Built a native iOS module to measure app startup time and surface performance bottlenecks.",
          "Integrated Sentry, Datadog, and Segment for monitoring and analytics; supported automated builds and releases through CI/CD.",
        ],
      },
    ],
    stack: ["React Native", "TypeScript", "iOS", "Sentry", "Datadog", "Segment", "CI/CD"],
  },
  {
    company: "EverestCM",
    location: "Limassol, Cyprus · Remote",
    roles: [
      {
        title: "Senior Frontend Engineer",
        period: "Oct 2021 — Jul 2022",
        points: [
          "Delivered React and TypeScript features, improving frontend maintainability and resolving performance issues.",
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
        title: "Frontend Engineer",
        period: "Feb 2021 — Oct 2021",
        points: [
          "Built a React-based pre-trade application with responsive interfaces and data-intensive trading workflows.",
          "Worked with product and design on usability, reusable components, and frontend architecture decisions.",
        ],
      },
    ],
    stack: ["React", "TypeScript", "REST APIs"],
  },
  {
    company: "GO.MEDIA KG",
    location: "Remote · Germany",
    roles: [
      { title: "Backend Engineer", period: "Jul 2020 — Aug 2021" },
      {
        title: "Junior Backend Engineer",
        period: "May 2019 — Jun 2020",
        points: [
          "Developed and maintained backend services and REST APIs with NestJS, Node.js, and TypeScript.",
          "Implemented business logic and supported integrations and data-processing workflows.",
        ],
      },
    ],
    stack: ["NestJS", "Node.js", "TypeScript"],
  },
];

export const work = [
  {
    title: "Pepperstone Trading App",
    tag: "Mobile · Fintech",
    description:
      "Production React Native trading app for a global client base. I work across features, performance, observability, and release, and now lead initiatives end to end.",
    stack: ["React Native", "TypeScript", "Sentry", "Datadog"],
  },
  {
    title: "App Startup Performance",
    tag: "Native iOS",
    description:
      "A native iOS module that measures application startup time, giving the team hard numbers on where launch time goes and which changes actually help.",
    stack: ["iOS", "React Native", "Segment"],
  },
  {
    title: "Pre-Trade Platform",
    tag: "Web · Fintech",
    description:
      "React application for pre-trade workflows at Orea.io, built around dense, real-time data and fast, accurate interactions.",
    stack: ["React", "TypeScript", "REST APIs"],
  },
];

export const skills = [
  { group: "Mobile", items: ["React Native", "iOS (native modules)", "Xcode", "Android Studio", "App performance"] },
  { group: "Frontend", items: ["TypeScript", "React", "Next.js", "Design systems"] },
  { group: "Backend", items: ["Node.js", "NestJS", "REST APIs", "WebSockets"] },
  { group: "Delivery & Ops", items: ["CI/CD", "Sentry", "Datadog", "Segment", "Docker", "Terraform", "AWS"] },
  { group: "Ways of working", items: ["Technical ownership", "Mentoring", "Code review", "AI-assisted development"] },
];
