import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers: { GET, POST }, auth } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
      checks: ["state"],
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.githubAccessToken = account.access_token
      }
      if (profile) {
        token.githubLogin = (profile as any).login as string
      }
      return token
    },
    async session({ session, token }) {
      (session as any).githubAccessToken = token.githubAccessToken as string
      ;(session as any).githubLogin = token.githubLogin as string
      if (session.user) {
        (session.user as any).login = token.githubLogin as string
      }
      return session
    },
  },
})
