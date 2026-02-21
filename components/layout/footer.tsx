export function Footer() {
  return (
    <footer className="border-t border-border pt-4 pb-2">
      <div className="mx-auto max-w-5xl px-5 text-center text-[0.6rem] text-muted-foreground">
        TodoApp &middot; v0.1.0 &middot; &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}
