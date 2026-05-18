import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";

// Helper function to trigger OneSignal Push Notification on Vault Unlock
async function triggerUnlockPushNotification() {
  const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
  const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

  if (ONESIGNAL_APP_ID && ONESIGNAL_API_KEY) {
    try {
      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Basic ${ONESIGNAL_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          headings: { en: "Sanctuary Vault Unlocked! 🌌" },
          contents: { en: "The cosmic alignment is complete. Tap to enter the sacred sanctuary." },
          included_segments: ["Subscribed Users"],
          data: { 
            action: "unlock_vault",
            screen: "SanctuaryActivity"
          },
        }),
      });
      const result = await response.json();
      console.log("Vault unlock push notification sent successfully:", result);
    } catch (err) {
      console.error("Failed to dispatch OneSignal vault unlock push notification:", err);
    }
  } else {
    console.warn("OneSignal credentials missing. Skipping vault unlock push notification.");
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // Handle link-based approval from email
  if (token === "nila-eternal-2026") {
    await kv.set("vault_unlocked", true);
    // Asynchronously dispatch the OneSignal push notification
    await triggerUnlockPushNotification();
    return NextResponse.redirect(new URL("/?vault=unlocked", request.url));
  }

  const unlocked = await kv.get<boolean>("vault_unlocked") ?? false;
  const isDebug = process.env.NEXT_PUBLIC_DEBUG === "true";
  return NextResponse.json({ unlocked: isDebug || unlocked });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token === "nila-eternal-2026") {
    await kv.set("vault_unlocked", true);
    // Asynchronously dispatch the OneSignal push notification
    await triggerUnlockPushNotification();
    return NextResponse.json({ message: "Vault Unlocked" });
  }

  return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
}
