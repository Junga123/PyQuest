'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLessons } from '@/lib/api';

export default function DashboardPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getLessons()
      .then((data) => setLessons(data.lessons || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Загрузка курсов...</div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="container">
      <h1>PyQuest Admin — Курсы (уроки)</h1>
      <p style={{ color: '#64748b', marginBottom: '1rem' }}>
        Список уроков из API. CRUD через API будет добавлен в бэкенд.
      </p>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Название</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {lessons.length === 0 ? (
              <tr>
                <td colSpan={3}>Нет данных</td>
              </tr>
            ) : (
              lessons.map((l, i) => (
                <tr key={l.id}>
                  <td>{l.order_index ?? i + 1}</td>
                  <td>{l.title || '—'}</td>
                  <td>
                    <Link href={`/dashboard/lessons/${l.id}`}>Задания</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
