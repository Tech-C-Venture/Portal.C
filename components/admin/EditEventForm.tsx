'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';
import {
  updateEventAction,
  type UpdateEventFormState,
} from '@/app/actions/events';

type EditEventFormProps = {
  eventId: string;
  title: string;
  description: string;
  startDateLocal: string;
  location: string;
  capacity: number | null;
  onlineUrl?: string | null;
  onlinePassword?: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="large" variant="contained" disabled={pending}>
      {pending ? '更新中...' : 'イベントを更新'}
    </Button>
  );
}

export function EditEventForm({
  eventId,
  title,
  description,
  startDateLocal,
  location,
  capacity,
  onlineUrl,
  onlinePassword,
}: EditEventFormProps) {
  const [state, formAction] = useActionState<UpdateEventFormState, FormData>(
    updateEventAction,
    {
      error: null,
      success: null,
    }
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />

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
        <label className="block text-sm font-medium mb-2">イベント名</label>
        <input
          type="text"
          name="title"
          defaultValue={title}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">説明</label>
        <textarea
          name="description"
          defaultValue={description}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">日時</label>
          <input
            type="datetime-local"
            name="startDate"
            defaultValue={startDateLocal}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">場所</label>
          <input
            type="text"
            name="location"
            defaultValue={location}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">定員</label>
        <input
          type="number"
          name="capacity"
          defaultValue={capacity ?? ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="空欄で無制限"
          min={0}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          オンラインURL（Meet/Zoom）
        </label>
        <input
          type="url"
          name="onlineUrl"
          defaultValue={onlineUrl ?? ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://meet.google.com/xxx-xxxx-xxx"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          Zoomパスワード（任意）
        </label>
        <input
          type="text"
          name="onlinePassword"
          defaultValue={onlinePassword ?? ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="pwd用のパスワード"
        />
      </div>
      <div className="w-full">
        <SubmitButton />
      </div>
    </form>
  );
}
