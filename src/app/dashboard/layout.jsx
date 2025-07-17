

import { redirect } from "next/navigation";

import NextAuth, { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs";
import User from "@/lib/models/User";
import connectDB from "@/lib/db";

const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null; // return null to indicate failure
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;
        return { id: user._id.toString(), email: user.email };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};




export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login?callbackUrl=/dashboard");
  }

  return <>{children}</>;
}
