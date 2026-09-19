export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL || "https://api.manus.im",
  oAuthPortalUrl: process.env.VITE_OAUTH_PORTAL_URL || "https://manus.im",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Confirmed by the owner: this identity is the canonical ICX super-administrator.
  // Keep this explicit so a misconfigured deployment variable cannot redirect alerts.
  adminNotificationEmail: "icxps.sale@outlook.com",
};
