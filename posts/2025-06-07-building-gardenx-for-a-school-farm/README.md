# Building GardenX for a School Farm

AbdulRahman Maniar and I built GardenX for the farm at GEMS Our Own Indian School. The school community needed a way to browse produce and buy it without relying on several physical ledgers to keep orders, payments, and stock in sync.

The project ran from December 2024 to March 2025. We used Next.js and Supabase, with an ordering interface for buyers and an administration interface for the school.

## The Ordering Flow We Expected

Our initial flow was straightforward: browse the available produce, place an order, choose a payment option, and collect it at school. Orders could go to one of two pickup counters. Buyers could pay by card or pay when collecting their order.

That covered the transaction on paper. It didn’t match how everyone actually bought produce.

A lot of buyers arrived during dispersal and wanted to buy whatever was available. They weren’t placing an order in advance. A better self-ordering screen wouldn’t change that habit on its own.

## The Counter Became Part of the App

We added a point-of-sale mode so staff could enter walk-up orders at the counter. That ended up being used more than the advance ordering flow.

It also made the administrative side more important. Staff needed to distinguish a card payment from a payment due at pickup, see what remained pending, and check transaction history. Those records were what replaced the ledgers in daily use.

Across four months, GardenX processed more than AED 30,000 in produce sales. That period included winter break and exam season.

We cut other ideas, including subscription boxes, delivery routing, and a leaderboard. The counter workflow and payment records were more useful than adding another way to browse produce.

## Supporting the School Farm

[Gulf News covered the school’s farm](https://gulfnews.com/uae/dubai-school-grows-100000kg-of-fruits-and-vegetables-in-a-year-1.500153182), reporting annual production of 100,000 kg.

Our part was the software around selling that produce. Prathima Nag and Devanand Vijayakumar supported the project, alongside the wider farming work led by Selvarance Johnson.

The most useful change we made came from watching the pickup counters. We had built for people ordering ahead; we also needed to build for the people already standing in line.
