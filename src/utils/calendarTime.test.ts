/**
 * Test suite for calendar time utility functions.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isDateInPast, isDatetimeInPast } from './calendarTime';

describe('calendarTime', () => {
  describe('isDateInPast', () => {
    let originalDate: typeof Date;

    beforeEach(() => {
      // Save original Date
      originalDate = global.Date;
    });

    afterEach(() => {
      // Restore original Date
      global.Date = originalDate;
    });

    it('should return true for dates before today', () => {
      // Mock current date as 2026-02-15
      const mockDate = new Date('2026-02-15T12:00:00');
      vi.setSystemTime(mockDate);

      expect(isDateInPast('2026-02-14')).toBe(true);
      expect(isDateInPast('2026-02-10')).toBe(true);
      expect(isDateInPast('2026-01-01')).toBe(true);
      expect(isDateInPast('2025-12-31')).toBe(true);

      vi.useRealTimers();
    });

    it('should return false for today', () => {
      // Mock current date as 2026-02-15
      const mockDate = new Date('2026-02-15T12:00:00');
      vi.setSystemTime(mockDate);

      expect(isDateInPast('2026-02-15')).toBe(false);

      vi.useRealTimers();
    });

    it('should return false for dates after today', () => {
      // Mock current date as 2026-02-15
      const mockDate = new Date('2026-02-15T12:00:00');
      vi.setSystemTime(mockDate);

      expect(isDateInPast('2026-02-16')).toBe(false);
      expect(isDateInPast('2026-02-20')).toBe(false);
      expect(isDateInPast('2026-03-01')).toBe(false);
      expect(isDateInPast('2027-01-01')).toBe(false);

      vi.useRealTimers();
    });

    it('should work at midnight boundary', () => {
      // Mock current date as 2026-02-15 at 23:59:59
      const mockDate = new Date('2026-02-15T23:59:59');
      vi.setSystemTime(mockDate);

      // Yesterday should be past
      expect(isDateInPast('2026-02-14')).toBe(true);
      // Today should not be past (even at 23:59)
      expect(isDateInPast('2026-02-15')).toBe(false);
      // Tomorrow should not be past
      expect(isDateInPast('2026-02-16')).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('isDatetimeInPast', () => {
    let originalDate: typeof Date;

    beforeEach(() => {
      // Save original Date
      originalDate = global.Date;
    });

    afterEach(() => {
      // Restore original Date
      global.Date = originalDate;
    });

    it('should return true for datetimes before current time', () => {
      // Mock current time as 2026-02-15 14:00:00
      const mockDate = new Date('2026-02-15T14:00:00');
      vi.setSystemTime(mockDate);

      expect(isDatetimeInPast('2026-02-15T13:59:59')).toBe(true);
      expect(isDatetimeInPast('2026-02-15T13:00:00')).toBe(true);
      expect(isDatetimeInPast('2026-02-15T12:00:00')).toBe(true);
      expect(isDatetimeInPast('2026-02-14T19:00:00')).toBe(true);
      expect(isDatetimeInPast('2026-02-01T10:00:00')).toBe(true);

      vi.useRealTimers();
    });

    it('should return false for current time', () => {
      // Mock current time as 2026-02-15 14:00:00
      const mockDate = new Date('2026-02-15T14:00:00');
      vi.setSystemTime(mockDate);

      expect(isDatetimeInPast('2026-02-15T14:00:00')).toBe(false);

      vi.useRealTimers();
    });

    it('should return false for datetimes after current time', () => {
      // Mock current time as 2026-02-15 14:00:00
      const mockDate = new Date('2026-02-15T14:00:00');
      vi.setSystemTime(mockDate);

      expect(isDatetimeInPast('2026-02-15T14:00:01')).toBe(false);
      expect(isDatetimeInPast('2026-02-15T15:00:00')).toBe(false);
      expect(isDatetimeInPast('2026-02-15T19:00:00')).toBe(false);
      expect(isDatetimeInPast('2026-02-16T10:00:00')).toBe(false);
      expect(isDatetimeInPast('2026-03-01T12:00:00')).toBe(false);

      vi.useRealTimers();
    });

    it('should work with different time zones in ISO format', () => {
      // Mock current time as 2026-02-15 14:00:00 UTC
      const mockDate = new Date('2026-02-15T14:00:00Z');
      vi.setSystemTime(mockDate);

      // Past times in different formats
      expect(isDatetimeInPast('2026-02-15T13:00:00Z')).toBe(true);
      expect(isDatetimeInPast('2026-02-15T13:00:00')).toBe(true);

      vi.useRealTimers();
    });

    it('should handle edge cases at second boundaries', () => {
      // Mock current time as 2026-02-15 14:30:00
      const mockDate = new Date('2026-02-15T14:30:00');
      vi.setSystemTime(mockDate);

      // One second before should be past
      expect(isDatetimeInPast('2026-02-15T14:29:59')).toBe(true);
      // Same time should not be past
      expect(isDatetimeInPast('2026-02-15T14:30:00')).toBe(false);
      // One second after should not be past
      expect(isDatetimeInPast('2026-02-15T14:30:01')).toBe(false);

      vi.useRealTimers();
    });
  });
});
