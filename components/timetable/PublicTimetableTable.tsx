'use client';

import { useEffect, useMemo, useState } from 'react';

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

const periods = [1, 2, 3, 4, 5, 6];

export function PublicTimetableTable({
  entries,
  defaultGrade,
  defaultMajor,
}: {
  entries: PublicTimetableEntry[];
  defaultGrade?: number;
  defaultMajor?: string;
}) {
  const [gradeFilter, setGradeFilter] = useState(
    defaultGrade ? String(defaultGrade) : ''
  );
  const [majorFilter, setMajorFilter] = useState(defaultMajor ?? '');
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDay());

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

  useEffect(() => {
    if (grades.length > 0 && !grades.includes(Number(gradeFilter))) {
      setGradeFilter(String(grades[0]));
    }
  }, [grades, gradeFilter]);

  useEffect(() => {
    if (majors.length > 0 && !majors.includes(majorFilter)) {
      setMajorFilter(majors[0]);
    }
  }, [majors, majorFilter]);

  const filteredEntries = entries.filter((entry) => {
    const gradeMatch =
      !gradeFilter || entry.grade === Number(gradeFilter);
    const majorMatch =
      !majorFilter || entry.major === majorFilter;
    return gradeMatch && majorMatch;
  });

  const getEntriesForSlot = (day: number, period: number) =>
    filteredEntries.filter(
      (entry) => entry.dayOfWeek === day && entry.period === period
    );

  const selectedDayLabel = dayLabels.find((d) => d.value === selectedDay)?.label ?? '';
  const today = new Date().getDay();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <select
          value={gradeFilter}
          onChange={(event) => setGradeFilter(event.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={grades.length === 0}
        >
          {grades.length === 0 ? (
            <option value="">学年未登録</option>
          ) : (
            grades.map((grade) => (
              <option key={grade} value={String(grade)}>
                {grade}年
              </option>
            ))
          )}
        </select>
        <select
          value={majorFilter}
          onChange={(event) => setMajorFilter(event.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={majors.length === 0}
        >
          {majors.length === 0 ? (
            <option value="">専攻未登録</option>
          ) : (
            majors.map((major) => (
              <option key={major} value={major}>
                {major}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Day selector buttons - tablet and below only */}
      <div className="flex justify-center gap-2 lg:hidden">
        {dayLabels.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => setSelectedDay(day.value)}
            className={`relative w-10 h-10 rounded-full text-sm font-medium transition-colors ${
              selectedDay === day.value
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {day.label}
            {day.value === today && (
              <span
                className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                  selectedDay === day.value ? 'bg-white' : 'bg-blue-500'
                }`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Daily view - tablet and below */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden lg:hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                時限
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                {selectedDayLabel}曜日
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {periods.map((period) => {
              const slotEntries = getEntriesForSlot(selectedDay, period);
              return (
                <tr key={period}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 w-16">
                    {period}限
                  </td>
                  <td className="px-4 py-3">
                    {slotEntries.length === 0 ? (
                      <div className="text-sm text-gray-400">-</div>
                    ) : (
                      <div className="space-y-2">
                        {slotEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                          >
                            <div className="font-medium">
                              {entry.courseName}
                            </div>
                            {majorFilter === 'all' && (
                              <div className="text-gray-500 text-xs mt-1">
                                {(entry.grade ?? '-') + '年'} /{' '}
                                {entry.major ?? '-'}
                              </div>
                            )}
                            {(entry.classroom || entry.instructor) && (
                              <div className="text-gray-500 text-xs mt-1">
                                {entry.classroom ?? '-'} /{' '}
                                {entry.instructor ?? '-'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Weekly view - PC only */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden hidden lg:block">
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
                      className="px-3 py-2"
                    >
                      {slotEntries.length === 0 ? (
                        <div className="text-sm text-gray-400">-</div>
                      ) : (
                        <div className="space-y-1">
                          {slotEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="rounded-md border border-gray-200 bg-gray-50 text-xs text-gray-700 px-2 py-1 leading-tight"
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
