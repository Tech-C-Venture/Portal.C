import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth-options";

let _handler: ReturnType<typeof NextAuth> | null = null;

function getHandler() {
  if (!_handler) {
    _handler = NextAuth(getAuthOptions());
  }
  return _handler;
}

export function GET(...args: Parameters<ReturnType<typeof NextAuth>>) {
  return getHandler()(...args);
}

export function POST(...args: Parameters<ReturnType<typeof NextAuth>>) {
  return getHandler()(...args);
}
