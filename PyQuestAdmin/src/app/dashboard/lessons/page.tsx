'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LessonsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return <div className="container">Перенаправление...</div>;
}
