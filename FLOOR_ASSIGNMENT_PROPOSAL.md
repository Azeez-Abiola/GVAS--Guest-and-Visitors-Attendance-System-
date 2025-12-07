# Floor Assignment System - Implementation Proposal

## Overview
Implement floor-based visitor assignment to streamline reception duties and ensure visitors are handled by the correct floor receptionist.

---

## Database Changes Needed

### 1. Add `floor` column to `visitors` table
```sql
ALTER TABLE visitors 
ADD COLUMN floor VARCHAR(50);

-- Optional: Add floor to hosts table if not already there
ALTER TABLE hosts 
ADD COLUMN floor VARCHAR(50);
```

### 2. Floor Assignment Logic
- Store floor as: 'Ground Floor', '1st Floor', '2nd Floor', etc.
- Match with receptionist's `assigned_floors` array

---

## UI Changes Required

### 1. **Add Visitor Modal** (Pre-registration)
**Location:** `AdminDashboard.jsx`

**Changes:**
- Add "Floor" dropdown after "Host" selection
- Auto-populate floor when host is selected (if host has floor data)
- Allow manual floor override
- Store floor with visitor record

```jsx
// New Field
<div>
  <label>Floor</label>
  <select 
    value={formData.floor} 
    onChange={(e) => setFormData({...formData, floor: e.target.value})}
  >
    <option value="">Select Floor</option>
    <option value="Ground Floor">Ground Floor</option>
    <option value="1st Floor">1st Floor</option>
    <option value="2nd Floor">2nd Floor</option>
    {/* ... more floors */}
  </select>
</div>
```

### 2. **Walk-in Check-in Modal**
**Location:** `ReceptionDashboard.jsx`

**Changes:**
- Add same floor dropdown in walk-in registration form
- When host is selected, auto-fill their floor
- Required field for check-in

### 3. **Print Badge Modal**
**Location:** `ReceptionDashboard.jsx`

**Changes:**
- Add "Floor" filter dropdown to search visitors
- Show floor on visitor card/badge preview
- Print floor on physical badge

---

## Notification System

### 1. **Floor-Based Notifications**

**When visitor is registered/checked-in:**
```javascript
// Get receptionists assigned to this floor
const floorsReceptionists = users.filter(user => 
  user.role === 'reception' && 
  user.assigned_floors?.includes(visitorFloor)
);

// Send notification to each receptionist
floorsReceptionists.forEach(receptionist => {
  sendNotification(receptionist.id, {
    type: 'visitor_assigned',
    message: `New visitor on ${visitor.floor}: ${visitor.name} visiting ${visitor.host_name}`,
    visitor_id: visitor.id,
    floor: visitor.floor
  });
});
```

### 2. **Notification Display**
**Location:** `ReceptionDashboard.jsx`

- Show notifications in notification bell icon
- Click notification to open visitor details
- Badge count for unread notifications
- Filter by floor

---

## Reception Dashboard Enhancements

### 1. **Floor Filter Section**
```jsx
<div className="mb-4">
  <label>Filter by Floor</label>
  <select onChange={(e) => setFloorFilter(e.target.value)}>
    <option value="all">All Floors</option>
    <option value="my-floors">My Assigned Floors Only</option>
    {assignedFloors.map(floor => (
      <option key={floor} value={floor}>{floor}</option>
    ))}
  </select>
</div>
```

### 2. **Visitor Cards Enhancement**
- Display floor badge on each visitor card
- Color-code by floor (optional)
- Sort by floor in lists

---

## Benefits

✅ **Organized Workflow:**
- Receptionists only see visitors for their floors
- Reduces confusion about which visitors to handle

✅ **Better Security:**
- Floor tracking provides better access control
- Easy to identify unauthorized floor visits

✅ **Efficient Notifications:**
- Right receptionist gets notified
- Reduces noise from irrelevant notifications

✅ **Better Reporting:**
- Floor-wise visitor analytics
- Track busy floors
- Optimize receptionist assignments

---

## Implementation Priority

### Phase 1 (Essential):
1. ✅ Add floor column to database
2. ✅ Add floor dropdown to Add Visitor modal
3. ✅ Add floor dropdown to Walk-in Check-in modal
4. ✅ Display floor on visitor cards

### Phase 2 (Enhanced):
1. ✅ Floor-based notifications
2. ✅ Reception dashboard floor filters
3. ✅ Auto-select host's floor

### Phase 3 (Advanced):
1. ✅ Floor analytics in reports
2. ✅ Print floor on badges
3. ✅ Floor-based access control rules

---

## Sample Floor Configuration

```javascript
const FLOORS = [
  { id: 'ground', name: 'Ground Floor', color: 'blue' },
  { id: '1st', name: '1st Floor', color: 'green' },
  { id: '2nd', name: '2nd Floor', color: 'purple' },
  { id: '3rd', name: '3rd Floor', color: 'orange' },
  { id: '4th', name: '4th Floor', color: 'red' },
  { id: '5th', name: '5th Floor', color: 'indigo' },
  // ... more floors
];
```

---

## Code Changes Summary

### Files to Modify:
1. ✅ `AdminDashboard.jsx` - Add floor to visitor form
2. ✅ `ReceptionDashboard.jsx` - Add floor to walk-in & filters
3. ✅ `api.js` - Update visitor creation/update methods
4. ✅ Database migration - Add floor column

### New Features:
1. ✅ Floor-based notification system
2. ✅ Floor filtering in dashboards
3. ✅ Floor display on badges

---

## Next Steps

**Should we proceed with implementation?**

I recommend:
1. First, add the floor column to the database
2. Then update the Add Visitor modal
3. Then update Walk-in Check-in
4. Finally, implement notifications and filtering

Would you like me to start implementing this system?
