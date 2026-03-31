# Debugging Earnings API Integration

## Quick Test Steps

### 1. Open Browser DevTools
- Press **F12** or Right-click → "Inspect"
- Go to **Console** tab

### 2. Check Authorization
Run this in the console:
```javascript
console.log("Token:", localStorage.getItem("auvia_token"));
console.log("Clinic ID:", localStorage.getItem("auvia_clinic_id"));
```

**Expected output:**
- ✓ Token should be a long JWT string (starts with `eyJ...`)
- ✓ Clinic ID should be a UUID

**If missing:**
- You're not logged in
- Token may have expired
- Try logging out and logging back in

### 3. Check API Response
Run this in the console:
```javascript
const clinicId = localStorage.getItem("auvia_clinic_id");
const token = localStorage.getItem("auvia_token");
const url = `/api/payments?clinic_id=${clinicId}&status=paid&limit=10`;

fetch(url, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})
.then(r => r.json())
.then(d => {
  console.log("Status:", d.success);
  console.log("Count:", d.data?.length);
  console.log("Data:", d);
});
```

**Check the output:**
- ✓ `success: true` → API is working
- ✓ `data.length > 0` → Payments exist
- ✗ `success: false` → There's an error (check `error` field)
- ✗ `error: "Forbidden"` → Clinic ID mismatch

### 4. Look at Console Logs When Navigating to Earnings Page

When you visit the `/earnings` page, you should see:
```
📊 Fetching earnings for week: 2026-03-29 to 2026-04-04
✓ Payments API response: Array(...)
  Count: X
📈 Weekly breakdown: [...]
💰 Total earnings: ...
```

**If you see errors instead:**
- Check the error message in red
- Look at what the API returned

### 5. Check Network Requests
- Go to **Network** tab in DevTools
- Reload the page
- Look for requests to `/api/payments`
- Click on it and check:
  - **Status**: Should be `200`
  - **Response**: Should show `success: true`

---

## Common Issues & Solutions

### ❌ Error: "clinic_id query param required"
- Clinic ID is not being sent
- Check step 2 - is clinic_id set in localStorage?
- Try refreshing the page

### ❌ Error: "Forbidden"
- Clinic ID exists but doesn't match your account
- The token is for a different clinic
- Try logging out and logging in again

### ❌ Error: "session expired"
- Your JWT token has expired
- You need to log in again
- Token usually expires after 24-48 hours

### ✓ Success but data is 0
- API is working correctly
- There are just no payments in the database for that week
- This is expected if no payments exist
- The page falls back to sample data

---

## Tell Me If You See:

1. **In Browser Console (F12):**
   - Any red error messages?
   - What does it say?

2. **In Network Tab:**
   - What's the status code of `/api/payments` request?
   - What's in the response?

3. **On the Page:**
   - Does it show "₹0" for all days?
   - Does it show the fallback/sample data?
   - Any error message displayed?

Share these details and I can help you fix it!
