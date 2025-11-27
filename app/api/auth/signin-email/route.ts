import { getSupabaseClient } from "@/models/db";
import { respData, respErr } from "@/lib/resp";
import { findUserByEmail } from "@/models/user";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return respErr("Email and password are required");
    }

    const supabase = getSupabaseClient();

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log("Supabase signin error:", authError);
      return respErr(authError.message || "Signin failed");
    }

    if (!authData.user) {
      return respErr("Invalid credentials");
    }

    // Get user from database
    const dbUser = await findUserByEmail(email);

    return respData({
      message: "Signin successful",
      user: {
        ...authData.user,
        dbUser,
      },
      session: authData.session,
    });
  } catch (e: any) {
    console.log("signin failed: ", e);
    return respErr("signin failed: " + e.message);
  }
}


