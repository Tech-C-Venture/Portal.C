'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';
import {
  registerForEventAction,
  type RegisterEventFormState,
  unregisterFromEventAction,
  type UnregisterEventFormState,
} from '@/app/actions/events';

type EventRegisterButtonProps = {
  eventId: string;
  disabled?: boolean;
  isRegistered?: boolean;
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
  disabled,
  isRegistered,
}: EventRegisterButtonProps) {
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

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="eventId" value={eventId} />
      {activeState.error && (
        <p className="text-xs text-rose-600">{activeState.error}</p>
      )}
      {activeState.success && (
        <p className="text-xs text-emerald-600">{activeState.success}</p>
      )}
      <SubmitButton
        disabled={disabled}
        label={isRegistered ? 'キャンセルする' : '参加する'}
      />
    </form>
  );
}
