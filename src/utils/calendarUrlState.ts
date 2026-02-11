/**
 * Calendar URL state persistence.
 * Saves and restores calendar view settings to/from URL parameters.
 */

import { SAVED_FILTER_COUNT, HOURS_FILTER_MODE, SINGLE_SHOWTIMES_MODE } from '../constants';

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

  const fitWidthSwitch = document.querySelector('#fit-width-switch input') as HTMLInputElement;
  if (fitWidthSwitch) params.set('fit-width', fitWidthSwitch.checked ? '1' : '0');

  const weekStartInput = getToggleInput(document.getElementById('week-start-toggle'));
  if (weekStartInput) params.set('week-start', weekStartInput.checked ? '1' : '0');

  const showImageCheckbox = document.getElementById('show-image-checkbox') as HTMLInputElement;
  const showYearDirectorCheckbox = document.getElementById('show-year-director-checkbox') as HTMLInputElement;
  const showRuntimeCheckbox = document.getElementById('show-runtime-checkbox') as HTMLInputElement;
  const showActorsCheckbox = document.getElementById('show-actors-checkbox') as HTMLInputElement;

  if (showImageCheckbox?.checked) params.set('image', '1');
  if (showYearDirectorCheckbox?.checked) params.set('year-director', '1');
  if (showRuntimeCheckbox?.checked) params.set('runtime', '1');
  if (showActorsCheckbox?.checked) params.set('actors', '1');

  const hoursFilter = document.getElementById('hours-filter-select') as HTMLSelectElement;
  if (hoursFilter?.value && hoursFilter.value !== 'none') params.set('hours', hoursFilter.value);

  const singleFilter = document.querySelector('input[name="single-showtimes-mode"]:checked') as HTMLInputElement;
  if (singleFilter?.value && singleFilter.value !== 'none') params.set('single', singleFilter.value);

  const highlightUniqueToggle = document.querySelector('#highlight-unique-toggle input') as HTMLInputElement;
  if (highlightUniqueToggle) params.set('highlight-unique', highlightUniqueToggle.checked ? '1' : '0');

  // Saved filter: encode checked values as comma-separated string
  const savedChecked = document.querySelectorAll<HTMLInputElement>('input[name="saved-filter"]:checked');
  const savedValues = Array.from(savedChecked).map(cb => cb.value);
  // Only persist if not all are checked (all checked = default/no filter)
  if (savedValues.length > 0 && savedValues.length < SAVED_FILTER_COUNT) {
    params.set('saved', savedValues.join(','));
  }

  const newUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname;
  history.replaceState(null, '', newUrl);
}

/**
 * Restore UI state from URL parameters.
 * Sets all control states silently (no events dispatched) so the caller
 * can do a single render pass afterward instead of one per control.
 */
export function restoreFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  if (params.size === 0) return;

  // --- Switches (set .checked directly) ---

  if (params.has('timeline')) {
    const input = document.querySelector('#timeline-mode-toggle input') as HTMLInputElement;
    if (input) input.checked = params.get('timeline') === '1';
  }

  if (params.has('fit-width')) {
    const switchInput = document.querySelector('#fit-width-switch input') as HTMLInputElement;
    if (switchInput) {
      const wantFitWidth = params.get('fit-width') === '1';
      switchInput.checked = wantFitWidth;
      document.body.classList.toggle('minimum-width', !wantFitWidth);
    }
  }

  if (params.has('week-start')) {
    const input = document.querySelector('#week-start-toggle input') as HTMLInputElement;
    if (input) {
      const wantMonday = params.get('week-start') === '1';
      input.checked = wantMonday;
      document.body.classList.toggle('monday-start', wantMonday);
      document.body.classList.toggle('sunday-start', !wantMonday);
    }
  }

  // --- Tile display checkboxes (set .checked + body classes) ---

  ['image', 'year-director', 'runtime', 'actors'].forEach(key => {
    const id = key === 'year-director' ? 'show-year-director-checkbox' : `show-${key}-checkbox`;
    const checkbox = document.getElementById(id) as HTMLInputElement;
    const className = key === 'year-director' ? 'year-director' : key;
    if (params.has(key)) {
      const wantChecked = params.get(key) === '1';
      if (checkbox) checkbox.checked = wantChecked;
      document.body.classList.toggle(`show-${className}`, wantChecked);

      // Always enable scrim and blur when images are shown
      if (key === 'image') {
        document.body.classList.toggle('scrim-enabled', wantChecked);
        document.body.classList.toggle('blur-enabled', wantChecked);
      }
    } else if (checkbox) {
      const isChecked = checkbox.checked;
      document.body.classList.toggle(`show-${className}`, isChecked);

      // Always enable scrim and blur when images are shown
      if (key === 'image') {
        document.body.classList.toggle('scrim-enabled', isChecked);
        document.body.classList.toggle('blur-enabled', isChecked);
      }
    }
  });

  // --- Select dropdowns and radio groups ---
  // Values are validated against known constants before interpolation.

  const hoursValues = new Set(Object.values(HOURS_FILTER_MODE));
  const hoursValue = params.get('hours');
  if (hoursValue && hoursValues.has(hoursValue as any)) {
    const select = document.getElementById('hours-filter-select') as HTMLSelectElement;
    if (select) select.value = hoursValue;
  }

  const singleValues = new Set(Object.values(SINGLE_SHOWTIMES_MODE));
  const singleValue = params.get('single');
  if (singleValue && singleValues.has(singleValue as any)) {
    const radio = document.querySelector(`input[name="single-showtimes-mode"][value="${singleValue}"]`) as HTMLInputElement;
    if (radio) radio.checked = true;
  }

  // --- Saved filter checkboxes ---

  if (params.has('saved')) {
    const savedValues = new Set(params.get('saved')!.split(','));
    document.querySelectorAll<HTMLInputElement>('input[name="saved-filter"]').forEach(cb => {
      cb.checked = savedValues.has(cb.value);
    });
  }

  // --- Highlight unique toggle ---

  if (params.has('highlight-unique')) {
    const highlightUnique = document.querySelector('#highlight-unique-toggle input') as HTMLInputElement;
    if (highlightUnique) {
      highlightUnique.checked = params.get('highlight-unique') === '1';
    }
  }
}
