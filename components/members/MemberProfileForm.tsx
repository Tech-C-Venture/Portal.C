'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';
import type { MemberDTO } from '@/application/dtos';
import { signOut } from 'next-auth/react';
import {
  updateCurrentMemberProfileAction,
  type MemberProfileFormState,
} from '@/app/actions/members';

interface MemberProfileFormProps {
  member: MemberDTO;
  mode: 'profile' | 'onboarding';
  redirectTo?: string;
  submitLabel: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="large" variant="contained" disabled={pending}>
      {pending ? '保存中...' : label}
    </Button>
  );
}

function LogoutButton() {
  return (
    <Button
      type="button"
      size="large"
      variant="outlined"
      layout="fullWidth"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      ログアウト
    </Button>
  );
}

function TagsInput({
  name,
  label,
  initialValues,
  placeholder,
  required,
  category,
}: {
  name: string;
  label: string;
  initialValues: string[];
  placeholder: string;
  required?: boolean;
  category: 'skill' | 'interest';
}) {
  const [tags, setTags] = useState<string[]>(initialValues);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const normalized = useMemo(
    () => tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0),
    [tags]
  );

  const addTag = (rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;
    setTags((prev) => (prev.includes(value) ? prev : [...prev, value]));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(inputValue);
      setInputValue('');
    }
  };

  const handleBlur = () => {
    addTag(inputValue);
    setInputValue('');
  };

  useEffect(() => {
    const query = inputValue.trim();
    if (query.length === 0) {
      setSuggestions([]);
      return;
    }

    let active = true;
    setLoading(true);

    fetch(`/api/tags?category=${category}&query=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data: { tags: string[] }) => {
        if (!active) return;
        const filtered = data.tags.filter((tag) => !normalized.includes(tag));
        setSuggestions(filtered);
      })
      .catch(() => {
        if (!active) return;
        setSuggestions([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category, inputValue, normalized]);

  const accent = category === 'skill'
    ? {
        chip: 'bg-green-100 text-green-700',
        chipHover: 'hover:text-green-900',
        hoverBg: 'hover:bg-green-50',
      }
    : {
        chip: 'bg-purple-100 text-purple-700',
        chipHover: 'hover:text-purple-900',
        hoverBg: 'hover:bg-purple-50',
      };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {normalized.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${accent.chip}`}
          >
            {tag}
            <button
              type="button"
              className={accent.chipHover}
              onClick={() => setTags((prev) => prev.filter((value) => value !== tag))}
              aria-label={`${tag}を削除`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input type="hidden" name={name} value={normalized.join(', ')} />
      <input
        type="text"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required && normalized.length === 0}
      />
      {(loading || suggestions.length > 0 || inputValue.trim().length > 0) && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-white shadow-sm">
          {loading && (
            <div className="px-3 py-2 text-xs text-gray-500">候補を検索中...</div>
          )}
          {!loading && suggestions.length === 0 && inputValue.trim().length > 0 && (
            <div className="px-3 py-2 text-xs text-gray-500">
              既存タグは見つかりませんでした
            </div>
          )}
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              className={`block w-full text-left px-3 py-2 text-sm ${accent.hoverBg}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                addTag(suggestion);
                setInputValue('');
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      <p className="mt-1 text-xs text-gray-500">Enter または , で追加</p>
    </div>
  );
}

export function MemberProfileForm({
  member,
  mode,
  redirectTo,
  submitLabel,
}: MemberProfileFormProps) {
  const [isRepeating, setIsRepeating] = useState(member.isRepeating);
  const [repeatYears, setRepeatYears] = useState<number | ''>(
    member.repeatYears ?? ''
  );
  const [state, formAction] = useActionState<MemberProfileFormState, FormData>(
    updateCurrentMemberProfileAction,
    {
      error: null,
      success: null,
      avatarUrl: member.avatarUrl ?? null,
    }
  );
  const currentAvatarUrl = state.avatarUrl ?? member.avatarUrl ?? null;
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setLocalAvatarUrl(currentAvatarUrl);
  }, [currentAvatarUrl]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    },
    []
  );

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setLocalAvatarUrl(objectUrl);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      <input type="hidden" name="mode" value={mode} />
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">アイコン画像</label>
        <div className="mb-3 flex items-center gap-4">
          <button
            type="button"
            onClick={openFilePicker}
            className="group relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="アイコン画像を変更"
          >
            {localAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={localAvatarUrl}
                alt={`${member.name}のアイコン`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg text-gray-600 font-semibold">
                {member.name.charAt(0)}
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100">
              編集
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            name="avatar"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            required={mode === 'onboarding' && !localAvatarUrl}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">名前</label>
        <input
          type="text"
          name="name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 focus:outline-none"
          placeholder="山田太郎"
          defaultValue={member.name}
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          学校メールアドレス（公開）
        </label>
        <input
          type="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue={member.schoolEmail}
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          私用Gmailアドレス（非公開）
        </label>
        <input
          type="email"
          name="gmailAddress"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="taro@gmail.com"
          defaultValue={member.gmailAddress ?? ''}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">学籍番号</label>
          <input
            type="text"
            name="studentId"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2406070000"
            defaultValue={member.studentId ?? ''}
            required={mode === 'onboarding'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">入学年度</label>
          <input
            type="number"
            name="enrollmentYear"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2022"
            defaultValue={member.enrollmentYear}
            required={mode === 'onboarding'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">所属専攻</label>
          <input
            type="text"
            name="department"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ホワイトハッカー専攻"
            defaultValue={member.department}
            required={mode === 'onboarding'}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">留年している</label>
        <input
          type="checkbox"
          name="isRepeating"
          className="w-4 h-4"
          defaultChecked={member.isRepeating}
          onChange={(event) => {
            const checked = event.target.checked;
            setIsRepeating(checked);
            if (!checked) {
              setRepeatYears('');
            }
          }}
        />
      </div>

      {isRepeating && (
        <div>
          <label className="block text-sm font-medium mb-2">
            何年留年していますか？
          </label>
          <input
            type="number"
            name="repeatYears"
            min={1}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1"
            required={isRepeating}
            value={repeatYears}
            onChange={(event) => {
              const nextValue = event.target.value;
              setRepeatYears(nextValue === '' ? '' : Number(nextValue));
            }}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          今何してる？（24時間で消えます）
        </label>
        <input
          type="text"
          name="currentStatusMessage"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="課題中..."
          maxLength={100}
          defaultValue={member.currentStatus?.message ?? ''}
        />
      </div>

      <TagsInput
        name="skills"
        label="スキルタグ"
        initialValues={member.skills}
        placeholder="React, TypeScript, Next.js"
        required={mode === 'onboarding'}
        category="skill"
      />

      <TagsInput
        name="interests"
        label="興味タグ"
        initialValues={member.interests}
        placeholder="Web開発, UI/UX"
        required={mode === 'onboarding'}
        category="interest"
      />

      <div className="w-full">
        <SubmitButton label={submitLabel} />
      </div>

      {mode === 'profile' && (
        <div className="w-full">
          <LogoutButton />
        </div>
      )}
    </form>
  );
}
