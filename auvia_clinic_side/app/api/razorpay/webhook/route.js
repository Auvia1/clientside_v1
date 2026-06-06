// app/api/razorpay/webhook/route.js
// Razorpay Webhook Handler — verifies signature, confirms appointment on payment.
//
// Configure in Razorpay Dashboard → Settings → Webhooks:
//   URL:    https://your-domain.com/api/razorpay/webhook
//   Secret: (same as RAZORPAY_WEBHOOK_SECRET in .env.local)
//   Events: payment_link.paid

import { NextResponse } from "next/server";
import crypto from "crypto";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ── Signature verification ──────────────────────────────────────────────────
function verifySignature(body, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}

export async function POST(request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("⚠️ RAZORPAY_WEBHOOK_SECRET missing in .env.local");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  // Read raw body for signature check
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  // ── Verify ────────────────────────────────────────────────────────────────
  try {
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      console.error("❌ Razorpay webhook signature mismatch");
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
    }
  } catch (err) {
    console.error("❌ Signature verification error:", err.message);
    return NextResponse.json({ success: false, error: "Signature verification failed" }, { status: 401 });
  }

  // ── Parse event ───────────────────────────────────────────────────────────
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event;
  console.log(`📩 Razorpay webhook received: ${eventType}`);

  // ── Handle payment_link.paid ──────────────────────────────────────────────
  if (eventType === "payment_link.paid") {
    const paymentLink = event.payload?.payment_link?.entity;
    const payment = event.payload?.payment?.entity;

    if (!paymentLink) {
      console.error("❌ No payment_link entity in webhook payload");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const notes = paymentLink.notes || {};
    const appointmentId = notes.appointment_id;
    const amountPaid = (payment?.amount || paymentLink.amount_paid || 0) / 100;
    const paymentId = payment?.id || "unknown";

    console.log(`💰 Payment received: ₹${amountPaid} | Payment ID: ${paymentId} | Appointment: ${appointmentId}`);

    if (!appointmentId) {
      console.warn("⚠️ No appointment_id in payment link notes — skipping status update");
      return NextResponse.json({ success: true, message: "No appointment_id to update" });
    }

    // ── Update appointment status → confirmed + payment_status → paid ─────
    try {
      // Call the backend directly to update appointment status
      const statusRes = await fetch(`${BACKEND_URL}/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "confirmed",
          payment_status: "paid",
          payment_id: paymentId,
        }),
      });

      if (statusRes.ok) {
        console.log(`✅ Appointment ${appointmentId} confirmed after payment ${paymentId}`);

        // ── Send WhatsApp Confirmation ──
        const patientPhone = paymentLink.customer?.contact || "";
        const patientName = notes.patient_name || "Patient";
        const doctorName = notes.doctor_name || "Doctor";
        const reason = notes.reason || "General Consultation";
        const appointmentTime = notes.appointment_time || "";

        if (patientPhone) {
          const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
          const phoneId = process.env.WHATSAPP_PHONE_ID;

          if (accessToken && phoneId) {
            const digitsOnly = patientPhone.replace(/\D/g, "");
            const formattedNumber = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
            
            const payload = {
              messaging_product: "whatsapp",
              to: formattedNumber,
              type: "template",
              template: {
                name: "appointment_confirmation",
                language: { code: "en" },
                components: [
                  {
                    type: "body",
                    parameters: [
                      { type: "text", text: patientName },
                      { type: "text", text: patientPhone },
                      { type: "text", text: doctorName },
                      { type: "text", text: reason },
                      { type: "text", text: appointmentTime },
                    ],
                  },
                ],
              },
            };

            const metaRes = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });

            if (metaRes.ok) {
              console.log(`✅ WhatsApp confirmation sent to ${formattedNumber}`);
            } else {
              const errData = await metaRes.text();
              console.error(`❌ Meta API error: ${errData}`);
            }
          } else {
             console.error("⚠️ WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_ID missing in .env.local for webhook");
          }
        }
      } else {
        const errData = await statusRes.text();
        console.error(`❌ Failed to update appointment ${appointmentId}: ${statusRes.status} — ${errData}`);
      }
    } catch (err) {
      console.error(`❌ Error calling backend to confirm appointment: ${err.message}`);
    }

    return NextResponse.json({ success: true, message: "Appointment confirmed" });
  }

  // ── Other events (acknowledge but ignore) ─────────────────────────────────
  console.log(`ℹ️ Ignoring event: ${eventType}`);
  return NextResponse.json({ success: true, message: `Event ${eventType} acknowledged` });
}
