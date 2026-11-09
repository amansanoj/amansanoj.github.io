# Transferring Files to an iPhone with VLC

I was moving audio files from my Linux laptop to my iPhone through VLC’s Wi-Fi upload feature when I noticed how quickly they were arriving. I wanted a larger file to see whether that speed held up.

On Linux, I created a test file:

```bash
fallocate -l 5G dummy_file.bin
```

Then I uploaded it through VLC’s browser interface. I observed a sustained transfer rate of about **133 Mbps**, or roughly **16.6 MB/s**. That was faster than the LocalSend transfers I’d seen between my own devices.

## The Transfer Rate

The 133 Mbps result came from this transfer on my network. A controlled comparison would need repeated transfers under the same conditions.

The distinction between Mbps and MB/s also matters. There are eight bits in a byte. A transfer at 133 Mbps is not moving 133 megabytes every second.

`fallocate` is useful for reserving space quickly, but the result isn’t representative of every real file. Its `5G` size uses a binary unit, and the file’s contents aren’t a substitute for testing actual media, archives, or many small files. The [util-linux manual](https://github.com/util-linux/util-linux/blob/master/sys-utils/fallocate.1.adoc) describes its allocation behavior.

## Both Tools Transfer Locally

VLC’s upload feature lets a browser send files to the phone over the local network. LocalSend also works locally. Its [protocol specification](https://github.com/localsend/protocol) describes device discovery, transfer preparation, and HTTP-based upload endpoints, with HTTPS supported.

The protocol description alone doesn’t explain the speed difference I observed. Identifying the bottleneck would require measurements of application behavior and network conditions.

A repeatable comparison would use the same real file in both apps, alternate the transfer order, and record elapsed time and app versions. Device placement and network conditions should stay consistent, and the received file should be checked for completeness.

## Where VLC Fits in My Setup

For audio I want to play in VLC, uploading straight into the app is convenient. LocalSend remains useful when I want a general-purpose transfer tool between devices.
