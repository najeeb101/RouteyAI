# Bus Assignment Flow

## How It Works

Drivers are assigned to **buses**, not areas. Areas emerge automatically from AI clustering.

```
School Admin adds students (with home addresses)
        ↓
AI K-Means clustering groups students by geographic proximity
        ↓
Each cluster becomes a bus route (Bus #1 = West Bay, Bus #2 = The Pearl, etc.)
        ↓
School Admin assigns a driver to each bus (buses.driver_id)
        ↓
Driver logs in → sees their bus's route + passenger manifest
```

---

## West Bay Example

1. School admin adds students who live in West Bay
2. AI groups them together (geographically close) → assigned to e.g. Bus #3
3. School admin opens Bus #3 and assigns the West Bay driver to it
4. That driver now owns the West Bay route — the cluster defined it, not a manual zone selection

---

## Database Links

| Field | Meaning |
|---|---|
| `buses.driver_id` | One driver per bus |
| `students.bus_id` | Many students per bus (the cluster) |
| `students.stop_order` | Each student's position in the optimized route |

---

## Key Points

The school admin **never manually draws zones or assigns students to drivers**. They only:

1. Add students with home addresses
2. Click "Optimize Routes" → AI does the clustering automatically
3. Assign a driver to each resulting bus

A driver's "area responsibility" is implicit — whoever drives Bus #3 serves whoever the AI assigned to Bus #3. If a new student is added in West Bay, **Smart Placement** auto-assigns them to the nearest viable cluster without any manual work.

---

## Smart Placement (New Student Flow)

```
New student added with home address
        ↓
System calculates distance from student to each existing bus cluster centroid
        ↓
Student assigned to nearest bus that has remaining capacity (< 40 students)
        ↓
Route recalculates automatically via Edge Function
```

If all nearby buses are at capacity, the admin is alerted to create a new bus.
