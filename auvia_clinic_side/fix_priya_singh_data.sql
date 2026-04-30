-- ============================================================
-- FIX DR. PRIYA SINGH'S APPOINTMENT TIMES
-- Remove incorrect data (09:30/15:30) and add corrected times (09:00/16:00)
-- Clinic ID: 16c585e0-76b4-4d72-91d2-9a47fb83daad
-- Doctor ID: 318d81aa-fc09-4f71-a6a1-02e2cfa77979
-- ============================================================

-- Step 1: Delete activity logs related to Dr. Priya Singh appointments
DELETE FROM public.activity_log
WHERE clinic_id = '16c585e0-76b4-4d72-91d2-9a47fb83daad'
  AND entity_type = 'appointment'
  AND entity_id IN (
    SELECT id FROM public.appointments
    WHERE doctor_id = '318d81aa-fc09-4f71-a6a1-02e2cfa77979'
  );

-- Step 2: Delete payments for Dr. Priya Singh appointments
DELETE FROM public.payments
WHERE clinic_id = '16c585e0-76b4-4d72-91d2-9a47fb83daad'
  AND appointment_id IN (
    SELECT id FROM public.appointments
    WHERE doctor_id = '318d81aa-fc09-4f71-a6a1-02e2cfa77979'
  );

-- Step 3: Delete all Dr. Priya Singh appointments
DELETE FROM public.appointments
WHERE clinic_id = '16c585e0-76b4-4d72-91d2-9a47fb83daad'
  AND doctor_id = '318d81aa-fc09-4f71-a6a1-02e2cfa77979';

-- Step 4: Insert corrected appointments with proper times
-- Changed: 09:30 IST → 09:00 IST (04:00 UTC → 04:30 UTC)
--         15:30 IST → 16:00 IST (10:00 UTC → 10:30 UTC)

INSERT INTO public.appointments
  (id, clinic_id, patient_id, doctor_id, appointment_start, appointment_end, reason, notes, status, source, payment_status, payment_amount, token_number, created_at, updated_at)
VALUES

-- ── Apr 29 (Tuesday) ────────────────────────────────────────
-- Dr. Priya Singh – Tue morning 09:00 IST = 04:30 UTC
('b0000001-0000-0000-0000-000000000007', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000007', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-04-29 04:30:00+00', '2026-04-29 05:00:00+00',
 'Acne treatment', 'Persistent acne on face', 'completed', 'ai_agent', 'paid', 500.00, 1, NOW()-INTERVAL '3 days', NOW()-INTERVAL '3 days'),

('b0000001-0000-0000-0000-000000000008', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000008', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-04-29 05:00:00+00', '2026-04-29 05:30:00+00',
 'Psoriasis follow-up', 'Quarterly psoriasis check', 'completed', 'manual', 'paid', 500.00, 2, NOW()-INTERVAL '3 days', NOW()-INTERVAL '3 days'),

-- ── Apr 30 (Wednesday) ───────────────────────────────────────
-- Dr. Priya Singh – Wed morning 09:00 IST = 04:30 UTC
('b0000001-0000-0000-0000-000000000018', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000018', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-04-30 04:30:00+00', '2026-04-30 05:00:00+00',
 'Eczema', 'Itchy skin around elbows', 'completed', 'ai_agent', 'paid', 500.00, 1, NOW()-INTERVAL '2 days', NOW()-INTERVAL '2 days'),

-- ── May 1 (Thursday) ─────────────────────────────────────────
-- Dr. Priya Singh – Thu morning 09:00 IST = 04:30 UTC
('b0000001-0000-0000-0000-000000000027', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000007', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-05-01 04:30:00+00', '2026-05-01 05:00:00+00',
 'Fungal infection', 'Ringworm on foot', 'confirmed', 'ai_agent', 'unpaid', 500.00, 1, NOW()-INTERVAL '1 day', NOW()-INTERVAL '1 day'),

-- Dr. Priya Singh – Thu evening 16:00 IST = 10:30 UTC
('b0000001-0000-0000-0000-000000000028', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000008', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-05-01 10:30:00+00', '2026-05-01 11:00:00+00',
 'Pigmentation', 'Dark spots on face and neck', 'confirmed', 'manual', 'unpaid', 500.00, 2, NOW()-INTERVAL '1 day', NOW()-INTERVAL '1 day'),

-- ── May 2 (Friday) ───────────────────────────────────────────
-- Dr. Priya Singh – Fri morning 09:00 IST = 04:30 UTC
('b0000001-0000-0000-0000-000000000038', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000018', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-05-02 04:30:00+00', '2026-05-02 05:00:00+00',
 'Hair loss', 'Excessive hair fall for 3 months', 'pending', 'ai_agent', 'unpaid', 500.00, 1, NOW()-INTERVAL '12 hours', NOW()-INTERVAL '12 hours'),

-- Dr. Priya Singh – Fri evening 16:00 IST = 10:30 UTC
('b0000001-0000-0000-0000-000000000039', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000019', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-05-02 10:30:00+00', '2026-05-02 11:00:00+00',
 'Vitiligo', 'White patches on arms', 'pending', 'manual', 'unpaid', 500.00, 2, NOW()-INTERVAL '12 hours', NOW()-INTERVAL '12 hours'),

-- ── May 3 (Saturday) ─────────────────────────────────────────
-- Dr. Priya Singh – Sat morning 09:00 IST = 04:30 UTC
('b0000001-0000-0000-0000-000000000047', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000007', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-05-03 04:30:00+00', '2026-05-03 05:00:00+00',
 'Urticaria', 'Hives and itching after food', 'pending', 'ai_agent', 'unpaid', 500.00, 1, NOW()-INTERVAL '6 hours', NOW()-INTERVAL '6 hours'),

-- Dr. Priya Singh – Sat evening 16:00 IST = 10:30 UTC
('b0000001-0000-0000-0000-000000000048', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000008', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-05-03 10:30:00+00', '2026-05-03 11:00:00+00',
 'Seborrheic dermatitis', 'Scalp flaking and redness', 'pending', 'manual', 'unpaid', 500.00, 2, NOW()-INTERVAL '6 hours', NOW()-INTERVAL '6 hours'),

-- ── May 4 (Sunday) ───────────────────────────────────────────
-- Dr. Priya Singh – Sun morning 09:00 IST = 04:30 UTC
('b0000001-0000-0000-0000-000000000054', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000014', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-05-04 04:30:00+00', '2026-05-04 05:00:00+00',
 'Nail infection', 'Thickening and discoloration of nails', 'pending', 'ai_agent', 'unpaid', 500.00, 1, NOW()-INTERVAL '3 hours', NOW()-INTERVAL '3 hours'),

-- Dr. Priya Singh – Sun evening 16:00 IST = 10:30 UTC
('b0000001-0000-0000-0000-000000000055', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000015', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-05-04 10:30:00+00', '2026-05-04 11:00:00+00',
 'Contact dermatitis', 'Rash from detergent exposure', 'pending', 'ai_agent', 'unpaid', 500.00, 2, NOW()-INTERVAL '3 hours', NOW()-INTERVAL '3 hours'),

-- ── May 5 (Monday) ───────────────────────────────────────────
-- Dr. Priya Singh – Mon morning 09:00 IST = 04:30 UTC
('b0000001-0000-0000-0000-000000000064', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000004', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-05-05 04:30:00+00', '2026-05-05 05:00:00+00',
 'Melasma', 'Brown patches on forehead', 'pending', 'ai_agent', 'unpaid', 500.00, 1, NOW()-INTERVAL '1 hour', NOW()-INTERVAL '1 hour'),

-- Dr. Priya Singh – Mon evening 16:00 IST = 10:30 UTC
('b0000001-0000-0000-0000-000000000065', '16c585e0-76b4-4d72-91d2-9a47fb83daad',
 'a1000001-0000-0000-0000-000000000005', '318d81aa-fc09-4f71-a6a1-02e2cfa77979',
 '2026-05-05 10:30:00+00', '2026-05-05 11:00:00+00',
 'Rosacea', 'Facial redness and skin flushing', 'pending', 'manual', 'unpaid', 500.00, 2, NOW()-INTERVAL '1 hour', NOW()-INTERVAL '1 hour')

ON CONFLICT DO NOTHING;

-- Step 5: Re-add payments for completed appointments
INSERT INTO public.payments (id, clinic_id, appointment_id, amount, currency, status, provider, provider_payment_id, created_at)
VALUES
('c0000001-0000-0000-0000-000000000007', '16c585e0-76b4-4d72-91d2-9a47fb83daad', 'b0000001-0000-0000-0000-000000000007', 500.00, 'INR', 'paid', 'razorpay', 'pay_MithApr29_Priya01', NOW()-INTERVAL '3 days'),
('c0000001-0000-0000-0000-000000000008', '16c585e0-76b4-4d72-91d2-9a47fb83daad', 'b0000001-0000-0000-0000-000000000008', 500.00, 'INR', 'paid', 'razorpay', 'pay_MithApr29_Priya02', NOW()-INTERVAL '3 days'),
('c0000001-0000-0000-0000-000000000017', '16c585e0-76b4-4d72-91d2-9a47fb83daad', 'b0000001-0000-0000-0000-000000000018', 500.00, 'INR', 'paid', 'razorpay', 'pay_MithApr30_Priya01', NOW()-INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- DONE: Dr. Priya Singh's appointments now use correct times
-- Times corrected from 09:30/15:30 to 09:00/16:00 IST
-- ============================================================
