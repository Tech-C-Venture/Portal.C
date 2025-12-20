'use client';

import { useMemo, useState } from 'react';

type PublicTimetableEntry = {
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
}: {
  entries: PublicTimetableEntry[];
}) {
  const [gradeFilter, setGradeFilter] = useState('all');
  const [majorFilter, setMajorFilter] = useState('all');
  const isWeekView = true;

  const grades = useMemo(
    () =>
      Array.from(
        new Set(entries.map((entry) => entry.grade).filter((grade): grade is number => typeof grade === 'number'))
      ).sort((a, b) => a - b),
    [entries]
  );

  const majors = useMemo(
    () =>
      Array.from(
        new Set(
          entries
            .map((entry) => entry.major)
            .filter((major): major is string => typeof major === 'string')
        )
      ).sort(),
    [entries]
  );

  const filteredEntries = entries.filter((entry) => {
    const gradeMatch =
      gradeFilter === 'all' ||
      entry.grade === Number(gradeFilter);
    const majorMatch =
      majorFilter === 'all' || entry.major === majorFilter;
    return gradeMatch && majorMatch;
  });

  const getEntriesForSlot = (day: number, period: number) =>
    filteredEntries.filter(
      (entry) => entry.dayOfWeek === day && entry.period === period
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <select
          value={gradeFilter}
          onChange={(event) => setGradeFilter(event.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全学年</option>
          {grades.map((grade) => (
            <option key={grade} value={String(grade)}>
              {grade}年
            </option>
          ))}
        </select>
        <select
          value={majorFilter}
          onChange={(event) => setMajorFilter(event.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全専攻</option>
          {majors.map((major) => (
            <option key={major} value={major}>
              {major}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                時限
              </th>
              {dayLabels.map((day) => (
                <th
                  key={day.value}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {periods.map((period) => (
              <tr key={period}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {period}限
                </td>
                {dayLabels.map((day) => {
                  const slotEntries = getEntriesForSlot(day.value, period);
                  return (
                    <td
                      key={`${day.value}-${period}`}
                      className={isWeekView ? 'px-3 py-2' : 'px-4 py-3'}
                    >
                      {slotEntries.length === 0 ? (
                        <div className="text-sm text-gray-400">-</div>
                      ) : (
                        <div className={isWeekView ? 'space-y-1' : 'space-y-2'}>
                          {slotEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className={`rounded-md border border-gray-200 bg-gray-50 text-xs text-gray-700 ${
                                isWeekView ? 'px-2 py-1 leading-tight' : 'px-2 py-1'
                              }`}
                            >
                              <div className="font-medium">
                                {entry.courseName}
                              </div>
                              {majorFilter === 'all' && (
                                <div className="text-gray-500">
                                  {(entry.grade ?? '-') + '年'} /{' '}
                                  {entry.major ?? '-'}
                                </div>
                              )}
                              {(entry.classroom || entry.instructor) && (
                                <div className="text-gray-500">
                                  {entry.classroom ?? '-'} /{' '}
                                  {entry.instructor ?? '-'}
                                </div>
                              )}
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
