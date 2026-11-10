# Tether

A watch-party server that keeps participants on a shared playback timeline, with chat and a host dashboard showing drift, latency, and buffering status.

## One Playback Clock

Each room has an authoritative server-side playback clock. Participants send heartbeat messages containing their current playback position. The server compares those positions with the room clock and sends rate adjustments when drift exceeds the configured threshold.

The default implementation starts correcting drift beyond three seconds and returns the playback rate to normal once drift falls below half a second. Small corrections can converge through playback-rate changes rather than repeatedly jumping the video.

```text
Player heartbeat → server clock comparison → drift estimate
                 → rate adjustment → next heartbeat
```

These are correction thresholds, not a measured guarantee that every combination of player and network stays within a fixed latency.

## Rooms, Disconnections, and Linked Playback

Rooms hold playback state, participants, and chat history. A disconnected participant keeps a slot for 60 seconds, while empty rooms have a separate cleanup grace period.

Linked rooms can use different video sources while sharing a timeline. Playback commands propagate between them, so a seek or pause applies to the linked session.

The embedded player supports HLS, YouTube, and Vimeo sources. Provider behavior and buffering can differ, which is why the dashboard exposes participant state instead of treating every connected player as healthy.

## Host Controls and Chat

The first participant becomes the host. Host commands include removing a participant and forcing clients back to the authoritative position. Host validation is separate from ordinary playback and chat handling.

Chat has message rate limiting and ephemeral emoji reactions. Client and server communicate through typed JSON messages over WebSocket; room creation and lookup use HTTP endpoints.

## Structure and Testing

Bun runs the backend and builds the frontend. The server separates room lifecycle, WebSocket routing, synchronization, host commands, and chat into distinct modules.

The repository includes room, protocol, synchronization, host, chat, and integration tests. These exercise the server’s behavior; actual playback still depends on browser media support, the selected provider, and network conditions.
