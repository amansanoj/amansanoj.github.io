# Transferring Files to an iPhone with VLC

I was moving audio files from my Linux laptop to my iPhone through VLC’s Wi-Fi upload feature when I noticed how quickly they were arriving. I wanted a larger file to see whether that speed held up.

On Linux, I created a test file:

```bash
fallocate -l 5G dummy_file.bin
```

Then I uploaded it through VLC’s browser interface. I observed a sustained transfer rate of about **133 Mbps**, or roughly **16.6 MB/s**. That was faster than the LocalSend transfers I’d seen between my own devices.

## What the Test Actually Shows

This was a single local observation, not a controlled comparison of the two applications. I didn’t record repeated trials with identical network conditions, device temperatures, app versions, and file contents.

The distinction between Mbps and MB/s also matters. There are eight bits in a byte. A transfer at 133 Mbps is not moving 133 megabytes every second.

`fallocate` is useful for reserving space quickly, but the result isn’t representative of every real file. Its `5G` size uses a binary unit, and the file’s contents aren’t a substitute for testing actual media, archives, or many small files. The [util-linux manual](https://github.com/util-linux/util-linux/blob/master/sys-utils/fallocate.1.adoc) describes its allocation behavior.

## Both Tools Transfer Locally

VLC’s upload feature lets a browser send files to the phone over the local network. LocalSend also works locally. Its [protocol specification](https://github.com/localsend/protocol) describes device discovery, transfer preparation, and HTTP-based upload endpoints, with HTTPS supported.

My original explanation gave too much weight to “simple HTTP” as the reason VLC was faster. I didn’t measure protocol overhead, CPU use, or buffering, so I can’t identify the bottleneck. Application behavior and network conditions could both contribute.

For a comparison I could repeat, I’d transfer the same real file several times through each app, alternate the order, and record elapsed time and versions. I’d also keep the devices in the same positions on the same network and check that the destination received the complete file.

## Where VLC Fits in My Setup

For audio I want to play in VLC, uploading straight into the app is convenient. LocalSend remains useful when I want a general-purpose transfer tool between devices.

The speed made me try a larger upload. It didn’t establish a universal winner or a measured explanation for the difference.
