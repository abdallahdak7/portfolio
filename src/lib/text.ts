/** Prevent awkward line breaks inside compounds like "AI-first" or ranges like "20–30". */
export const keepTogether = (s: string) => s.replace(/([\w+])([-–])(?=\w)/g, "$1⁠$2⁠");
