import { getSupabaseClient } from "@/models/db";
import { respData, respErr } from "@/lib/resp";
import { saveUser } from "@/services/user";
import { User } from "@/types/user";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { getClientIp } from "@/lib/ip";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return respErr("Email and password are required");
    }

    if (password.length < 6) {
      return respErr("Password must be at least 6 characters");
    }

    const supabase = getSupabaseClient();

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/signin`,
      },
    });

    if (authError) {
      console.log("Supabase signup error:", authError);
      return respErr(authError.message || "Signup failed");
    }

    if (!authData.user) {
      return respErr("Failed to create user");
    }

    // Save user to database
    const dbUser: User = {
      uuid: getUuid(),
      email: authData.user.email || email,
      nickname: authData.user.user_metadata?.name || authData.user.email?.split("@")[0] || "",
      avatar_url: authData.user.user_metadata?.avatar_url || "",
      signin_type: "credentials",
      signin_provider: "supabase",
      signin_openid: authData.user.id,
      created_at: getIsoTimestr(),
      signin_ip: await getClientIp(),
    };

    try {
      await saveUser(dbUser);
    } catch (e) {
      console.log("Save user to database failed:", e);
      // Continue even if save fails, user is already created in Supabase
    }

    return respData({
      message: "Signup successful. Please check your email to verify your account.",
      user: authData.user,
    });
  } catch (e: any) {
    console.log("signup failed: ", e);
    return respErr("signup failed: " + e.message);
  }
}

