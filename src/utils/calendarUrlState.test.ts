// @vitest-environment jsdom
/**
 * Test suite for calendar URL state utilities.
 * Tests pure helpers and DOM-based serialize/deserialize functions.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isTogglePressed,
  setToggleState,
  getToggleInput,
  updateUrlParams,
  restoreFromUrl,
} from './calendarUrlState';

// --- isTogglePressed ---

describe('isTogglePressed', () => {
  it('should return true when data-state is "on"', () => {
    const el = document.createElement('button');
    el.setAttribute('data-state', 'on');
    expect(isTogglePressed(el)).toBe(true);
  });

  it('should return false when data-state is "off"', () => {
    const el = document.createElement('button');
    el.setAttribute('data-state', 'off');
    expect(isTogglePressed(el)).toBe(false);
  });

  it('should return false when data-state is missing', () => {
    const el = document.createElement('button');
    expect(isTogglePressed(el)).toBe(false);
  });

  it('should return false for null element', () => {
    expect(isTogglePressed(null)).toBe(false);
  });
});

// --- setToggleState ---

describe('setToggleState', () => {
  it('should set data-state to "on" and aria-pressed to "true"', () => {
    const el = document.createElement('button');
    setToggleState(el, true);
    expect(el.getAttribute('data-state')).toBe('on');
    expect(el.getAttribute('aria-pressed')).toBe('true');
  });

  it('should set data-state to "off" and aria-pressed to "false"', () => {
    const el = document.createElement('button');
    setToggleState(el, false);
    expect(el.getAttribute('data-state')).toBe('off');
    expect(el.getAttribute('aria-pressed')).toBe('false');
  });

  it('should do nothing for null element', () => {
    // Should not throw
    setToggleState(null, true);
  });
});

// --- getToggleInput ---

describe('getToggleInput', () => {
  it('should return the element itself if it is an INPUT', () => {
    const input = document.createElement('input');
    const result = getToggleInput(input);
    expect(result).toBe(input);
  });

  it('should find a nested input element', () => {
    const wrapper = document.createElement('div');
    const input = document.createElement('input');
    wrapper.appendChild(input);
    const result = getToggleInput(wrapper);
    expect(result).toBe(input);
  });

  it('should return null when no input exists', () => {
    const wrapper = document.createElement('div');
    const result = getToggleInput(wrapper);
    expect(result).toBeNull();
  });

  it('should return null for null element', () => {
    expect(getToggleInput(null)).toBeNull();
  });
});

// --- updateUrlParams ---

describe('updateUrlParams', () => {
  /** Create a toggle wrapper with an inner checkbox input. */
  function createToggle(id: string, checked: boolean): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.id = id;
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    wrapper.appendChild(input);
    document.body.appendChild(wrapper);
    return wrapper;
  }

  /** Create a named checkbox (for time-filter / saved-filter groups). */
  function createNamedCheckbox(name: string, value: string, checked: boolean): HTMLInputElement {
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = name;
    cb.value = value;
    cb.checked = checked;
    document.body.appendChild(cb);
    return cb;
  }

  afterEach(() => {
    document.body.innerHTML = '';
    window.history.replaceState(null, '', '/');
  });

  it('should write timeline=0 when timeline toggle is unchecked', () => {
    createToggle('timeline-mode-toggle', false);
    updateUrlParams();
    expect(window.location.search).toContain('timeline=0');
  });

  it('should write timeline=1 when timeline toggle is checked', () => {
    createToggle('timeline-mode-toggle', true);
    updateUrlParams();
    expect(window.location.search).toContain('timeline=1');
  });

  it('should write week-start param', () => {
    createToggle('week-start-toggle', true);
    updateUrlParams();
    expect(window.location.search).toContain('week-start=1');
  });

  it('should write image=1 when image checkbox is checked', () => {
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = 'show-image-checkbox';
    cb.checked = true;
    document.body.appendChild(cb);
    updateUrlParams();
    expect(window.location.search).toContain('image=1');
  });

  it('should omit image param when unchecked', () => {
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = 'show-image-checkbox';
    cb.checked = false;
    document.body.appendChild(cb);
    updateUrlParams();
    expect(window.location.search).not.toContain('image=');
  });

  it('should encode partial time filters as comma-separated', () => {
    createNamedCheckbox('time-filter', 'weekdays', true);
    createNamedCheckbox('time-filter', 'weeknights', true);
    createNamedCheckbox('time-filter', 'weekends', false);
    updateUrlParams();
    expect(window.location.search).toContain('times=weekdays%2Cweekni');
  });

  it('should omit times param when all time filters are checked', () => {
    createNamedCheckbox('time-filter', 'weekdays', true);
    createNamedCheckbox('time-filter', 'weeknights', true);
    createNamedCheckbox('time-filter', 'weekends', true);
    updateUrlParams();
    expect(window.location.search).not.toContain('times=');
  });

  it('should encode partial saved filters as comma-separated', () => {
    createNamedCheckbox('saved-filter', 'yes', true);
    createNamedCheckbox('saved-filter', 'maybe', true);
    createNamedCheckbox('saved-filter', 'no', false);
    createNamedCheckbox('saved-filter', 'unmarked', false);
    updateUrlParams();
    expect(window.location.search).toContain('saved=yes');
    expect(window.location.search).toContain('maybe');
  });

  it('should produce clean pathname when no controls exist', () => {
    updateUrlParams();
    // No params should be written when no controls are found
    expect(window.location.search).toBe('');
  });
});

// --- restoreFromUrl ---

describe('restoreFromUrl', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    window.history.replaceState(null, '', '/');
  });

  it('should do nothing when no URL params exist', () => {
    window.history.replaceState(null, '', '/');
    restoreFromUrl();
    // No-op, should not throw
  });

  it('should restore timeline toggle from URL', () => {
    const wrapper = document.createElement('div');
    wrapper.id = 'timeline-mode-toggle';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = false;
    wrapper.appendChild(input);
    document.body.appendChild(wrapper);

    window.history.replaceState(null, '', '/?timeline=1');
    restoreFromUrl();
    expect(input.checked).toBe(true);
  });

  it('should restore week-start and set body classes', () => {
    const wrapper = document.createElement('div');
    wrapper.id = 'week-start-toggle';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = false;
    wrapper.appendChild(input);
    document.body.appendChild(wrapper);

    window.history.replaceState(null, '', '/?week-start=1');
    restoreFromUrl();
    expect(input.checked).toBe(true);
    expect(document.body.classList.contains('monday-start')).toBe(true);
    expect(document.body.classList.contains('sunday-start')).toBe(false);
  });

  it('should restore detail checkboxes and body classes', () => {
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = 'show-year-director-checkbox';
    cb.checked = false;
    document.body.appendChild(cb);

    window.history.replaceState(null, '', '/?year-director=1');
    restoreFromUrl();
    expect(cb.checked).toBe(true);
    expect(document.body.classList.contains('show-year-director')).toBe(true);
  });

  it('should restore image checkbox with scrim and blur classes', () => {
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = 'show-image-checkbox';
    cb.checked = false;
    document.body.appendChild(cb);

    window.history.replaceState(null, '', '/?image=1');
    restoreFromUrl();
    expect(cb.checked).toBe(true);
    expect(document.body.classList.contains('show-image')).toBe(true);
    expect(document.body.classList.contains('scrim-enabled')).toBe(true);
    expect(document.body.classList.contains('blur-enabled')).toBe(true);
  });

  it('should restore time filter checkboxes', () => {
    const weekdays = document.createElement('input');
    weekdays.type = 'checkbox';
    weekdays.name = 'time-filter';
    weekdays.value = 'weekdays';
    weekdays.checked = true;
    document.body.appendChild(weekdays);

    const weeknights = document.createElement('input');
    weeknights.type = 'checkbox';
    weeknights.name = 'time-filter';
    weeknights.value = 'weeknights';
    weeknights.checked = true;
    document.body.appendChild(weeknights);

    const weekends = document.createElement('input');
    weekends.type = 'checkbox';
    weekends.name = 'time-filter';
    weekends.value = 'weekends';
    weekends.checked = true;
    document.body.appendChild(weekends);

    window.history.replaceState(null, '', '/?times=weekdays,weeknights');
    restoreFromUrl();
    expect(weekdays.checked).toBe(true);
    expect(weeknights.checked).toBe(true);
    expect(weekends.checked).toBe(false);
  });

  it('should restore saved filter checkboxes', () => {
    const yes = document.createElement('input');
    yes.type = 'checkbox';
    yes.name = 'saved-filter';
    yes.value = 'yes';
    yes.checked = false;
    document.body.appendChild(yes);

    const maybe = document.createElement('input');
    maybe.type = 'checkbox';
    maybe.name = 'saved-filter';
    maybe.value = 'maybe';
    maybe.checked = false;
    document.body.appendChild(maybe);

    window.history.replaceState(null, '', '/?saved=yes,maybe');
    restoreFromUrl();
    expect(yes.checked).toBe(true);
    expect(maybe.checked).toBe(true);
  });
});
