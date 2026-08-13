const state = {
  lists: [],
  selected: new Set(),
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
   CARRERAS
========================================================= */

function getCareer(code) {

  if (code.startsWith('LPLIS')) {
    return 'Lic. en Sistemas';
  }

  if (code.startsWith('LPLS')) {
    return 'Lic. en Sistemas';
  }

  if (code.startsWith('LPLHS')) {
    return 'Lic. en Higiene y Seguridad en el Trabajo';
  }

  if (code.startsWith('LPIA')) {
    return 'Ingeniería Ambiental';
  }

  return '';
}


/* =========================================================
   OBTENER INFORMACIÓN DE LA CÁTEDRA
========================================================= */

function getAcademicInfo(list) {

  /*
   * Primero intentamos obtener la información desde
   * career/year si existe en el JSON.
   */

  if (list.career || list.year) {

    return {
      career: list.career || '',
      year: list.year || ''
    };
  }


  /*
   * Intentamos obtener el código desde el nombre.
   *
   * Ejemplo:
   * Matemática I-LPLHS-1-N-2026
   *
   * El primer número después del código de carrera
   * corresponde al año de cursada.
   */

  const name = list.name || '';

  const match = name.match(
    /-(LPLIS|LPLS|LPLHS|LPIA)-(\d)/
  );

  if (match) {

    const code = match[1];
    const yearNumber = match[2];

    return {
      career: getCareer(code),
      year: `${yearNumber}.º año`
    };
  }


  /*
   * Materias del miércoles y otras que no tienen
   * el código dentro del nombre.
   *
   * Estas se pueden completar manualmente.
   */

  const manual = {

    /* =========================
       MIÉRCOLES
    ========================= */

    'Análisis Matemático': {
      career: 'Lic. en Sistemas',
      year: '1.º año'
    },

    'Lenguajes': {
      career: 'Lic. en Sistemas',
      year: '2.º año'
    },

    'Ingeniería de Software II': {
      career: 'Lic. en Sistemas',
      year: '4.º año'
    },

    'Programación Concurrente': {
      career: 'Lic. en Sistemas',
      year: '3.º año'
    },

    'Higiene I': {
      career: 'Lic. en Higiene y Seguridad en el Trabajo',
      year: '1.º año'
    },

    'Química Física': {
      career: 'Ingeniería Ambiental',
      year: '3.º año'
    },

    'Física I': {
      career: 'Lic. en Higiene y Seguridad en el Trabajo',
      year: '2.º año'
    },

    'Higiene III': {
      career: 'Lic. en Higiene y Seguridad en el Trabajo',
      year: '3.º año'
    },

    'Seguridad III': {
      career: 'Lic. en Higiene y Seguridad en el Trabajo',
      year: '3.º año'
    },

    'Economía, Costos y Presupuestos': {
      career: 'Lic. en Higiene y Seguridad en el Trabajo',
      year: '4.º año'
    },

    'Seminario: Sistemas Integrados de Gestión': {
      career: 'Lic. en Higiene y Seguridad en el Trabajo',
      year: '4.º año'
    },

    'Matemática A1': {
      career: 'Ingeniería Ambiental',
      year: '1.º año'
    },

    'Geología II': {
      career: 'Ingeniería Ambiental',
      year: '2.º año'
    },

    'Inglés II': {
      career: 'Ingeniería Ambiental',
      year: '3.º año'
    },

    'Procesos Físico Químicos en IA': {
      career: 'Ingeniería Ambiental',
      year: '3.º año'
    },

    'Evaluación del Impacto Ambiental': {
      career: 'Ingeniería Ambiental',
      year: '5.º año'
    }
  };


  /*
   * JUEVES
   */

  const jueves = {

    'Filosofía I': {
      career: 'Lic. en Sistemas',
      year: '1.º año'
    },

    'Inglés I': {
      career: 'Lic. en Sistemas',
      year: '1.º año'
    },

    'Teología I': {
      career: 'Lic. en Sistemas',
      year: '2.º año'
    },

    'Base de Datos II': {
      career: 'Lic. en Sistemas',
      year: '2.º año'
    },

    'Programación Concurrente': {
      career: 'Lic. en Sistemas',
      year: '3.º año'
    },

    'Calidad de Software': {
      career: 'Lic. en Sistemas',
      year: '4.º año'
    },

    'Gestión de RRHH': {
      career: 'Lic. en Sistemas',
      year: '4.º año'
    },

    'Anatomía y Fisiología del Trabajo': {
      career: 'Lic. en Higiene y Seguridad en el Trabajo',
      year: '1.º año'
    },

    'Educación para la Seguridad y Capacitación del Personal': {
      career: 'Lic. en Higiene y Seguridad en el Trabajo',
      year: '1.º año'
    },

    'Higiene II': {
      career: 'Lic. en Higiene y Seguridad en el Trabajo',
      year: '2.º año'
    },

    'Seminario de Inst. contra Incendios y Brigadas': {
      career: 'Lic. en Higiene y Seguridad en el Trabajo',
      year: '4.º año'
    },

    'Química inorgánica': {
      career: 'Ingeniería Ambiental',
      year: '1.º año'
    },

    'Probabilidades y estadísticas': {
      career: 'Ingeniería Ambiental',
      year: '2.º año'
    },

    'Filosofía I': {
      career: 'Ingeniería Ambiental',
      year: '2.º año'
    },

    'Biología I': {
      career: 'Ingeniería Ambiental',
      year: '3.º año'
    },

    'Clima. Tec. Aplicadas al Medio Gaseoso': {
      career: 'Ingeniería Ambiental',
      year: '4.º año'
    },

    'Residuos sólidos y tec. aplicadas para su tratamiento': {
      career: 'Ingeniería Ambiental',
      year: '5.º año'
    },

    'Taller de integración II': {
      career: 'Ingeniería Ambiental',
      year: '5.º año'
    }
  };


  if (list.day === 'Jueves' && jueves[name]) {
    return jueves[name];
  }

  if (manual[name]) {
    return manual[name];
  }


  return {
    career: 'Sin especificar',
    year: ''
  };
}


/* =========================================================
   SELECCIÓN
========================================================= */

function updateSelection() {

  elements.count.textContent = state.selected.size;

  elements.count.nextElementSibling.textContent =
    state.selected.size === 1
      ? 'lista seleccionada'
      : 'listas seleccionadas';

  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach((checkbox) => {

      checkbox.checked =
        state.selected.has(checkbox.value);

    });
}


/* =========================================================
   RENDERIZAR LISTAS
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
   * Orden de los días
   */

  const dayOrder = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes'
  ];


  /*
   * Agrupamos por día
   */

  const days = {};

  state.lists.forEach((list) => {

    if (!days[list.day]) {
      days[list.day] = [];
    }

    days[list.day].push(list);

  });


  let html = '';
  let globalIndex = 0;


  dayOrder.forEach((day) => {

    if (!days[day] || !days[day].length) {
      return;
    }


    html += `
      <section class="day-section">

        <h2 class="day-title">
          ${escapeHtml(day)}
        </h2>
    `;


    /*
     * Agrupar por carrera
     */

    const careers = {};


    days[day].forEach((list) => {

      const info = getAcademicInfo(list);

      const career =
        info.career || 'Sin especificar';


      if (!careers[career]) {
        careers[career] = [];
      }


      careers[career].push({
        ...list,
        academic: info
      });

    });


    Object.keys(careers).forEach((career) => {

      html += `
        <div class="career-section">

          <h3 class="career-title">
            ${escapeHtml(career)}
          </h3>
      `;


      careers[career].forEach((list) => {

        const index = globalIndex++;

        const year =
          list.academic.year || '';


        html += `
          <article class="list-card">

            <input
              type="checkbox"
              id="list-${index}"
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

              <span class="list-meta">
                ${escapeHtml(year)}
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
        `;

      });


      html += `
        </div>
      `;

    });


    html += `
      </section>
    `;

  });


  /*
   * Por si aparece algún día no contemplado
   */

  Object.keys(days)
    .filter((day) => !dayOrder.includes(day))
    .forEach((day) => {

      html += `
        <section class="day-section">

          <h2 class="day-title">
            ${escapeHtml(day)}
          </h2>
      `;

      days[day].forEach((list) => {

        const index = globalIndex++;

        const info =
          getAcademicInfo(list);


        html += `
          <article class="list-card">

            <input
              type="checkbox"
              id="list-${index}"
              value="${escapeHtml(list.url)}"
            >

            <label
              class="list-info"
              for="list-${index}"
            >

              <span class="list-name">
                ${escapeHtml(list.name)}
              </span>

              <span class="list-meta">
                ${escapeHtml(info.year)}
                ·
                ${escapeHtml(info.career)}
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
        `;

      });

      html += `
        </section>
      `;

    });


  elements.container.innerHTML = html;


  /*
   * Eventos de selección
   */

  document
    .querySelectorAll('input[type="checkbox"]')
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
   ESTADO
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
   CARGAR LISTAS
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


    state.lists = payload;

    renderLists();


  } catch (error) {

    elements.container
      .setAttribute(
        'aria-busy',
        'false'
      );


    elements.container.innerHTML =
      `<div class="empty-state">
        ${escapeHtml(error.message)}
      </div>`;


    setStatus(
      'No se pudieron cargar las listas.',
      0,
      'error'
    );

  }
}


/* =========================================================
   COMBINAR PDF
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

            urls: state.lists
              .filter((list) =>
                state.selected.has(
                  list.url
                )
              )
              .map((list) =>
                list.url
              )

          })

        }
      );


    if (!response.ok) {

      const payload =
        await response.json();


      throw new Error(
        payload.error ||
        'No se pudo generar el PDF.'
      );

    }


    setStatus(
      `Procesando ${state.selected.size} lista${
        state.selected.size === 1
          ? ''
          : 's'
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
      `Se combinaron ${state.selected.size} ${
        state.selected.size === 1
          ? 'lista'
          : 'listas'
      }.`;

    elements.result.hidden = false;


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
   SELECCIONAR TODAS
========================================================= */

document
  .querySelector('#select-all')
  .addEventListener(
    'click',
    () => {

      state.lists.forEach((list) => {

        state.selected.add(
          list.url
        );

      });

      updateSelection();

    }
  );


/* =========================================================
   DESELECCIONAR TODAS
========================================================= */

document
  .querySelector('#deselect-all')
  .addEventListener(
    'click',
    () => {

      state.selected.clear();

      updateSelection();

    }
  );


/* =========================================================
   BOTÓN COMBINAR
========================================================= */

elements.combine.addEventListener(
  'click',
  combinePdfs
);


/* =========================================================
   ABRIR PDF
========================================================= */

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


/* =========================================================
   IMPRIMIR PDF
========================================================= */

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


/* =========================================================
   INICIAR
========================================================= */

loadLists();
