const state = {
  lists: [],
  selected: new Set(),
  selectedDays: new Set(),
  pdfUrl: null
};

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


/* =========================================================
   ORDEN DE LOS DÍAS
   ========================================================= */

const dayOrder = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes'
];


/* =========================================================
   NORMALIZAR TEXTO
   ========================================================= */

function normalizeText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
}


/* =========================================================
   NORMALIZAR CARRERA
   Evita que una misma carrera aparezca varias veces
   por diferencias entre mayúsculas/minúsculas.
   ========================================================= */

function normalizeCareer(value) {

  return normalizeText(value)
    .toUpperCase()
    .replace(/\s+/g, ' ');
}


/* =========================================================
   MOSTRAR CARRERA
   ========================================================= */

function formatCareer(value) {

  return normalizeCareer(value);
}


/* =========================================================
   MOSTRAR AÑO
   ========================================================= */

function formatYear(value) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '';
  }

  const text = normalizeText(value);

  if (/^\d+$/.test(text)) {
    return `${text}.º AÑO`;
  }

  if (/^\d+º?\s*AÑO$/i.test(text)) {
    return text
      .replace(/º?\s*AÑO/i, '.º AÑO')
      .toUpperCase();
  }

  return text.toUpperCase();
}


/* =========================================================
   OBTENER CARRERA
   Admite distintos nombres de propiedad.
   ========================================================= */

function getCareer(list) {

  return (
    list.career ||
    list.carrera ||
    list.careerName ||
    list.carreraName ||
    ''
  );
}


/* =========================================================
   OBTENER AÑO
   ========================================================= */

function getYear(list) {

  return (
    list.year ||
    list.año ||
    list.anio ||
    list.courseYear ||
    list.curso ||
    list.ano ||
    ''
  );
}


/* =========================================================
   OBTENER DÍA
   ========================================================= */

function getDay(list) {

  return normalizeText(
    list.day ||
    list.dia ||
    ''
  );
}


/* =========================================================
   ORDENAR DÍAS
   ========================================================= */

function sortDays(a, b) {

  const indexA = dayOrder.indexOf(a);
  const indexB = dayOrder.indexOf(b);

  if (indexA === -1 && indexB === -1) {
    return a.localeCompare(b, 'es');
  }

  if (indexA === -1) return 1;
  if (indexB === -1) return -1;

  return indexA - indexB;
}


/* =========================================================
   ORDENAR AÑOS
   ========================================================= */

function yearNumber(value) {

  const match = String(value || '').match(/\d+/);

  if (!match) {
    return 999;
  }

  return Number(match[0]);
}


/* =========================================================
   ACTUALIZAR CONTADOR
   ========================================================= */

function updateSelection() {

  elements.count.textContent = state.selected.size;

  const label =
    state.selected.size === 1
      ? 'lista seleccionada'
      : 'listas seleccionadas';

  if (elements.count.nextElementSibling) {
    elements.count.nextElementSibling.textContent = label;
  }

  document
    .querySelectorAll('input[data-list-checkbox]')
    .forEach((checkbox) => {

      checkbox.checked =
        state.selected.has(checkbox.value);
    });


  document
    .querySelectorAll('input[data-day-checkbox]')
    .forEach((checkbox) => {

      const day = checkbox.value;

      const listsForDay =
        state.lists.filter(
          list => getDay(list) === day
        );

      const allSelected =
        listsForDay.length > 0 &&
        listsForDay.every(
          list => state.selected.has(list.url)
        );

      checkbox.checked = allSelected;
    });
}


/* =========================================================
   SELECCIONAR / DESELECCIONAR DÍA
   ========================================================= */

function toggleDay(day, checked) {

  const listsForDay =
    state.lists.filter(
      list => getDay(list) === day
    );

  listsForDay.forEach((list) => {

    if (checked) {
      state.selected.add(list.url);
    } else {
      state.selected.delete(list.url);
    }

  });

  updateSelection();
}


/* =========================================================
   CREAR UNA MATERIA
   ========================================================= */

function createListCard(list, index) {

  const year = formatYear(getYear(list));

  return `
    <article class="list-card">

      <input
        type="checkbox"
        id="list-${index}"
        data-list-checkbox
        value="${escapeHtml(list.url)}"
        aria-label="Seleccionar ${escapeHtml(list.name)}"
      >

      <label
        class="list-info"
        for="list-${index}"
      >

        <span class="list-name">
          ${escapeHtml(list.name)}
        </span>

        ${
          year
            ? `<span class="course-year">
                ${escapeHtml(year)}
              </span>`
            : ''
        }

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
  `;
}


/* =========================================================
   CREAR CARRERA
   ========================================================= */

function createCareerSection(
  career,
  lists,
  globalIndex
) {

  const careerTitle =
    career
      ? `
        <div class="career-section">

          <div class="career-title">
            ${escapeHtml(formatCareer(career))}
          </div>

      `
      : '';


  const cards = lists
    .map((list, index) =>
      createListCard(
        list,
        `${globalIndex}-${index}`
      )
    )
    .join('');


  return `
    ${careerTitle}

      ${cards}

    ${career ? '</div>' : ''}
  `;
}


/* =========================================================
   CREAR DÍA COMPLETO
   ========================================================= */

function createDaySection(day, lists, dayIndex) {

  /*
   Agrupamos por carrera utilizando una clave
   normalizada.
  */

  const careerGroups = new Map();

  lists.forEach((list) => {

    const originalCareer = getCareer(list);

    const careerKey =
      normalizeCareer(originalCareer);

    if (!careerGroups.has(careerKey)) {

      careerGroups.set(
        careerKey,
        {
          name: originalCareer,
          lists: []
        }
      );

    }

    careerGroups
      .get(careerKey)
      .lists
      .push(list);

  });


  /*
   Si no hay carrera, se muestran directamente.
  */

  const groups =
    Array.from(careerGroups.values());


  let content = '';


  groups.forEach((group, groupIndex) => {

    /*
     Ordenamos por año cuando existe.
    */

    group.lists.sort((a, b) => {

      const yearA = yearNumber(getYear(a));
      const yearB = yearNumber(getYear(b));

      return yearA - yearB;

    });


    content += createCareerSection(
      group.name,
      group.lists,
      `${dayIndex}-${groupIndex}`
    );

  });


  return `
    <section
      class="day-section"
      data-day-section="${escapeHtml(day)}"
    >

      <div class="day-header">

        <label class="day-selector">

          <input
            type="checkbox"
            data-day-checkbox
            value="${escapeHtml(day)}"
          >

          <span
            class="day-title"
          >
            ${escapeHtml(day.toUpperCase())}
          </span>

        </label>

      </div>

      ${content}

    </section>
  `;
}


/* =========================================================
   MOSTRAR TODAS LAS LISTAS
   ========================================================= */

function renderLists() {

  elements.container.setAttribute(
    'aria-busy',
    'false'
  );


  if (!state.lists.length) {

    elements.container.innerHTML =
      '<div class="empty-state">No hay listas configuradas.</div>';

    return;
  }


  /*
   Agrupamos primero por día.
  */

  const dayGroups = new Map();


  state.lists.forEach((list) => {

    const day = getDay(list);

    if (!dayGroups.has(day)) {
      dayGroups.set(day, []);
    }

    dayGroups
      .get(day)
      .push(list);

  });


  /*
   Ordenamos los días:
   Lunes
   Martes
   Miércoles
   Jueves
   Viernes
  */

  const orderedDays =
    Array.from(dayGroups.keys())
      .sort(sortDays);


  elements.container.innerHTML =
    orderedDays
      .map((day, index) =>
        createDaySection(
          day,
          dayGroups.get(day),
          index
        )
      )
      .join('');


  /*
   Eventos de las materias
  */

  document
    .querySelectorAll('input[data-list-checkbox]')
    .forEach((checkbox) => {

      checkbox.addEventListener(
        'change',
        () => {

          if (checkbox.checked) {

            state.selected.add(
              checkbox.value
            );

          } else {

            state.selected.delete(
              checkbox.value
            );

          }

          updateSelection();

        }
      );

    });


  /*
   Eventos de los días
  */

  document
    .querySelectorAll('input[data-day-checkbox]')
    .forEach((checkbox) => {

      checkbox.addEventListener(
        'change',
        () => {

          toggleDay(
            checkbox.value,
            checkbox.checked
          );

        }
      );

    });


  updateSelection();
}


/* =========================================================
   ESCAPAR HTML
   ========================================================= */

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


/* =========================================================
   ESTADO / PROGRESO
   ========================================================= */

function setStatus(
  message,
  progress,
  type = ''
) {

  elements.status.textContent =
    message;

  elements.progress.style.width =
    `${progress}%`;

  elements.statusIcon.className =
    `status-icon ${type}`;


  elements.statusIcon.textContent =
    type === 'error'
      ? '!'
      : type === 'success'
        ? '✓'
        : 'i';
}


/* =========================================================
   CARGAR LISTAS DESDE EL SERVIDOR
   ========================================================= */

async function loadLists() {

  try {

    const response =
      await fetch('/api/lists');


    const payload =
      await response.json();


    if (!response.ok) {

      throw new Error(
        payload.error ||
        'No se pudieron cargar las listas.'
      );

    }


    /*
     Nos aseguramos de que sea un array.
    */

    if (!Array.isArray(payload)) {

      throw new Error(
        'El servidor no devolvió una lista válida.'
      );

    }


    state.lists = payload;


    renderLists();


  } catch (error) {

    elements.container
      .setAttribute(
        'aria-busy',
        'false'
      );


    elements.container.innerHTML =
      `
        <div class="empty-state">
          ${escapeHtml(error.message)}
        </div>
      `;


    setStatus(
      'No se pudieron cargar las listas.',
      0,
      'error'
    );

  }
}


/* =========================================================
   COMBINAR PDFs
   ========================================================= */

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


  setStatus(
    'Descargando listas...',
    12
  );


  try {

    const selectedUrls =
      state.lists
        .filter(
          list =>
            state.selected.has(list.url)
        )
        .map(
          list => list.url
        );


    const response =
      await fetch(
        '/api/combine',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            urls: selectedUrls
          })
        }
      );


    if (!response.ok) {

      let payload = {};

      try {
        payload =
          await response.json();
      } catch {
        payload = {};
      }


      throw new Error(
        payload.error ||
        'No se pudo generar el PDF.'
      );

    }


    setStatus(
      `Procesando ${state.selected.size} ${
        state.selected.size === 1
          ? 'lista'
          : 'listas'
      }...`,
      65
    );


    const blob =
      await response.blob();


    if (state.pdfUrl) {

      URL.revokeObjectURL(
        state.pdfUrl
      );

    }


    state.pdfUrl =
      URL.createObjectURL(blob);


    setStatus(
      'PDF listo.',
      100,
      'success'
    );


    elements.detail.textContent =
      `Se combinaron ${
        state.selected.size
      } ${
        state.selected.size === 1
          ? 'lista'
          : 'listas'
      }.`;


    elements.result.hidden =
      false;


  } catch (error) {

    setStatus(
      error.message,
      0,
      'error'
    );


  } finally {

    elements.combine.disabled =
      false;

  }
}


/* =========================================================
   SELECCIONAR TODO
   ========================================================= */

const selectAllButton =
  document.querySelector(
    '#select-all'
  );


if (selectAllButton) {

  selectAllButton.addEventListener(
    'click',
    () => {

      state.lists.forEach(
        (list) => {
          state.selected.add(
            list.url
          );
        }
      );

      updateSelection();

    }
  );

}


/* =========================================================
   DESELECCIONAR TODO
   ========================================================= */

const deselectAllButton =
  document.querySelector(
    '#deselect-all'
  );


if (deselectAllButton) {

  deselectAllButton.addEventListener(
    'click',
    () => {

      state.selected.clear();

      state.selectedDays.clear();

      updateSelection();

    }
  );

}


/* =========================================================
   BOTÓN COMBINAR
   ========================================================= */

if (elements.combine) {

  elements.combine.addEventListener(
    'click',
    combinePdfs
  );

}


/* =========================================================
   ABRIR PDF
   ========================================================= */

if (elements.open) {

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

}


/* =========================================================
   IMPRIMIR PDF
   ========================================================= */

if (elements.print) {

  elements.print.addEventListener(
    'click',
    () => {

      if (state.pdfUrl) {

        const printWindow =
          window.open(
            state.pdfUrl,
            '_blank'
          );


        if (printWindow) {

          printWindow.onload =
            () => {
              printWindow.print();
            };

        }

      }

    }
  );

}


/* =========================================================
   INICIAR
   ========================================================= */

loadLists();
