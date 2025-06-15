import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string
      roles?: string[]
      role?: string
      permissions?: any
      provider?: string
    }
  }

  interface User {
    id: string
    username?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string
    roles?: string[]
    role?: string
    permissions?: any
    provider?: string
  }
}