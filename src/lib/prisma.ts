import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "@prisma/client"

const connectionString = `mysql://${process.env.DATABASE_USER || "root"}:${process.env.DATABASE_PASSWORD || "password"}@${process.env.DATABASE_HOST || "localhost"}:${process.env.DATABASE_PORT || "3306"}/${process.env.DATABASE_NAME || "translations"}`

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter: new PrismaMariaDb(connectionString),
  })

if (process.env.NODE_ENV !== "production") global.prisma = prisma