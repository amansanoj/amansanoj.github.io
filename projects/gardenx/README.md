# GardenX

A produce-ordering and counter-sales platform that AbdulRahman Maniar and I built for the farm at GEMS Our Own Indian School. It replaced several physical ledgers with shared records for orders, stock, and payments.

## Ordering and Collection

Buyers could browse available produce and place an order from their phones. The system supported card payment at checkout or payment on collection, with orders assigned to one of two pickup counters.

The administrative interface brought together stock, pending orders, payment state, and transaction history. Staff needed to distinguish a paid order from one awaiting payment at collection, rather than relying on an order total alone.

Next.js provided the web application, with Supabase supporting the data layer.

## Adapting to Walk-Up Buyers

The initial design focused on advance orders. In practice, many buyers arrived during school dispersal and wanted to buy on the spot.

We added a counter-facing point-of-sale mode so staff could enter those orders directly. That became more heavily used than the self-ordering flow. Supporting the actual buying pattern mattered more than adding further checkout features.

We dropped subscription boxes, delivery routing, and a leaderboard during the build. Counter sales and payment reporting were the more immediate needs.

## Recorded Use

GardenX processed **more than AED 30,000** in produce sales across four months, including winter break and exam season. The figure measures transactions handled by the platform.

The school’s farm was separately covered by Gulf News, which reported annual production of 100,000 kg. GardenX supported sales administration for that existing operation.

The linked build write-up covers the changes we made after seeing the pickup counters in use.
