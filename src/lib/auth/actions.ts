"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { OrgType } from "@/lib/db/schema";
import { createAccount } from "./create-account";
import { verifyCredentials } from "./credentials";
import { COOKIE_NAME, setSessionCookie } from "./session";

export type LoginState = { error?: string };
export type RegisterState = { error?: string };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  let user;
  try {
    user = await verifyCredentials(email, password);
  } catch (err) {
    console.error("[portal] login lookup failed", err);
    return { error: "The portal isn't available right now. Please try again shortly." };
  }
  if (!user) return { error: "Incorrect email or password." };

  await setSessionCookie({
    userId: user.id,
    isAdmin: user.isAdmin,
    organizationId: user.organizationId,
  });

  redirect(user.isAdmin ? "/portal/admin" : "/portal");
}

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const result = await createAccount({
    type: String(formData.get("type") ?? "") as OrgType,
    organizationName: String(formData.get("organizationName") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    discipline: String(formData.get("discipline") ?? ""),
  });
  if (!result.ok) return { error: result.error };

  await setSessionCookie({
    userId: result.user.id,
    isAdmin: false,
    organizationId: result.user.organizationId,
  });

  redirect("/portal/onboarding");
}

export async function logout() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  // Plain homepage, not ?auth=login — re-prompting to sign in immediately
  // after someone deliberately signed out is the wrong instinct.
  redirect("/");
}
