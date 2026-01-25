import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingScrollTarget, setPendingScrollTarget] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    if (isMobileMenuOpen) {
      setPendingScrollTarget(href);
      setIsMobileMenuOpen(false);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass border-b border-border/50" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("#home");
          }}
          className={`font-display font-bold text-xl tracking-tight ${
            isScrolled ? "text-foreground" : "text-white"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          AD<span className="text-primary">.</span>
        </motion.a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className={`text-sm font-medium transition-colors relative group ${
                isScrolled
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <Button
            variant="default"
            size="sm"
            onClick={() => scrollToSection("#agent")}
            className="ml-2"
          >
            Call my agent
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 ${
            isScrolled ? "text-foreground" : "text-white"
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? "auto" : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        onAnimationComplete={() => {
          if (!isMobileMenuOpen && pendingScrollTarget) {
            const element = document.querySelector(pendingScrollTarget);
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
            setPendingScrollTarget(null);
          }
        }}
        className="md:hidden overflow-hidden glass border-b border-border/50"
      >
        <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {link.label}
            </a>
          ))}
          <Button
            variant="default"
            className="w-full mt-2"
            onClick={() => scrollToSection("#agent")}
          >
            Call my agent
          </Button>
        </div>
      </motion.div>
    </motion.header>
  );
}
