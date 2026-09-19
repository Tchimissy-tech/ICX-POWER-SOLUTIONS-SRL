export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export type AuthAction = "signIn" | "signUp";
export const startLogin = (action: AuthAction = "signIn") => {
  // The server owns the OAuth app ID, redirect URI and nonce cookie. This avoids
  // broken sign-in/sign-up links when Vite variables are absent in the browser
  // bundle or when Render sits behind an HTTPS proxy.
  window.location.href = `/api/oauth/start?type=${encodeURIComponent(action)}`;
};
export const startSignup = () => startLogin("signUp");
