import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemberList } from '@/components/members/MemberList';

const members = [
  {
    id: '1',
    name: 'Alice',
    email: 'alice@example.ed.jp',
    enrollmentYear: 2023,
    department: 'CS',
    skills: ['React', 'TypeScript'],
    interests: ['AI'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Bob',
    email: 'bob@example.ed.jp',
    enrollmentYear: 2022,
    department: 'Design',
    skills: ['Figma'],
    interests: ['UI'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
] as any;

describe('MemberList component', () => {
  test('filters by search query', () => {
    render(<MemberList members={members} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('スキルや興味で検索...');
    fireEvent.change(input, { target: { value: 'figma' } });

    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
