export function Footer() {
  return (
    <footer className="border-t bg-card/50 px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TodoApp. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span>v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
