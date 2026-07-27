"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null as { error?: string } | null);

  return (
    <div className="a-login">
      <form className="a-login-card" action={action}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="" />
        <h1>لوحة التحكم</h1>
        <p>إنترنشونال للخدمات المالية والمجوهرات</p>

        {state?.error && <div className="a-error">{state.error}</div>}

        <div className="a-field">
          <label htmlFor="password">كلمة المرور</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
          />
        </div>

        <button className="a-btn wide" type="submit" disabled={pending}>
          {pending ? "جارٍ الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
