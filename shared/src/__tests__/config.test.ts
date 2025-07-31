import { getIndexFromConfig, CONFIG_FIELD } from '../config';

describe('config', () => {
  describe('getIndexFromConfig', () => {
    it('should return undefined when config is undefined', () => {
      expect(getIndexFromConfig(undefined)).toBeUndefined();
    });

    it('should return undefined when config index is undefined', () => {
      expect(getIndexFromConfig({})).toBeUndefined();
    });

    it('should return undefined when config index is not a safe integer', () => {
      expect(getIndexFromConfig({ [CONFIG_FIELD]: NaN })).toBeUndefined();
      expect(getIndexFromConfig({ [CONFIG_FIELD]: Infinity })).toBeUndefined();
      expect(getIndexFromConfig({ [CONFIG_FIELD]: 1.5 })).toBeUndefined();
    });

    it('should return the index when config index is a safe integer', () => {
      expect(getIndexFromConfig({ [CONFIG_FIELD]: 0 })).toBe(0);
      expect(getIndexFromConfig({ [CONFIG_FIELD]: 1 })).toBe(1);
      expect(getIndexFromConfig({ [CONFIG_FIELD]: 42 })).toBe(42);
    });

    it('should return the index when config index is negative safe integer', () => {
      expect(getIndexFromConfig({ [CONFIG_FIELD]: -1 })).toBe(-1);
      expect(getIndexFromConfig({ [CONFIG_FIELD]: -42 })).toBe(-42);
    });
  });

  describe('CONFIG_FIELD', () => {
    it('should have the correct value', () => {
      expect(CONFIG_FIELD).toBe('index');
    });
  });
});
