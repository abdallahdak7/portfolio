import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ExternalLink, Github, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
  {
    id: 1,
    title: "Pepperstone Trading App",
    description:
      "Core contributor to a production mobile trading application used by a global user base. Built with React Native, TypeScript, and advanced performance monitoring.",
    technologies: ["React Native", "TypeScript", "Sentry", "Datadog"],
    category: "Mobile",
    featured: true,
  },
  {
    id: 2,
    title: "TADA Care",
    description:
      "Healthcare SaaS platform enabling seamless patient-provider communication and care management with real-time features.",
    technologies: ["React", "Node.js", "WebSockets", "AWS"],
    category: "SaaS",
    featured: true,
  },
  {
    id: 3,
    title: "Pre-Trade Frontend",
    description:
      "React-based trading application focused on data accuracy, responsiveness, and intuitive trading workflows.",
    technologies: ["React", "TypeScript", "REST APIs"],
    category: "Fintech",
    featured: true,
  },
  {
    id: 4,
    title: "Enterprise Backend Services",
    description:
      "Scalable backend architecture using NestJS with advanced system integrations and data processing pipelines.",
    technologies: ["NestJS", "TypeScript", "Docker", "Terraform"],
    category: "Backend",
    featured: false,
  },
  {
    id: 5,
    title: "Performance Monitoring Suite",
    description:
      "Native iOS module for measuring application load time and custom analytics integration for production visibility.",
    technologies: ["React Native", "iOS", "Segment", "Analytics"],
    category: "Mobile",
    featured: false,
  },
  {
    id: 6,
    title: "CI/CD Pipeline Automation",
    description:
      "Automated mobile and web build pipelines with deployment workflows for faster release cycles.",
    technologies: ["CI/CD", "Docker", "AWS", "GitHub Actions"],
    category: "DevOps",
    featured: false,
  },
];

const categories = ["All", "Mobile", "SaaS", "Fintech", "Backend", "DevOps"];

export function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const filteredProjects = projects.filter(
    (project) => activeCategory === "All" || project.category === activeCategory
  );

  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 3);

  return (
    <section id="projects" className="py-24 bg-secondary/30 relative" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-medium text-primary uppercase tracking-widest mb-4">
            Portfolio
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A selection of projects that showcase my expertise in building scalable,
            high-performance applications.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setShowAll(false);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {displayedProjects.map((project, index) => (
            <motion.article
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group card-elevated rounded-2xl overflow-hidden"
            >
              {/* Project Image Placeholder */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-4xl font-bold text-primary/30">
                    {project.title.charAt(0)}
                  </span>
                </div>
                {project.featured && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Featured
                  </span>
                )}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    {project.category}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink size={14} />
                    View Details
                  </Button>
                  <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <Github size={18} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* See All Projects */}
        {filteredProjects.length > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowAll(!showAll)}
              className="gap-2 text-primary hover:text-primary"
            >
              {showAll ? "Show Less" : "See All Projects"}
              <ArrowRight
                size={18}
                className={`transition-transform ${showAll ? "rotate-90" : ""}`}
              />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
