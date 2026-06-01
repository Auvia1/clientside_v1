// app/api/whatsapp/send-template/route.js
// Server-side route to send WhatsApp templates via Meta Cloud API
// This runs on the Next.js server so secrets never reach the browser.

import { NextResponse } from "next/server";

const META_API_VERSION = "v22.0";

function formatWhatsAppNumber(phone) {
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 10) return `91${digitsOnly}`;
  return digitsOnly;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      phone_number,
      template_name,
      language_code = "en",
      body_variables = [],
      button_variable,
    } = body;

    // ── Validate ──────────────────────────────────────────────────
    if (!phone_number || !template_name) {
      return NextResponse.json(
        { success: false, error: "phone_number and template_name are required" },
        { status: 400 }
      );
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!accessToken || !phoneId) {
      console.error("⚠️ WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_ID missing in .env.local");
      return NextResponse.json(
        { success: false, error: "WhatsApp credentials not configured on server" },
        { status: 500 }
      );
    }

    const formattedNumber = formatWhatsAppNumber(phone_number);

    // ── Build template components ────────────────────────────────
    const components = [];

    if (body_variables.length > 0) {
      components.push({
        type: "body",
        parameters: body_variables.map((v) => ({ type: "text", text: String(v) })),
      });
    }

    if (button_variable) {
      components.push({
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [{ type: "text", text: String(button_variable) }],
      });
    }

    const payload = {
      messaging_product: "whatsapp",
      to: formattedNumber,
      type: "template",
      template: {
        name: template_name,
        language: { code: language_code },
        components,
      },
    };

    // ── Send to Meta Cloud API ───────────────────────────────────
    const url = `https://graph.facebook.com/${META_API_VERSION}/${phoneId}/messages`;

    const metaRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const metaData = await metaRes.json();

    if (metaRes.ok) {
      console.log(`✅ WhatsApp template "${template_name}" sent to ${formattedNumber}`);
      return NextResponse.json({ success: true, data: metaData });
    }

    console.error(`❌ Meta API error ${metaRes.status}:`, JSON.stringify(metaData));
    return NextResponse.json(
      { success: false, error: metaData.error?.message || "Meta API error", details: metaData },
      { status: metaRes.status }
    );
  } catch (err) {
    console.error("❌ WhatsApp send-template route error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
