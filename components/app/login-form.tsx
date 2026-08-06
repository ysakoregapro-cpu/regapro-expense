"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/app/actions/auth";
import { Field, FieldError } from "@/components/app/field";
import { SubmitButton } from "@/components/app/submit-button";
import { Input } from "@/components/ui/input";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="ログインID" htmlFor="loginId" required>
        <Input
          id="loginId"
          name="loginId"
          autoComplete="username"
          required
        />
      </Field>
      <Field label="パスワード" htmlFor="password" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <FieldError message={state.error} />
      <SubmitButton
        className="mt-1 h-11 w-full"
        size="lg"
        pendingLabel="ログイン中…"
      >
        ログイン
      </SubmitButton>
    </form>
  );
}
