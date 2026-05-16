import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: "admin" | "learner";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "learner";
    name?: string;
  }
}
