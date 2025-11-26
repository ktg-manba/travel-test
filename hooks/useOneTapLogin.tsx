"use client";

import googleOneTap from "google-one-tap";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function () {
  const { data: session, status } = useSession();

  const oneTapLogin = async function () {
    try {
      const options = {
        client_id: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
        auto_select: false,
        cancel_on_tap_outside: false,
        context: "signin",
      };

      // console.log("onetap login trigger", options);

      googleOneTap(options, (response: any) => {
        console.log("onetap login ok", response);
        handleLogin(response.credential);
      });
    } catch (error: any) {
      // Silently handle FedCM errors - they're common when browser blocks third-party cookies
      if (error?.name === "NetworkError" || error?.message?.includes("FedCM")) {
        // Browser blocked FedCM, which is fine - user can still use regular Google sign-in button
        return;
      }
      console.error("Google One Tap error:", error);
    }
  };

  const handleLogin = async function (credentials: string) {
    const res = await signIn("google-one-tap", {
      credential: credentials,
      redirect: false,
    });
    console.log("signIn ok", res);
  };

  useEffect(() => {
    // console.log("one tap login status", status, session);

    if (status === "unauthenticated") {
      // Try once on mount
      oneTapLogin();

      // Retry every 10 seconds instead of 3 seconds to reduce errors
      const intervalId = setInterval(() => {
        oneTapLogin();
      }, 10000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [status]);

  return <></>;
}
