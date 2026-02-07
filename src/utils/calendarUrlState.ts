/**
 * Calendar URL state persistence.
 * Saves and restores calendar view settings to/from URL parameters.
 */

/** Read whether a toggle button is pressed. */
export function isTogglePressed(el: HTMLElement | null): boolean {
  return el?.getAttribute('data-state') === 'on';
}

/** Set a toggle button's pressed state. */
export function setToggleState(el: HTMLElement | null, pressed: boolean): void {
  if (!el) return;
  el.setAttribute('data-state', pressed ? 'on' : 'off');
  el.setAttribute('aria-pressed', String(pressed));
}

/** Get the inner <input> element from a Switch/Toggle component. */
export function getToggleInput(el: HTMLElement | null): HTMLInputElement | null {
  if (!el) return null;
  return el.tagName === 'INPUT' ? el as HTMLInputElement : el.querySelector('input');
}

/** Save current UI state to URL parameters. */
export function updateUrlParams(): void {
  const params = new URLSearchParams();

  const timelineInput = getToggleInput(document.getElementById('timeline-mode-toggle'));
  if (timelineInput) params.set('timeline', timelineInput.checked ? '1' : '0');

  const fitWidthInput = getToggleInput(document.getElementById('fit-width-toggle'));
  if (fitWidthInput) params.set('fit-width', fitWidthInput.checked ? '1' : '0');

  const weekStartInput = getToggleInput(document.getElementById('week-start-toggle'));
  if (weekStartInput) params.set('week-start', weekStartInput.checked ? '1' : '0');

  if (isTogglePressed(document.getElementById('show-image'))) params.set('image', '1');
  if (isTogglePressed(document.getElementById('show-year-director'))) params.set('year-director', '1');
  if (isTogglePressed(document.getElementById('show-runtime'))) params.set('runtime', '1');
  if (isTogglePressed(document.getElementById('show-actors'))) params.set('actors', '1');

  const hoursFilter = document.querySelector('input[name="hours-filter-mode"]:checked') as HTMLInputElement;
  if (hoursFilter?.value && hoursFilter.value !== 'none') params.set('hours', hoursFilter.value);

  const singleFilter = document.querySelector('input[name="single-showtimes-mode"]:checked') as HTMLInputElement;
  if (singleFilter?.value && singleFilter.value !== 'none') params.set('single', singleFilter.value);

  const newUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
  history.replaceState(null, '', newUrl);
}

/** Restore UI state from URL parameters. */
export function restoreFromUrl(): void {
  const params = new URLSearchParams(window.location.search);

  if (params.has('timeline')) {
    const timelineToggle = document.querySelector('#timeline-mode-toggle input') as HTMLInputElement;
    const wantTimeline = params.get('timeline') === '1';
    if (timelineToggle && timelineToggle.checked !== wantTimeline) timelineToggle.click();
  }

  if (params.has('fit-width')) {
    const fitWidthToggle = document.querySelector('#fit-width-toggle input') as HTMLInputElement;
    const wantFitWidth = params.get('fit-width') === '1';
    if (fitWidthToggle && fitWidthToggle.checked !== wantFitWidth) fitWidthToggle.click();
  }

  if (params.has('week-start')) {
    const weekStartToggle = document.querySelector('#week-start-toggle input') as HTMLInputElement;
    const wantWeekStart = params.get('week-start') === '1';
    if (weekStartToggle && weekStartToggle.checked !== wantWeekStart) weekStartToggle.click();
  }

  ['image', 'year-director', 'runtime', 'actors'].forEach(key => {
    const id = key === 'year-director' ? 'show-year-director' : `show-${key}`;
    const toggle = document.getElementById(id) as HTMLButtonElement;
    if (params.has(key)) {
      const wantPressed = params.get(key) === '1';
      if (toggle && isTogglePressed(toggle) !== wantPressed) toggle.click();
    } else if (toggle) {
      const className = key === 'year-director' ? 'year-director' : key;
      document.body.classList.toggle(`show-${className}`, isTogglePressed(toggle));
    }
  });

  if (params.has('hours')) {
    const hoursValue = params.get('hours');
    const radio = document.querySelector(`input[name="hours-filter-mode"][value="${hoursValue}"]`) as HTMLInputElement;
    if (radio) radio.click();
  }

  if (params.has('single')) {
    const singleValue = params.get('single');
    const radio = document.querySelector(`input[name="single-showtimes-mode"][value="${singleValue}"]`) as HTMLInputElement;
    if (radio) radio.click();
  }
}
