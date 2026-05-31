import type { CSSProperties } from 'react';
import type { AcademySettings } from './settingsTypes';

const fallbackMainColor = '#5b5bd6';

export type AcademyBrand = {
  name: string;
  logoUrl: string | null;
  mainColor: string;
  initials: string;
  style: CSSProperties;
};

export function createAcademyBrand(settings?: AcademySettings): AcademyBrand {
  const name = settings?.name?.trim() || '샘플 아카데미';
  const mainColor = normalizeHex(settings?.mainColor) ?? fallbackMainColor;

  return {
    name,
    logoUrl: settings?.logoUrl?.trim() || null,
    mainColor,
    initials: createInitials(name),
    style: createBrandStyle(mainColor),
  };
}

function createInitials(name: string) {
  return name
    .replace(/\s+/g, '')
    .slice(0, 2)
    .toUpperCase();
}

function normalizeHex(value?: string) {
  if (!value || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return null;
  }

  return value.toUpperCase();
}

function createBrandStyle(hex: string): CSSProperties {
  const rgb = hexToRgb(hex);
  const readableText = getReadableTextColor(rgb);

  return {
    '--color-brand-3': mixWithWhite(rgb, 0.88),
    '--color-brand-6': mixWithWhite(rgb, 0.62),
    '--color-brand-9': hex,
    '--color-brand-10': shade(rgb, 0.92),
    '--color-brand-11': shade(rgb, 0.72),
    '--color-brand-12': shade(rgb, 0.38),
    '--color-solid-brand': hex,
    '--color-text-brand': shade(rgb, 0.72),
    '--color-text-on-brand': readableText,
  } as CSSProperties;
}

function hexToRgb(hex: string) {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function mixWithWhite(rgb: { r: number; g: number; b: number }, whiteRatio: number) {
  return toHex({
    r: Math.round(rgb.r * (1 - whiteRatio) + 255 * whiteRatio),
    g: Math.round(rgb.g * (1 - whiteRatio) + 255 * whiteRatio),
    b: Math.round(rgb.b * (1 - whiteRatio) + 255 * whiteRatio),
  });
}

function shade(rgb: { r: number; g: number; b: number }, ratio: number) {
  return toHex({
    r: Math.round(rgb.r * ratio),
    g: Math.round(rgb.g * ratio),
    b: Math.round(rgb.b * ratio),
  });
}

function toHex(rgb: { r: number; g: number; b: number }) {
  return `#${toChannel(rgb.r)}${toChannel(rgb.g)}${toChannel(rgb.b)}`;
}

function toChannel(value: number) {
  return Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');
}

function getReadableTextColor(rgb: { r: number; g: number; b: number }) {
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;

  return luminance > 0.62 ? '#11181C' : '#FFFFFF';
}
