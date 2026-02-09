/**
 * Calendar URL state persistence.
 * Saves and restores calendar view settings to/from URL parameters.
 */

import { SAVED_FILTER_COUNT } from '../constants';

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
    const input = document.querySelector('#fit-width-toggle input') as HTMLInputElement;
    if (input) {
      const wantFitWidth = params.get('fit-width') === '1';
      input.checked = wantFitWidth;
      document.body.classList.toggle('natural-width', !wantFitWidth);
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

  // --- Tile display toggles (set data-state + body classes) ---

  ['image', 'year-director', 'runtime', 'actors'].forEach(key => {
    const id = key === 'year-director' ? 'show-year-director' : `show-${key}`;
    const toggle = document.getElementById(id) as HTMLButtonElement;
    const className = key === 'year-director' ? 'year-director' : key;
    if (params.has(key)) {
      const wantPressed = params.get(key) === '1';
      if (toggle) setToggleState(toggle, wantPressed);
      document.body.classList.toggle(`show-${className}`, wantPressed);
    } else if (toggle) {
      document.body.classList.toggle(`show-${className}`, isTogglePressed(toggle));
    }
  });

  // --- Radio groups (set .checked on the target radio) ---

  if (params.has('hours')) {
    const radio = document.querySelector(`input[name="hours-filter-mode"][value="${params.get('hours')}"]`) as HTMLInputElement;
    if (radio) radio.checked = true;
  }

  if (params.has('single')) {
    const radio = document.querySelector(`input[name="single-showtimes-mode"][value="${params.get('single')}"]`) as HTMLInputElement;
    if (radio) radio.checked = true;
  }

  // --- Saved filter checkboxes ---

  if (params.has('saved')) {
    const savedValues = new Set(params.get('saved')!.split(','));
    document.querySelectorAll<HTMLInputElement>('input[name="saved-filter"]').forEach(cb => {
      cb.checked = savedValues.has(cb.value);
    });
  }
}
