# Terminal Portfolio

A **portfolio served over SSH**, with a terminal interface built in Go and content fetched from Notion. Visitors use their existing terminal rather than opening a website or installing a dedicated client.

## Serving the Interface

Wish accepts the SSH connection and hosts the Bubble Tea application. Bubble Tea handles interaction and application state, while Lip Gloss supplies the terminal layout and styles.

```text
SSH client → Wish server → Bubble Tea model → terminal views
                                  ↑
                          Notion content store
```

The server keeps an SSH host key separate from its content data. That key needs persistent storage across deployments so returning visitors can recognize the same server identity.

## Updating Content

Projects and other portfolio records are stored in Notion and fetched through its API. A configurable refresh interval updates the content store without rebuilding the application for every text change.

This separates content edits from interface changes: records can be updated in Notion, while layout and interaction changes still require a new application build.

## Deployment and Limits

The repository includes a Dockerfile and Fly.io configuration, with a persistent volume for the host key and a secret for the Notion API credential.

The application depends on SSH access and the availability of its server. Content refresh also depends on the Notion integration and its permissions. The repository contains setup and deployment instructions.
