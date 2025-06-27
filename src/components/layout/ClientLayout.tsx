'use client';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-50 relative z-10">
      {children}
    </main>
  );
} 