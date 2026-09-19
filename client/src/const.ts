export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export type AuthAction = "signIn" | "signUp";
export const startLogin = (action: AuthAction = "signIn") => {
  window.dispatchEvent(new CustomEvent("icx-open-local-auth", { detail: { mode: action } }));
};
export const startSignup = () => startLogin("signUp");
