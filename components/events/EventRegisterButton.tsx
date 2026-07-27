'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';
import {
  registerForEventAction,
  type RegisterEventFormState,
  unregisterFromEventAction,
  type UnregisterEventFormState,
} from '@/app/actions/events';
import type { EventSlotDTO } from '@/application/dtos/EventDTO';

type EventRegisterButtonProps = {
  eventId: string;
  slots: EventSlotDTO[];
  disabled?: boolean;
  isRegistered?: boolean;
  registeredSlotId?: string;
};

function SubmitButton({
  disabled,
  label,
}: {
  disabled?: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      size="medium"
      variant="contained"
      type="submit"
      disabled={disabled || pending}
    >
      {pending ? '処理中...' : label}
    </Button>
  );
}

export function EventRegisterButton({
  eventId,
  slots,
  disabled,
  isRegistered,
  registeredSlotId,
}: EventRegisterButtonProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(
    registeredSlotId
  );

  const [registerState, registerAction] = useActionState<
    RegisterEventFormState,
    FormData
  >(registerForEventAction, {
    error: null,
    success: null,
  });

  const [unregisterState, unregisterAction] = useActionState<
    UnregisterEventFormState,
    FormData
  >(unregisterFromEventAction, {
    error: null,
    success: null,
  });

  const activeState = isRegistered ? unregisterState : registerState;
  const formAction = isRegistered ? unregisterAction : registerAction;

  const registeredSlot = registeredSlotId
    ? slots.find((slot) => slot.id === registeredSlotId)
    : undefined;

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="eventId" value={eventId} />
      {!isRegistered && slots.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">参加枠を選択</p>
          {slots.map((slot) => (
            <label
              key={slot.id}
              className={`flex flex-wrap items-start justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                selectedSlotId === slot.id
                  ? 'border-blue-500 bg-blue-50'
                  : slot.isFull
                    ? 'border-gray-200 bg-gray-100 text-gray-500'
                    : 'border-gray-200 bg-white cursor-pointer hover:bg-gray-50'
              }`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <input
                  type="radio"
                  name="slotId"
                  value={slot.id}
                  checked={selectedSlotId === slot.id}
                  onChange={() => setSelectedSlotId(slot.id)}
                  disabled={slot.isFull || disabled}
                  className="h-4 w-4 shrink-0"
                />
                <span className="break-words">{slot.name}</span>
              </span>
              <span className="min-w-0 text-xs text-gray-500">
                {slot.participantCount} /{' '}
                {slot.capacity === 'unlimited' ? '無制限' : slot.capacity}名
                {slot.isFull && '（満員）'}
              </span>
            </label>
          ))}
        </div>
      )}
      {activeState.error && (
        <p className="text-xs text-rose-600">{activeState.error}</p>
      )}
      {activeState.success && (
        <p className="text-xs text-emerald-600">{activeState.success}</p>
      )}
      {isRegistered && registeredSlot && (
        <p className="text-xs text-gray-600">
          参加枠：{registeredSlot.name}
        </p>
      )}
      <SubmitButton
        disabled={
          disabled ||
          (!isRegistered && slots.length > 0 && !selectedSlotId)
        }
        label={isRegistered ? 'キャンセルする' : '参加する'}
      />
    </form>
  );
}
