import { profile } from "@/content";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-8 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <p>{profile.location}</p>
      </div>
    </footer>
  );
}
