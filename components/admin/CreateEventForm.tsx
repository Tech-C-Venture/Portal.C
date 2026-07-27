'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';
import {
  createEventAction,
  type CreateEventFormState,
} from '@/app/actions/events';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

interface SlotFormValue {
  id: string;
  name: string;
  capacity: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="large" variant="contained" disabled={pending}>
      {pending ? '作成中...' : 'イベントを作成'}
    </Button>
  );
}

function defaultSlotsValue(): SlotFormValue[] {
  return [];
}

function serializeSlots(slots: SlotFormValue[]): string {
  const payload = slots.map((slot) => ({
    id: slot.id,
    name: slot.name,
    capacity: slot.capacity === '' ? null : Number(slot.capacity),
  }));
  return JSON.stringify(payload);
}

export function CreateEventForm() {
  const [state, formAction] = useActionState<CreateEventFormState, FormData>(
    createEventAction,
    {
      error: null,
      success: null,
    }
  );

  const [slots, setSlots] = useState<SlotFormValue[]>(defaultSlotsValue());

  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', capacity: '' },
    ]);
  };

  const removeSlot = (id: string) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  const updateSlot = (id: string, updates: Partial<SlotFormValue>) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, ...updates } : slot))
    );
  };

  return (
    <form action={formAction} className="space-y-4">
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

      <input type="hidden" name="slots" value={serializeSlots(slots)} />

      <div>
        <label className="block text-sm font-medium mb-2">イベント名</label>
        <input
          type="text"
          name="title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="イベント名を入力"
          required
        />
      </div>
      <div>
        <RichTextEditor name="description" placeholder="イベントの説明" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">日時</label>
          <input
            type="datetime-local"
            name="startDate"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">場所</label>
          <input
            type="text"
            name="location"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="場所を入力"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          オンラインURL（Meet/Zoom）
        </label>
        <input
          type="url"
          name="onlineUrl"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://meet.google.com/xxx-xxxx-xxx"
        />
        <p className="mt-1 text-xs text-gray-500">
          Zoomの場合はミーティングURLを入力してください。
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          Zoomパスワード（任意）
        </label>
        <input
          type="text"
          name="onlinePassword"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="pwd用のパスワード"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">定員（全体）</label>
        <input
          type="number"
          name="capacity"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="30（空欄で無制限）"
          min={0}
        />
        <p className="mt-1 text-xs text-gray-500">
          参加枠を設定する場合は、全体定員ではなく各枠の定員を使って制限されます。
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">参加枠</label>
          <Button
            type="button"
            size="small"
            variant="outlined"
            onClick={addSlot}
          >
            枠を追加
          </Button>
        </div>
        {slots.length === 0 && (
          <p className="text-xs text-gray-500">
            参加枠が未設定の場合は、全体定員で受け付けます。
          </p>
        )}
        {slots.map((slot, index) => (
          <div
            key={slot.id}
            className="grid gap-3 md:grid-cols-[1fr,120px,auto] items-end rounded-lg border border-gray-200 bg-white p-3"
          >
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                枠名 {index + 1}
              </label>
              <input
                type="text"
                value={slot.name}
                onChange={(e) =>
                  updateSlot(slot.id, { name: e.target.value })
                }
                placeholder="例：LT枠"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                定員
              </label>
              <input
                type="number"
                value={slot.capacity}
                onChange={(e) =>
                  updateSlot(slot.id, { capacity: e.target.value })
                }
                placeholder="空欄で無制限"
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              type="button"
              size="small"
              variant="outlined"
              onClick={() => removeSlot(slot.id)}
            >
              削除
            </Button>
          </div>
        ))}
      </div>

      <div className="w-full">
        <SubmitButton />
      </div>
    </form>
  );
}
