"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  brandProfiles,
  developerProfiles,
  franchiseeProfiles,
  investorProfiles,
  landlordProfiles,
  organizations,
  users,
  type OrgType,
} from "@/lib/db/schema";
import { SELF_SERVICE_TYPES } from "@/lib/portal/domain";
import { hashPassword, verifyPassword } from "./password";
import { COOKIE_NAME, SESSION_TTL_SECONDS, createSessionToken } from "./session";

export type LoginState = { error?: string };
export type RegisterState = { error?: string };

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function setSessionCookie(payload: {
  userId: string;
  isAdmin: boolean;
  organizationId: string | null;
}) {
  const token = await createSessionToken(payload);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

/** Creates the empty profile row matching the organization's type, so the
 * onboarding wizard always has a record to update rather than having to
 * branch on insert-vs-update. */
async function createProfileFor(type: OrgType, organizationId: string) {
  const db = getDb();
  switch (type) {
    case "brand":
      await db.insert(brandProfiles).values({ organizationId });
      break;
    case "franchisee":
      await db.insert(franchiseeProfiles).values({ organizationId });
      break;
    case "landlord":
      await db.insert(landlordProfiles).values({ organizationId });
      break;
    case "developer":
      await db.insert(developerProfiles).values({ organizationId });
      break;
    case "investor":
      await db.insert(investorProfiles).values({ organizationId });
      break;
  }
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  let user;
  try {
    const db = getDb();
    [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  } catch (err) {
    console.error("[portal] login lookup failed", err);
    return { error: "The portal isn't available right now. Please try again shortly." };
  }

  // Same generic message either way — never confirm whether an email exists.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

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
  const type = String(formData.get("type") ?? "") as OrgType;
  const orgName = String(formData.get("organizationName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!SELF_SERVICE_TYPES.includes(type)) {
    return { error: "Choose an account type." };
  }
  if (orgName.length < 2) return { error: "Enter your company or organization name." };
  if (name.length < 2) return { error: "Enter your name." };
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };

  let created;
  try {
    const db = getDb();
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) return { error: "An account with that email already exists." };

    const [org] = await db
      .insert(organizations)
      .values({ name: orgName, type })
      .returning();

    await createProfileFor(type, org.id);

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({ email, name, organizationId: org.id, passwordHash })
      .returning();

    created = user;
  } catch (err) {
    console.error("[portal] registration failed", err);
    return { error: "Something went wrong creating your account. Please try again." };
  }

  await setSessionCookie({
    userId: created.id,
    isAdmin: false,
    organizationId: created.organizationId,
  });

  redirect("/portal/onboarding");
}

export async function logout() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  redirect("/portal/login");
}
