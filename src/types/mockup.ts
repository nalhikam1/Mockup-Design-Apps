export type ProductCategory = 'all' | 'drinkware' | 'apparel' | 'accessories' | 'stationery';

export interface ColorPreset {
  name: string;
  hex: string;
  textContrast?: 'light' | 'dark';
}

export interface PrintArea {
  x: number; // percentage from top-left of canvas viewBox (0-100)
  y: number;
  width: number;
  height: number;
  type?: 'cylinder' | 'flat' | 'fabric';
  maxScale?: number;
}

export interface MockupProduct {
  id: string;
  name: string;
  shortName: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  badge?: string;
  defaultColor: string;
  availableColors: ColorPreset[];
  printArea: PrintArea;
  cylinderDistortion?: number; // Curve distortion strength (0 to 1) for mugs/bottles
  fabricTexture?: boolean;
  aspectRatio: string; // e.g. "1/1" or "4/3"
  suggestedPresets: {
    label: string;
    transform: Partial<LogoTransform>;
  }[];
}

export interface LogoTransform {
  x: number; // Offset % from center of print area (-50 to 50)
  y: number; // Offset % from center of print area (-50 to 50)
  scale: number; // 0.2 to 2.5
  rotation: number; // -180 to 180 degrees
  opacity: number; // 0.1 to 1.0
  blendMode: 'multiply' | 'normal' | 'overlay' | 'screen' | 'soft-light';
  colorFilter: 'original' | 'white' | 'black' | 'tint';
  tintColor: string;
  horizontalFlip: boolean;
  verticalFlip: boolean;
}

export interface SceneEnvironment {
  id: string;
  name: string;
  iconName: string;
  backgroundClass: string;
  ambientLight: 'warm' | 'cool' | 'studio' | 'moody';
  surfaceType: 'table' | 'studio-gradient' | 'minimal' | 'transparent';
}

export type AIImageSize = '1K' | '2K' | '4K';

export type AIAspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';

export interface AIGeneratedResult {
  id: string;
  imageUrl: string;
  prompt: string;
  modelUsed: 'gemini-3-pro-image-preview' | 'gemini-nano-banana-2.1';
  imageSize?: AIImageSize;
  aspectRatio?: string;
  timestamp: number;
  type: 'high-quality-mockup' | 'created-or-edited-image';
}

export interface SampleLogo {
  id: string;
  name: string;
  category: string;
  svgDataUri: string;
  previewBg: string;
}
