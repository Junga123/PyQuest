'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('pyquest_admin_token');
    if (!token && !pathname.includes('/login')) {
      router.replace('/login');
    }
  }, [pathname, router]);

  const logout = () => {
    localStorage.removeItem('pyquest_admin_token');
    router.replace('/login');
    router.refresh();
  };

  return (
    <>
      <nav>
        <Link href="/dashboard">Курсы</Link>
        <Link href="/dashboard">Уроки</Link>
        <button
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          Выйти
        </button>
      </nav>
      <main>{children}</main>
    </>
  );
}
