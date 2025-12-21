'use client';

import { useEffect, useMemo, useState } from 'react';

export type PublicTimetableEntry = {
  id: string;
  dayOfWeek: number;
  period: number;
  courseName: string;
  grade: number | null;
  major: string | null;
  classroom: string | null;
  instructor: string | null;
};

const dayLabels = [
  { value: 1, label: '月' },
  { value: 2, label: '火' },
  { value: 3, label: '水' },
  { value: 4, label: '木' },
  { value: 5, label: '金' },
  { value: 6, label: '土' },
  { value: 0, label: '日' },
];

const periods = [1, 2, 3, 4, 5, 6, 7];

export function PublicTimetableTable({
  entries,
  privateEntries = [],
  defaultGrade,
  defaultMajor,
}: {
  entries: PublicTimetableEntry[];
  privateEntries?: PublicTimetableEntry[];
  defaultGrade?: number;
  defaultMajor?: string;
}) {
  const [viewMode, setViewMode] = useState<'public' | 'private'>('public');
  const [gradeFilter, setGradeFilter] = useState(defaultGrade ? String(defaultGrade) : 'all');
  const [majorFilter, setMajorFilter] = useState(defaultMajor ?? 'all');
  const isWeekView = true;

  const currentEntries = viewMode === 'private' ? privateEntries : entries;

  const grades = useMemo(
    () => Array.from(new Set(currentEntries.map((e) => e.grade).filter((g): g is number => typeof g === 'number'))).sort((a, b) => a - b),
    [currentEntries]
  );

  const majors = useMemo(
    () => Array.from(new Set(currentEntries.map((e) => e.major).filter((m): m is string => typeof m === 'string'))).sort(),
    [currentEntries]
  );

  useEffect(() => {
    if (gradeFilter === 'all' && defaultGrade && grades.includes(defaultGrade)) {
      setGradeFilter(String(defaultGrade));
    }
  }, [grades, defaultGrade, gradeFilter]);

  useEffect(() => {
    if (majorFilter === 'all' && defaultMajor && majors.includes(defaultMajor)) {
      setMajorFilter(defaultMajor);
    }
  }, [majors, defaultMajor, majorFilter]);

  const filteredEntries = currentEntries.filter((entry) => {
    if (viewMode === 'private') return true;
    const gradeMatch = gradeFilter === 'all' || entry.grade === Number(gradeFilter);
    const majorMatch = majorFilter === 'all' || entry.major === majorFilter;
    return gradeMatch && majorMatch;
  });

  const getEntriesForSlot = (day: number, period: number) =>
    filteredEntries.filter((entry) => entry.dayOfWeek === day && entry.period === period);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as 'public' | 'private')}
          className="px-4 py-2 border border-blue-500 bg-blue-50 font-bold rounded-lg focus:outline-none ring-2 ring-blue-100"
        >
          <option value="public">🌍 全校時間割を表示</option>
          <option value="private">👤 自分専用を表示</option>
        </select>

        {viewMode === 'public' && (
          <>
            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全学年</option>
              {grades.map((grade) => (
                <option key={grade} value={String(grade)}>{grade}年</option>
              ))}
            </select>
            <select
              value={majorFilter}
              onChange={(event) => setMajorFilter(event.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全専攻</option>
              {majors.map((major) => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">時限</th>
              {dayLabels.map((day) => (
                <th key={day.value} className="px-4 py-3 text-left text-sm font-medium text-gray-700">{day.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {periods.map((period) => (
              <tr key={period}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{period}限</td>
                {dayLabels.map((day) => {
                  const slotEntries = getEntriesForSlot(day.value, period);
                  return (
                    <td key={`${day.value}-${period}`} className="px-3 py-2">
                      {slotEntries.length === 0 ? (
                        <div className="text-sm text-gray-400">-</div>
                      ) : (
                        <div className="space-y-1">
                          {slotEntries.map((entry) => (
                            <div key={entry.id} className="rounded-md border border-gray-200 bg-gray-50 p-2 text-[10px] text-gray-700">
                              <div className="font-bold">{entry.courseName}</div>
                              <div>{entry.classroom} / {entry.instructor}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}