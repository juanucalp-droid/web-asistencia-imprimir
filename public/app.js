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
   DATOS COMPLEMENTARIOS
   ========================================================= */

/*
  Para los datos que ya vienen con el código de carrera
  podemos determinar automáticamente la carrera y el año.

  LPLS / LPLIS  = Lic. en Sistemas
  LPLHS          = Lic. en Higiene y Seguridad
  LPIA           = Ingeniería Ambiental
*/

function getCareerFromName(name) {

  const text = String(name).toUpperCase();

  if (
    text.includes('LPLS') ||
    text.includes('LPLIS')
  ) {
    return 'LIC. EN SISTEMAS';
  }

  if (text.includes('LPLHS')) {
    return 'LIC. EN HIGIENE Y SEGURIDAD EN EL TRABAJO';
  }

  if (text.includes('LPIA')) {
    return 'INGENIERÍA AMBIENTAL';
  }

  return null;
}


function getYearFromName(name) {

  const match = String(name).match(
    /-(\d+)(?:-[A-Z]+)?(?:-\d{4})?$/
  );

  if (match) {
    return `${match[1]}° AÑO`;
  }

  return null;
}


/*
  Materias de MIÉRCOLES que no tenían código de carrera
  en la información original.
*/

const wednesdayData = {

  'Análisis Matemático': {
    career: 'LIC. EN SISTEMAS',
    year: '1° AÑO'
  },

  'Lenguajes': {
    career: 'LIC. EN SISTEMAS',
    year: '2° AÑO'
  },

  'Ingeniería de Software II': {
    career: 'LIC. EN SISTEMAS',
    year: '4° AÑO'
  },

  'Programación Concurrente': {
    career: 'LIC. EN SISTEMAS',
    year: '3° AÑO'
  },

  'Higiene I': {
    career: 'LIC. EN HIGIENE Y SEGURIDAD EN EL TRABAJO',
    year: '1° AÑO'
  },

  'Física I': {
    career: 'LIC. EN HIGIENE Y SEGURIDAD EN EL TRABAJO',
    year: '2° AÑO'
  },

  'Higiene III': {
    career: 'LIC. EN HIGIENE Y SEGURIDAD EN EL TRABAJO',
    year: '3° AÑO'
  },

  'Seguridad III': {
    career: 'LIC. EN HIGIENE Y SEGURIDAD EN EL TRABAJO',
    year: '3° AÑO'
  },

  'Economía, Costos y Presupuestos': {
    career: 'LIC. EN HIGIENE Y SEGURIDAD EN EL TRABAJO',
    year: '4° AÑO'
  },

  'Seminario: Sistemas Integrados de Gestión': {
    career: 'LIC. EN HIGIENE Y SEGURIDAD EN EL TRABAJO',
    year: '4° AÑO'
  },

  'Matemática A1': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '1° AÑO'
  },

  'Geología II': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '2° AÑO'
  },

  'Química Física': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '2° AÑO'
  },

  'Inglés II': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '2° AÑO'
  },

  'Procesos Físico Químicos en IA': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '3° AÑO'
  },

  'Evaluación del Impacto Ambiental': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '5° AÑO'
  }
};


/* =========================================================
   DATOS DE JUEVES
   ========================================================= */

const thursdayData = {

  'Filosofía I': {
    career: 'LIC. EN SISTEMAS',
    year: '1° AÑO'
  },

  'Inglés I': {
    career: 'LIC. EN SISTEMAS',
    year: '1° AÑO'
  },

  'Teología I': {
    career: 'LIC. EN SISTEMAS',
    year: '2° AÑO'
  },

  'Base de Datos II': {
    career: 'LIC. EN SISTEMAS',
    year: '2° AÑO'
  },

  'Programación Concurrente': {
    career: 'LIC. EN SISTEMAS',
    year: '3° AÑO'
  },

  'Calidad de Software': {
    career: 'LIC. EN SISTEMAS',
    year: '4° AÑO'
  },

  'Gestión de RRHH': {
    career: 'LIC. EN SISTEMAS',
    year: '4° AÑO'
  },

  'Anatomía y Fisiología del Trabajo': {
    career: 'LIC. EN HIGIENE Y SEGURIDAD EN EL TRABAJO',
    year: '1° AÑO'
  },

  'Educ. Seguridad y Cap. del Personal': {
    career: 'LIC. EN HIGIENE Y SEGURIDAD EN EL TRABAJO',
    year: '1° AÑO'
  },

  'Higiene II': {
    career: 'LIC. EN HIGIENE Y SEGURIDAD EN EL TRABAJO',
    year: '2° AÑO'
  },

  'Seminario de Inst. contra Incendios y Brigadas': {
    career: 'LIC. EN HIGIENE Y SEGURIDAD EN EL TRABAJO',
    year: '4° AÑO'
  },

  'Química inorgánica': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '1° AÑO'
  },

  'Probabilidades y estadísticas': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '2° AÑO'
  },

  'Filosofía I - LPIA-2-N': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '2° AÑO'
  },

  'Biología I': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '3° AÑO'
  },

  'Clima. Tec. Aplicadas al Medio Gaseoso': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '4° AÑO'
  },

  'Residuos sólidos y tec. aplicadas para su tratamiento': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '5° AÑO'
  },

  'Taller de integración II': {
    career: 'INGENIERÍA AMBIENTAL',
    year: '5° AÑO'
  }
};


/* =========================================================
   NORMALIZACIÓN
   ========================================================= */

function normalizeList(list) {

  const name = String(list.name || '').trim();
  const day = String(list.day || '').trim();

  let career = list.career || null;
  let year = list.year || null;

  /*
    Primero intentamos utilizar los datos enviados
    por el servidor.
  */

  if (!career) {
    career = getCareerFromName(name);
  }

  if (!year) {
    year = getYearFromName(name);
  }

  /*
    Miércoles
  */

  if (
    day.toLowerCase() === 'miércoles' &&
    wednesdayData[name]
  ) {

    career = wednesdayData[name].career;
    year = wednesdayData[name].year;
  }


  /*
    Jueves
  */

  if (
    day.toLowerCase() === 'jueves' &&
    thursdayData[name]
  ) {

    career = thursdayData[name].career;
    year = thursdayData[name].year;
  }


  /*
    Casos donde el nombre de la materia contiene
    código después del nombre.
  */

  if (!career) {
    career = 'OTRAS CÁTEDRAS';
  }

  if (!year) {
    year = 'AÑO NO INDICADO';
  }

  return {
    ...list,
    name,
    day,
    career,
    year
  };
}


/* =========================================================
   SELECCIÓN
   ========================================================= */

function updateSelection() {

  elements.count.textContent = state.selected.size;

  const label = elements.count.nextElementSibling;

  if (label) {

    label.textContent =
      state.selected.size === 1
        ? 'lista seleccionada'
        : 'listas seleccionadas';
  }


  document
    .querySelectorAll('.list-checkbox')
    .forEach((checkbox) => {

      checkbox.checked =
        state.selected.has(checkbox.value);
    });


  /*
    Actualizar checkbox de cada día
  */

  document
    .querySelectorAll('.day-checkbox')
    .forEach((dayCheckbox) => {

      const day = dayCheckbox.dataset.day;

      const dayLists =
        state.lists.filter(
          list => list.day === day
        );

      const selectedCount =
        dayLists.filter(
          list => state.selected.has(list.url)
        ).length;

      dayCheckbox.checked =
        dayLists.length > 0 &&
        selectedCount === dayLists.length;

      dayCheckbox.indeterminate =
        selectedCount > 0 &&
        selectedCount < dayLists.length;
    });
}


/* =========================================================
   SELECCIONAR / DESELECCIONAR DÍA
   ========================================================= */

function toggleDay(day, checked) {

  const dayLists =
    state.lists.filter(
      list => list.day === day
    );

  dayLists.forEach((list) => {

    if (checked) {
      state.selected.add(list.url);
    } else {
      state.selected.delete(list.url);
    }
  });

  updateSelection();
}


/* =========================================================
   RENDERIZAR
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
    Agrupar primero por día
  */

  const days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes'
  ];


  let html = '';


  days.forEach((day) => {

    const dayLists =
      state.lists.filter(
        list => list.day === day
      );


    if (!dayLists.length) {
      return;
    }


    /*
      Cabecera del día
    */

    html += `

      <section class="day-section">

        <div class="day-header">

          <label class="day-title">

            <input
              type="checkbox"
              class="day-checkbox"
              data-day="${escapeHtml(day)}"
            >

            <span>${escapeHtml(day.toUpperCase())}</span>

          </label>

        </div>

    `;


    /*
      Agrupar por carrera
    */

    const careers = [];

    dayLists.forEach((list) => {

      if (!careers.includes(list.career)) {
        careers.push(list.career);
      }

    });


    careers.forEach((career) => {

      const careerLists =
        dayLists.filter(
          list => list.career === career
        );


      html += `

        <div class="career-section">

          <div class="career-title">
            ${escapeHtml(career)}
          </div>

      `;


      careerLists.forEach((list, index) => {

        const globalIndex =
          state.lists.indexOf(list);


        html += `

          <article class="list-card">

            <input
              type="checkbox"
              class="list-checkbox"
              id="list-${globalIndex}"
              value="${escapeHtml(list.url)}"
              aria-label="Seleccionar ${escapeHtml(list.name)}"
            >

            <label
              class="list-info"
              for="list-${globalIndex}"
            >

              <span class="list-name">
                ${escapeHtml(cleanSubjectName(list.name))}
              </span>

              <span class="list-year">
                ${escapeHtml(list.year)}
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


  elements.container.innerHTML = html;


  /*
    Eventos de las cátedras
  */

  document
    .querySelectorAll('.list-checkbox')
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
    .querySelectorAll('.day-checkbox')
    .forEach((checkbox) => {

      checkbox.addEventListener(
        'change',
        () => {

          toggleDay(
            checkbox.dataset.day,
            checkbox.checked
          );
        }
      );
    });


  updateSelection();
}


/* =========================================================
   LIMPIAR NOMBRE
   ========================================================= */

function cleanSubjectName(name) {

  return String(name)
    .replace(/-LPLIS-\d+P?/i, '')
    .replace(/-LPLS-\d+(?:-P|-SP)?/i, '')
    .replace(/-LPLHS-\d+-[A-Z]+/i, '')
    .replace(/-LPIA-\d+(?:-[A-Z]+)?/i, '')
    .replace(/-2026$/i, '')
    .trim();
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


    /*
      Normalizamos todos los registros.
    */

    state.lists =
      payload.map(normalizeList);


    renderLists();


  } catch (error) {

    elements.container.setAttribute(
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
              .filter(
                list =>
                  state.selected.has(
                    list.url
                  )
              )
              .map(
                list => list.url
              )

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
      `Se combinaron ${
        state.selected.size
      } ${
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
   SELECCIONAR TODO
   ========================================================= */

const selectAll =
  document.querySelector(
    '#select-all'
  );


if (selectAll) {

  selectAll.addEventListener(
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

const deselectAll =
  document.querySelector(
    '#deselect-all'
  );


if (deselectAll) {

  deselectAll.addEventListener(
    'click',
    () => {

      state.selected.clear();

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
            '_blank',
            'noopener'
          );

        if (printWindow) {

          printWindow.onload = () => {
            printWindow.print();
          };
        }
      }
    }
  );
}


/* =========================================================
   INICIO
   ========================================================= */

loadLists();
