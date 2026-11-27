import assert from "node:assert/strict";
import test from "node:test";
import { brand } from "../src/config/brand";
function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/../g)!
    .map((part) => {
      const value = parseInt(part, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
for (const [theme, colors] of Object.entries(brand.colors)) {
  test(`${theme}: readable semantic foregrounds and focus indicators`, () => {
    for (const background of [colors.paper, colors.surface]) {
      for (const foreground of [
        colors.ink,
        colors.secondaryText,
        colors.muted,
        colors.accentText,
        colors.success,
        colors.danger,
        colors.warning,
      ]) {
        assert.ok(
          contrast(foreground, background) >= 4.5,
          `${foreground} on ${background}`,
        );
      }
      assert.ok(contrast(colors.focus, background) >= 3);
    }
    for (const [foreground, background] of [
      [colors.onAccent, colors.accent],
      [colors.onAccent, colors.accentHover],
      [colors.navigationText, colors.navigation],
      [colors.navigationMuted, colors.navigation],
      [colors.onDanger, colors.danger],
    ]) {
      assert.ok(
        contrast(foreground, background) >= 4.5,
        `${foreground} on ${background}`,
      );
    }
  });
}
test("official palette remains exact and shared by both themes", () => {
  assert.deepEqual(brand.palette, {
    inkNavy: "#141B2D",
    pearlWhite: "#F4F1EA",
    electricCoral: "#FF5A4E",
  });
  assert.equal(brand.colors.light.accent, brand.palette.electricCoral);
  assert.equal(brand.colors.dark.accent, brand.palette.electricCoral);
});
