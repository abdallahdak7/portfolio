import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Product Manager",
    company: "Pepperstone",
    quote:
      "Abdallah's ability to diagnose and resolve complex performance issues is exceptional. He consistently delivered features that exceeded expectations and improved our app's reliability significantly.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Roberts",
    title: "CTO",
    company: "EverestCM",
    quote:
      "Working with Abdallah was a pleasure. His deep understanding of frontend architecture and attention to code quality helped us scale our platform with confidence.",
    rating: 5,
  },
  {
    id: 3,
    name: "Elena Kowalski",
    title: "Engineering Lead",
    company: "Orea.io",
    quote:
      "Abdallah brought both technical excellence and strong collaboration skills to our team. His contributions to our trading platform's UX were invaluable.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Mueller",
    title: "CEO",
    company: "GO.MEDIA KG",
    quote:
      "An incredibly talented engineer who understands both the technical and business aspects of building software. Highly recommended for any challenging project.",
    rating: 5,
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-background relative" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-medium text-primary uppercase tracking-widest mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            What People <span className="text-gradient">Say</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Feedback from colleagues, clients, and collaborators I've had the pleasure to work with.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-elevated p-8 rounded-2xl relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-primary/10">
                <Quote size={48} />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground mb-6 leading-relaxed relative z-10">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <span className="font-display font-semibold text-primary">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.title} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
