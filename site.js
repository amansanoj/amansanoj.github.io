'use strict';
document.getElementById('year').textContent = new Date().getFullYear();
const certificates = document.getElementById('certifications');
let loaded = false;
certificates.addEventListener('toggle', async () => {
  if (!certificates.open || loaded) return;
  const status = document.getElementById('cert-status');
  status.textContent = 'Loading certificates…';
  try {
    const response = await fetch('assets/certificates/certificates.json');
    if (!response.ok) throw new Error('Certificate request failed');
    const files = await response.json();
    const fragment = document.createDocumentFragment();
    for (const file of files) {
      if (!/^[\w-]+\.(png|jpe?g)$/i.test(file)) continue;
      const link = document.createElement('a');
      link.href = `assets/certificates/${file}`;
      const img = document.createElement('img');
      const date = file.slice(0, 8);
      img.alt = `Certificate dated ${date.slice(0, 2)}/${date.slice(2, 4)}/${date.slice(4)}`;
      img.src = link.href;
      img.loading = 'lazy';
      link.append(img);
      fragment.append(link);
    }
    document.getElementById('cert-grid').replaceChildren(fragment);
    status.textContent = '';
    loaded = true;
  } catch {
    status.textContent = 'Certificates could not load. Close and reopen this section to retry.';
  }
});
