'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EconomatoPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard/economato/stock');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <p>Redirecionando...</p>
    </div>
  );
}