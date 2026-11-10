# NeonOS

An ESP32 bridge between Apple Home and a Bluetooth RGB light, with a small OLED display, local button controls, persistent settings, and a signed firmware updater.

## Bridging Wi-Fi and BLE

HomeSpan exposes power, brightness, hue, and saturation to Apple Home over Wi-Fi. The ESP32 translates requested changes into BLE commands for a compatible RGB controller.

The bridge caches service discovery and replays requested state after reconnecting. A BLE write acknowledgment confirms that a command was accepted, not that the physical light reached the requested state.

```text
Apple Home → HomeSpan → requested light state → BLE controller
                            ↓
                     OLED and persistence
```

The hardware target is an ESP32-WROOM-32 with 4 MB of flash, an SSD1306 128×64 OLED, and the board’s BOOT button. Click patterns select and adjust settings; holding the button controls display sleep.

## Reducing Unnecessary Work

The OLED updates only when its displayed state changes. I²C operations are time-bounded, and missing display hardware is treated as degraded operation rather than an automatic boot failure.

Light-state writes are coalesced instead of committing every slider sample to flash. This reduces write frequency, with the tradeoff that a sudden power loss can discard recent changes.

The main loop, BLE worker, and update worker have progress checks. Periodic diagnostics report heap and stack headroom to support device testing.

## Signed Updates and Rollback

The updater uses ESP-IDF’s HTTPS client and native OTA partition APIs, independently of HomeSpan OTA. It downloads into the inactive application slot and validates the signed metadata, image hash, target, version, and size before switching boot slots.

A newly installed image enters trial validation. The boot-health protocol can reject an unhealthy trial and return to the previous image; failed releases are tracked to avoid repeatedly installing the same bad update.

Signing keys stay outside the device and repository. Software signature verification does not enable hardware Secure Boot or flash encryption.

## Validation Status

The firmware builds and has native regression and fault tests. The security tests exercise the updater with real Mbed TLS and mocked HTTP, flash, and settings interfaces.

Real-device OTA, power-loss recovery, runtime memory headroom, and prolonged operation still require the documented hardware acceptance checks. Network updates remain disabled until a signing public key is configured. The repository does not provision a production signing key or an approved release.
