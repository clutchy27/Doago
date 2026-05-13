import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        geslo: { label: "Geslo", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.geslo) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.geslo, user.geslo);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.ime, vloga: user.vloga } as any;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/prijava" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.vloga = (user as any).vloga;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.sub;
      (session.user as any).vloga = token.vloga;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
