# 🎫 Print Badge Feature - How It Works

## Overview
The Print Badge feature allows receptionists to generate and print professional visitor badges for checked-in visitors. This helps with physical identification and security within the building.

---

## 🔍 How to Use the Feature

### Step 1: Open Print Badge Modal
- Navigate to the **Reception Dashboard**
- Click on the **"Print Badge"** card (with the Printer icon)
- A modal will appear with a search field

### Step 2: Search for Visitor
You can search for a checked-in visitor using:
- **Visitor Name** (e.g., "John Doe")
- **Visitor ID** (e.g., "VIS-001")
- **Badge Number** (e.g., "B-123")

The system will search through all **checked-in visitors** only (not pending or checked-out).

### Step 3: Print the Badge
- Once the visitor is found, their details will appear in a preview
- Click the **"Print Badge"** button
- A new window opens with a professionally formatted badge
- Click the **"🖨️ Print Badge"** button in the new window to send to printer

---

## 🎨 Badge Design Features

The printed badge includes:

### Header Section (Dark Blue)
- **GVAS Logo** - System branding
- **Subtitle** - "Guest & Visitor Attendance System"

### Visitor Information
- **Photo Placeholder** - Circle with visitor's initial (gradient background)
- **Full Name** - Large, bold text
- **Company** - Smaller text below name

### Details Section
- **Badge Number** - Unique identifier (e.g., #B-123)
- **Check-In Time** - Timestamp of when they checked in
- **Host Name** - Who they're visiting

### QR Code Section (if available)
- **QR Code** - Machine-readable code for quick verification
- **Guest Code** - 8-character alphanumeric code (e.g., "BQCIP3Z7")
- **Validity Note** - "Scan to verify visitor identity"

### Footer
- **Valid For Date** - Full date format (e.g., "Thursday, December 5, 2024")

---

## 🔧 Technical Implementation

### 1. Search Function (`handlePrintBadgeSearch`)
```javascript
// Searches through checked-in visitors only
const allVisitors = await ApiService.getVisitors({ status: 'checked-in' })

// Matches against multiple fields
const found = allVisitors.find(v => 
  v.name?.toLowerCase().includes(printSearch.toLowerCase()) ||
  v.visitor_id?.toLowerCase() === printSearch.toLowerCase() ||
  v.badge_number?.toLowerCase() === printSearch.toLowerCase()
)
```

**What happens:**
- Fetches all visitors with status = 'checked-in'
- Performs case-insensitive search on name (partial match)
- Performs exact match on visitor_id and badge_number
- If found, stores visitor data for printing
- If not found, shows error alert

### 2. Print Function (`handlePrintBadge`)
```javascript
const printWindow = window.open('', '', 'width=800,height=600')
printWindow.document.write(/* HTML template */)
```

**What happens:**
- Opens a new browser window (800x600px)
- Generates a complete HTML document with:
  - Embedded CSS styles (responsive, print-optimized)
  - Visitor information dynamically inserted
  - QR code generation using QRCode.js library
- The window has a "Print Badge" button that triggers `window.print()`

### 3. QR Code Generation
```javascript
new QRCode(document.getElementById("qrcode"), {
  text: '${qrCodeData}',  // Guest code or visitor ID
  width: 130,
  height: 130,
  colorDark: "#0f172a",    // Slate-900 (dark blue)
  colorLight: "#ffffff",   // White
  correctLevel: QRCode.CorrectLevel.H  // High error correction
})
```

**What happens:**
- Uses QRCode.js CDN library
- Generates QR code from guest_code (preferred) or visitor_id
- Size: 130x130 pixels
- Colors match the GVAS brand (slate-900)
- High error correction level for reliable scanning

---

## 📱 Print Behavior

### On Screen
- Professional card-style layout
- White background with shadow effects
- Gradient header
- Rounded corners and borders
- Interactive "Print Badge" button with hover effects

### When Printed
- Removes background colors (for ink efficiency)
- Hides the "Print Badge" button
- Optimizes for physical badge size
- Maintains QR code quality
- Black borders for cutting guides

### CSS Media Query
```css
@media print {
  body { 
    background: white; 
    padding: 0;
  }
  .badge-container {
    box-shadow: none;
    border: 2px solid #0f172a;
  }
  .print-button { 
    display: none; 
  }
}
```

---

## 🎯 Use Cases

### 1. **Walk-in Visitors**
After checking in a walk-in visitor:
1. Click "Print Badge"
2. Search by their name
3. Print and hand them the badge

### 2. **Pre-registered Visitors**
When a pre-registered visitor arrives:
1. Check them in first (changes status to 'checked-in')
2. Use Print Badge to create their physical badge
3. Search using their visitor ID or name

### 3. **Badge Replacement**
If a visitor loses their badge:
1. Search for them in Print Badge
2. Print a replacement
3. Update badge number if needed

### 4. **Security Verification**
Security can scan the QR code to:
- Verify visitor identity
- Check their guest code
- Confirm they're currently checked in

---

## 🔒 Security Features

### Only Checked-In Visitors
- System only searches visitors with `status = 'checked-in'`
- Prevents printing badges for pending or checked-out visitors
- Ensures physical badges match system status

### QR Code Verification
- Each badge includes a unique QR code
- Can be scanned at security checkpoints
- Links to guest_code or visitor_id in database
- High error correction ensures reliability

### Temporal Validity
- Badge shows the exact date it's valid for
- Easy visual confirmation of badge freshness
- Helps security identify expired badges

---

## 🛠️ Dependencies

### External Libraries
1. **QRCode.js** - QR code generation
   - CDN: `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`
   - Used for generating scannable QR codes

2. **Google Fonts - Inter**
   - Professional, readable font family
   - Used for all text on the badge

### Browser APIs
- `window.open()` - Opens new print window
- `window.print()` - Triggers browser print dialog
- Modern browser with JavaScript enabled required

---

## 🎨 Styling Philosophy

### Color Scheme
- **Primary**: `#0f172a` (slate-900) - Matches GVAS branding
- **Secondary**: `#1e293b` (slate-800) - Hover states
- **Gray tones**: `#64748b`, `#e2e8f0` - Subtle details

### Typography
- **Logo**: 28px, bold, letter-spacing
- **Name**: 24px, bold - Most prominent element
- **Company**: 16px, gray - Supporting info
- **Details**: 14px - Readable but compact

### Layout
- Card-based design with rounded corners
- Gradient header for visual hierarchy
- Circular photo placeholder (matches modern ID cards)
- Dashed border separating QR section
- Centered alignment for professional look

---

## 📊 Data Flow

```
User clicks "Print Badge"
    ↓
Modal opens with search field
    ↓
User enters search term (name/ID/badge)
    ↓
handlePrintBadgeSearch() executes
    ↓
API call: getVisitors({ status: 'checked-in' })
    ↓
Search array for matching visitor
    ↓
If found: setPrintVisitor(visitor)
    ↓
User clicks "Print Badge" button
    ↓
handlePrintBadge() executes
    ↓
New window opens
    ↓
HTML template rendered with visitor data
    ↓
QR code generated client-side
    ↓
User clicks print button
    ↓
Browser print dialog opens
    ↓
Badge sent to printer
```

---

## 🚀 Future Enhancements (Possible)

1. **Photo Upload** - Replace initial with actual visitor photo
2. **Barcode** - Add 1D barcode for legacy scanners
3. **Multiple Badges** - Batch print for groups
4. **Badge Templates** - Different designs for VIPs, contractors, etc.
5. **Expiry Time** - Show exact check-out time or duration
6. **Floor Information** - Display which floor they're visiting
7. **Emergency Contact** - Host's phone number for emergencies

---

## ✅ Testing Checklist

- [ ] Search by full name works
- [ ] Search by partial name works
- [ ] Search by visitor ID works
- [ ] Search by badge number works
- [ ] Badge shows correct visitor information
- [ ] QR code generates and is scannable
- [ ] Print preview displays correctly
- [ ] Actual printed badge is clear and professional
- [ ] Only checked-in visitors are searchable
- [ ] Error message shows for not found visitors

---

## 🐛 Common Issues & Solutions

### Issue: "No checked-in visitor found"
**Solution**: Ensure the visitor's status is 'checked-in', not 'pending' or 'checked-out'

### Issue: QR code not showing
**Solution**: Check internet connection (QRCode.js loads from CDN). Guest code might be missing.

### Issue: Print button doesn't work
**Solution**: Browser pop-up blocker might be preventing new window. Allow pop-ups for GVAS.

### Issue: Badge looks different when printed
**Solution**: This is normal - print styles remove backgrounds/shadows for ink efficiency.

---

## 📝 Code Location

- **File**: `src/pages/ReceptionDashboard.jsx`
- **Search Function**: Line ~192 - `handlePrintBadgeSearch()`
- **Print Function**: Line ~217 - `handlePrintBadge()`
- **Modal UI**: Line ~713 - Print Badge Modal JSX

---

**Built with ❤️ for GVAS - Making visitor management seamless and professional!**
