# Bus Assignment Flow

How students, stops, buses and drivers connect. The rules behind it are in [Claude.md §1.1](Claude.md#11-two-runs-a-day-the-core-rule).

Every bus does two runs every school day: a **morning run** (homes to school) and an **afternoon run** (school to homes, the same stops in reverse). The route is made once and then stays put.

## How it works

Drivers are assigned to **buses**, not areas. Areas emerge from the clustering.

```
School admin adds students (with home addresses)
        ↓
The planner groups students by geographic proximity (K-means)
        ↓
Each cluster becomes a bus's route (Bus 1 = West Bay, Bus 2 = The Pearl, ...)
        ↓
The stops are put in the shortest order over real road travel times
        ↓
School admin assigns a driver to each bus (buses.driver_id)
        ↓
Driver signs in, starts the morning or afternoon run, and sees that run's stops in order
```

**Example.** The school adds students who live in West Bay. They are grouped and assigned to, say, Bus 3. The admin opens Bus 3 and assigns the West Bay driver to it. That driver now owns the West Bay route: the cluster defined it, not a manually drawn zone.

## Database links

| Field | Meaning |
|---|---|
| `buses.driver_id` | One driver per bus |
| `students.bus_id` | Many students per bus (the cluster) |
| `students.stop_order` | The student's position in the bus's chain, in morning order; the afternoon run drives it in reverse |
| `routes` (`run`) | One saved route per bus and run, with the road line and times |

## Key points

The school admin never draws zones or assigns students to drivers. They:

1. Add students with home addresses.
2. Plan the routes. The first plan, and any later re-plan, is a **proposal** the admin applies; once a route exists it never changes by itself.
3. Assign a driver to each bus and invite them.

A driver's area is implicit: whoever drives Bus 3 serves whoever is assigned to Bus 3.

## Smart Placement: a new student

```
New student added with a home address
        ↓
The distance to each bus's cluster centre is worked out
        ↓
The student goes to the nearest bus that still has room (default capacity 40)
        ↓
Their stop slots into that bus's route (Edge Function `update`); no other stop moves
```

The admin can also pick a bus by hand in the add form. If every bus is full the student is added without a bus (shown as "No bus" in the Students list) until the admin adds a bus or makes room. Moving a student to another bus, changing their address or removing them works the same way: only their own stop changes, on the buses involved.
