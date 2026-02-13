/**
 * Test suite for calendar URL state utilities.
 * Tests the pure helper functions (no DOM-dependent serialize/deserialize).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  isTogglePressed,
  setToggleState,
  getToggleInput,
} from './calendarUrlState';

// --- Setup jsdom for DOM tests ---

let dom: JSDOM;
let document: Document;

beforeEach(() => {
  dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  document = dom.window.document;
  // @ts-expect-error — shim global document for the module
  globalThis.document = document;
});

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
