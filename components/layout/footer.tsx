export function Footer() {
  return (
    <footer className="border-t border-border pt-4 pb-2">
      <div className="mx-auto max-w-5xl px-5 flex items-center justify-between text-[0.6rem] text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} TodoApp</span>
        <span>v0.1.0</span>
      </div>
    </footer>
  );
}
