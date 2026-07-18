import { categoryColors, palette } from './tokens';

const HEX = /^#(?:[0-9A-F]{6}|[0-9A-F]{8})$/i;

describe('design tokens', () => {
  it('tüm renkler geçerli hex', () => {
    for (const theme of Object.values(palette)) {
      for (const value of Object.values(theme)) {
        expect(value).toMatch(HEX);
      }
    }
    for (const value of Object.values(categoryColors)) {
      expect(value).toMatch(HEX);
    }
  });

  it('saf siyah ve saf beyaz metin yasak (DESIGN.md)', () => {
    for (const theme of Object.values(palette)) {
      expect(theme.bg.toUpperCase()).not.toBe('#000000');
      expect(theme.textPrimary.toUpperCase()).not.toBe('#FFFFFF');
    }
  });
});
