// app/api/razorpay/create-payment-link/route.js
// Server-side route to create a Razorpay Payment Link.
// Reads RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from .env.local.

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      amount,            // in INR (e.g. 500)
      patient_name,
      patient_phone,
      appointment_id,
      description = "Consultation Fee — Mithra Hospitals",
    } = body;

    if (!amount || !patient_phone) {
      return NextResponse.json(
        { success: false, error: "amount and patient_phone are required" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env.local");
      return NextResponse.json(
        { success: false, error: "Razorpay credentials not configured" },
        { status: 500 }
      );
    }

    // Clean phone → ensure 10-digit with +91 prefix for Razorpay
    const digits = patient_phone.replace(/\D/g, "");
    const phone10 = digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.slice(-10);

    // ── Create Razorpay Payment Link ────────────────────────────────
    const rzpPayload = {
      amount: Number(amount) * 100,    // Razorpay expects paise
      currency: "INR",
      description,
      customer: {
        name: patient_name || "Patient",
        contact: `+91${phone10}`,
      },
      notify: {
        sms: true,
        email: false,
      },
      reminder_enable: true,
      notes: {
        appointment_id: appointment_id || "",
        source: "clinic_dashboard",
      },
      callback_url: "",
      callback_method: "",
    };

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const rzpRes = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rzpPayload),
    });

    const rzpData = await rzpRes.json();

    if (rzpRes.ok) {
      console.log(`✅ Razorpay payment link created: ${rzpData.short_url}`);
      return NextResponse.json({
        success: true,
        data: {
          payment_link_id: rzpData.id,
          short_url: rzpData.short_url,        // e.g. https://rzp.io/i/abc123
          short_id: rzpData.short_url?.split("/").pop() || "",
          amount: rzpData.amount / 100,
        },
      });
    }

    console.error(`❌ Razorpay error ${rzpRes.status}:`, JSON.stringify(rzpData));
    return NextResponse.json(
      { success: false, error: rzpData.error?.description || "Razorpay API error", details: rzpData },
      { status: rzpRes.status }
    );
  } catch (err) {
    console.error("❌ Razorpay create-payment-link route error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
