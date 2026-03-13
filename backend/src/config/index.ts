import "dotenv/config";

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

function getDatabaseUrl(): string {
  const direct = process.env.DATABASE_URL;
  if (direct) return direct;
  const host = process.env.DB_HOST ?? "localhost";
  const port = process.env.DB_PORT ?? "5432";
  const user = getEnv("DB_USER");
  const password = getEnv("DB_PASSWORD");
  const name = getEnv("DB_NAME");
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "4001", 10),
  jwtSecret: process.env.JWT_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : "dev-secret-change-in-production"),
  databaseUrl: getDatabaseUrl(),
} as const;

if (config.nodeEnv === "production" && !config.jwtSecret) {
  throw new Error("JWT_SECRET is required in production");
}
