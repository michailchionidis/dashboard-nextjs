export const getDatabaseUrl = () => {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL
}