export function Footer() {
  return (
    <footer className="border-t border-border min-h-12">
      <div className="mx-auto max-w-5xl px-5 h-full flex items-center justify-between text-[0.6rem] text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} TodoApp</span>
        <span>v0.1.0</span>
      </div>
    </footer>
  );
}
