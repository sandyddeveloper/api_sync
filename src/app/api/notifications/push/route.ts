import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, playerIds, data, imageUrl, buttons } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message content is required for push notifications." },
        { status: 400 }
      );
    }

    const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
    const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

    // Fallback/Simulate push if credentials are not configured
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
      console.warn("OneSignal credentials not configured in environment. Simulating push notification delivery.");
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "Push notification simulated successfully (credentials missing).",
        data: {
          title: title || "Nila Dashboard",
          message,
          targetCount: playerIds?.length || "All Subscribed Users",
          payload: data || null,
        },
      });
    }

    // Build standard OneSignal REST API payload
    const pushPayload: Record<string, any> = {
      app_id: ONESIGNAL_APP_ID,
      contents: { en: message },
      headings: title ? { en: title } : undefined,
      data: data || undefined,
      big_picture: imageUrl || undefined, // Big image for Android/iOS
      buttons: buttons || undefined, // Custom action buttons
    };

    // If target player IDs are provided, direct the push to them specifically.
    // Otherwise, target the general "Subscribed Users" segment.
    if (playerIds && Array.isArray(playerIds) && playerIds.length > 0) {
      // Support both include_player_ids (legacy) and include_subscription_ids (current standard)
      pushPayload.include_player_ids = playerIds;
      pushPayload.include_subscription_ids = playerIds;
    } else {
      pushPayload.included_segments = ["Subscribed Users"];
    }

    // Make the actual REST API call to OneSignal
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify(pushPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("OneSignal API error response:", result);
      return NextResponse.json(
        {
          success: false,
          message: "OneSignal rejected the notification request.",
          errors: result.errors || [result.error || "Unknown error"],
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Push notification triggered successfully via OneSignal API.",
      data: result,
    });
  } catch (error: any) {
    console.error("Push notification integration error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to trigger push notification", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
