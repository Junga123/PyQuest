'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getLesson, getTasks } from '@/lib/api';

export default function LessonTasksPage() {
  const params = useParams();
  const id = params?.id as string;
  const [lesson, setLesson] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getLesson(id), getTasks(id)])
      .then(([lessonRes, tasksRes]) => {
        setLesson(lessonRes.lesson);
        setTasks(tasksRes.tasks || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container">Загрузка...</div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="container">
      <Link href="/dashboard">← К курсам</Link>
      <h1>{lesson?.title || 'Урок'}</h1>
      <h2>Задания</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Тип</th>
              <th>Название</th>
              <th>XP</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t, i) => (
              <tr key={t.id}>
                <td>{i + 1}</td>
                <td><code>{t.task_type || '—'}</code></td>
                <td>{t.title || t.prompt || '—'}</td>
                <td>{t.xp_reward ?? 0}</td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={4}>Нет заданий</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
