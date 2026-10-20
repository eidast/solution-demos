export function setupSourceViewer(getSelected) {
  const button = document.querySelector('#viewSource');
  const dialog = document.querySelector('#sourceDialog');
  const picker = document.querySelector('#sourceFile');
  const code = document.querySelector('#sourceCode');
  const status = document.querySelector('#sourceStatus');
  let files = [];
  let request;
  const showFile = () => {
    code.textContent = files[Number(picker.value)]?.code || '';
    code.parentElement.scrollTop = code.parentElement.scrollLeft = 0;
  };
  picker.addEventListener('change', showFile);
  document.querySelector('#closeSource').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { request?.abort(); button.focus(); });
  button.addEventListener('click', async () => {
    const selected = getSelected();
    if (!selected) return;
    request?.abort();
    const current = new AbortController();
    request = current;
    files = []; picker.replaceChildren(); picker.disabled = true; code.textContent = '';
    document.querySelector('#sourceTitle').textContent = `${selected.title} · Source code`;
    status.textContent = 'Loading implementation…';
    dialog.showModal();
    try {
      const response = await fetch(`videos/${encodeURIComponent(selected.id)}/implementation`, { cache: 'no-store', signal: current.signal });
      if (!response.ok) throw new Error('Source unavailable');
      const result = await response.json();
      if (request !== current || current.signal.aborted || !dialog.open) return;
      if (result.videoId !== selected.id || !Array.isArray(result.files) || !result.files.length) throw new Error('Unexpected implementation');
      files = result.files;
      files.forEach((file, index) => {
        const option = document.createElement('option');
        option.value = index; option.textContent = file.name; picker.append(option);
      });
      picker.disabled = false; showFile();
      status.textContent = `${files.length} files · Read only · Video: ${selected.id}`;
    } catch {
      if (request === current && !current.signal.aborted) status.textContent = 'Could not load the source. Close this dialog and try again.';
    }
  });
}
