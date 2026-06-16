import { getEnv } from "../utils/get-env";

const appConfig = {
 NODE_ENV: getEnv("NODE_ENV", "development"),
 PORT: getEnv("PORT", "5000"),
 BASE_PATH: getEnv("BASE_PATH", "/api"),
MONGO_URI: getEnv("MONGO_URI", ""),


SESSION_SECRET: getEnv("SESSION_SECRET", "your-secret-key"),
SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN", "1d"),

GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID", ""),
GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET", ""),
GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL", ""),


FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:3000"),
FRONTEND_GOOGLE_CALLBACK_URL: getEnv("FRONTEND_GOOGLE_CALLBACK_URL", "http://localhost:3000/auth/google/callback"),
}
export default appConfig;