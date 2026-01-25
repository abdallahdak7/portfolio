import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Code2, Rocket, Download, Zap, Layers, Server, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: Briefcase, value: "5+", label: "Years Experience" },
  { icon: Rocket, value: "5+", label: "Products Launched" },
  { icon: Code2, value: "10+", label: "Technologies Mastered" },
];

const skillCategories = [
  {
    title: "Mobile Development",
    icon: Zap,
    skills: ["React Native", "Android Studio", "Xcode", "App Performance"],
  },
  {
    title: "Frontend",
    icon: Layers,
    skills: ["React", "Next.js", "TypeScript", "JavaScript", "Figma"],
  },
  {
    title: "Backend",
    icon: Server,
    skills: ["Node.js", "NestJS", "REST APIs", "WebSockets"],
  },
  {
    title: "DevOps & Cloud",
    icon: Cloud,
    skills: ["AWS", "Docker", "Terraform", "CI/CD", "Sentry", "Datadog"],
  },
];

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="about" className="py-24 bg-background relative" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-medium text-primary uppercase tracking-widest mb-4">
            About Me
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Building the Future,
            <span className="text-gradient"> One Line at a Time</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Software Engineer with 5+ years of experience building high-performance mobile and web applications.
            Specialized in TypeScript, React, and React Native with hands-on experience delivering and scaling
            production-grade trading applications used by real users worldwide.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {stats.map(({ icon: Icon, value, label }) => (
            <motion.div
              key={label}
              variants={itemVariants}
              className="card-elevated p-8 rounded-2xl text-center group"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <div className="font-display text-4xl font-bold text-foreground mb-2">
                {value}
              </div>
              <div className="text-muted-foreground font-medium">{label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {skillCategories.map(({ title, icon: Icon, skills }) => (
            <motion.div
              key={title}
              variants={itemVariants}
              className="card-elevated p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  {title}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Download Resume */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <a href="/Abdallah_Daknache_Resume.pdf" download>
              <Download size={18} />
              Download Resume
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
