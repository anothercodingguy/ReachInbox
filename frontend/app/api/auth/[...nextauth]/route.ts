import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/authOptions";

const handler = NextAuth(authOptions);

console.log("Auth route hit");

export { handler as GET, handler as POST };
