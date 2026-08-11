const state = { lists: [], selected: new Set(), pdfUrl: null };

const elements = {
  container: document.querySelector('#lists-container'),
  count: document.querySelector('#selection-count'),
  combine: document.querySelector('#combine-button'),
  status: document.querySelector('#status-message'),
  statusIcon: document.querySelector('#status-icon'),
  progress: document.querySelector('#progress-bar'),
  result: document.querySelector('#result-panel'),
  detail: document.querySelector('#result-detail'),
  open: document.querySelector('#open-pdf'),
  print: document.querySelector('#print-pdf')
};

function updateSelection() {
  elements.count.textContent = state.selected.size;

  elements.count.nextElementSibling.textContent =
    state.selected.size === 1
      ? 'lista seleccionada'
      : 'listas seleccionadas';

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = state.selected.has(checkbox.value);
  });
}

function renderLists() {
  elements.container.setAttribute('aria-busy', 'false');

  if (!state.lists.length) {
    elements.container.innerHTML =
      '<div class="empty-state">No hay listas configuradas.</div>';
    return;
  }

  elements.container.innerHTML = state.lists.map((list, index) => `
    <article class="list-card">

      <input
        type="checkbox"
        id="list-${index}"
        value="${escapeHtml(list.url)}"
        aria-label="Seleccionar ${escapeHtml(list.name)}"
      >

      <label class="list-info" for="list-${index}">
        <span class="list-name">
          ${escapeHtml(list.name)}
        </span>
      </label>

      <a
        class="preview-link"
        href="${escapeHtml(list.url)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ver PDF ↗
      </a>

    </article>
  `).join('');

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {

      if (checkbox.checked) {
        state.selected.add(checkbox.value);
      } else {
        state.selected.delete(checkbox.value);
      }

      updateSelection();
    });
  });

  updateSelection();
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[character])
  );
}

function setStatus(message, progress, type = '') {
  elements.status.textContent = message;
  elements.progress.style.width = `${progress}%`;

  elements.statusIcon.className = `status-icon ${type}`;

  elements.statusIcon.textContent =
    type === 'error'
      ? '!'
      : type === 'success'
        ? '✓'
        : 'i';
}

async function loadLists() {
  try {
    const response = await fetch('/api/lists');
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        payload.error || 'No se pudieron cargar las listas.'
      );
    }

    state.lists = payload;
    renderLists();

  } catch (error) {

    elements.container.setAttribute('aria-busy', 'false');

    elements.container.innerHTML =
      `<div class="empty-state">${escapeHtml(error.message)}</div>`;

    setStatus(
      'No se pudieron cargar las listas.',
      0,
      'error'
    );
  }
}

async function combinePdfs() {

  if (!state.selected.size) {
    setStatus(
      'Seleccione al menos una lista para continuar.',
      0,
      'error'
    );
    return;
  }

  elements.combine.disabled = true;
  elements.result.hidden = true;

  setStatus('Descargando listas...', 12);

  try {

    const response = await fetch('/api/combine', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        urls: state.lists
          .filter((list) => state.selected.has(list.url))
          .map((list) => list.url)
      })
    });

    if (!response.ok) {

      const payload = await response.json();

      throw new Error(
        payload.error || 'No se pudo generar el PDF.'
      );
    }

    setStatus(
      `Procesando ${state.selected.size} lista${
        state.selected.size === 1 ? '' : 's'
      }...`,
      65
    );

    const blob = await response.blob();

    if (state.pdfUrl) {
      URL.revokeObjectURL(state.pdfUrl);
    }

    state.pdfUrl = URL.createObjectURL(blob);

    setStatus(
      'PDF listo.',
      100,
      'success'
    );

    elements.detail.textContent =
      `Se combinaron ${state.selected.size} ${
        state.selected.size === 1 ? 'lista' : 'listas'
      }.`;

    elements.result.hidden = false;

  } catch (error) {

    setStatus(
      error.message,
      0,
      'error'
    );

  } finally {

    elements.combine.disabled = false;
  }
}

document
  .querySelector('#select-all')
  .addEventListener('click', () => {

    state.lists.forEach((list) => {
      state.selected.add(list.url);
    });

    updateSelection();
  });

document
  .querySelector('#deselect-all')
  .addEventListener('click', () => {

    state.selected.clear();

    updateSelection();
  });

elements.combine.addEventListener(
  'click',
  combinePdfs
);

elements.open.addEventListener(
  'click',
  () => {
    if (state.pdfUrl) {
      window.open(
        state.pdfUrl,
        '_blank',
        'noopener'
      );
    }
  }
);

elements.print.addEventListener(
  'click',
  () => {
    if (state.pdfUrl) {
      window.open(
        state.pdfUrl,
        '_blank',
        'noopener'
      );
    }
  }
);

loadLists();
