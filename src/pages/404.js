import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 animate-in">
      <p className="text-7xl font-display font-bold text-bg-border" style={{ fontFamily: 'Syne, sans-serif' }}>404</p>
      <h2 className="text-text-secondary text-lg font-medium">Page not found</h2>
      <Link href="/" className="btn-primary mt-2">← Back to Dashboard</Link>
    </div>
  );
}
