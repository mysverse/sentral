export {};

declare global {
  interface CustomJwtSessionClaims {
    roblox_id?: string;
    roblox_username?: string;
  }
}
