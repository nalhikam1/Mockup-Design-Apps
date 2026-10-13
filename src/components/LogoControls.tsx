import React, { useRef } from 'react';
import { LogoTransform, MockupProduct, SampleLogo } from '../types/mockup';
import { SAMPLE_LOGOS } from '../data/sampleLogos';
import {
  Upload,
  RotateCcw,
  Sliders,
  Layers,
  Palette,
  FlipHorizontal,
  FlipVertical,
  Check,
  Sparkles,
} from 'lucide-react';

interface LogoControlsProps {
  product: MockupProduct;
  logoUrl: string | null;
  transform: LogoTransform;
  onTransformChange: (t: LogoTransform) => void;
  onLogoUpload: (dataUrl: string) => void;
  selectedSampleId: string | null;
  onSelectSample: (logo: SampleLogo) => void;
  onOpenAIGenerator: () => void;
}

export const LogoControls: React.FC<LogoControlsProps> = ({
  product,
  logoUrl,
  transform,
  onTransformChange,
  onLogoUpload,
  selectedSampleId,
  onSelectSample,
  onOpenAIGenerator,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onLogoUpload(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetTransform = () => {
    onTransformChange({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      blendMode: 'multiply',
      colorFilter: 'original',
      tintColor: '#ffffff',
      horizontalFlip: false,
      verticalFlip: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Upload & Sample Brand Logos */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Logo & Brand Artwork
            </h3>
          </div>
          <button
            onClick={onOpenAIGenerator}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm hover:from-indigo-600 hover:to-purple-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Create with AI
          </button>
        </div>

        {/* Upload Button Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition group text-center"
          >
            <Upload className="w-5 h-5 text-zinc-400 group-hover:text-blue-500 transition mb-1.5" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Upload Custom Logo
            </span>
            <span className="text-[11px] text-zinc-400">PNG, SVG, JPG, WebP</span>
          </button>

          {/* Active Preview thumbnail */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
            {logoUrl ? (
              <div className="relative w-14 h-14 rounded-lg bg-zinc-900/10 dark:bg-zinc-900 flex items-center justify-center p-1.5 border border-zinc-200 dark:border-zinc-700 shrink-0 overflow-hidden">
                <img
                  src={logoUrl}
                  alt="Active logo"
                  className="max-h-full max-w-full object-contain"
                  style={{
                    filter: transform.colorFilter === 'white' ? 'brightness(0) invert(1)' : undefined,
                  }}
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs shrink-0">
                None
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {selectedSampleId
                  ? SAMPLE_LOGOS.find((l) => l.id === selectedSampleId)?.name || 'Sample Logo'
                  : logoUrl
                  ? 'Custom Uploaded Logo'
                  : 'No Logo Selected'}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                {logoUrl ? 'Active on all mockups' : 'Pick a sample below or upload'}
              </p>
            </div>
          </div>
        </div>

        {/* Sample Brand Logos carousel */}
        <div>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
            Or Test With Sample Brands
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SAMPLE_LOGOS.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className={`group relative p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 shadow-sm ring-1 ring-blue-500'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50'
                  }`}
                  title={sample.name}
                >
                  <div
                    className="w-10 h-10 rounded-lg p-1 flex items-center justify-center overflow-hidden transition"
                    style={{ backgroundColor: sample.previewBg }}
                  >
                    <img
                      src={sample.svgDataUri}
                      alt={sample.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300 truncate w-full group-hover:text-blue-500">
                    {sample.name.split(' ')[0]}
                  </span>
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px]">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Position Presets */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Placement Presets
            </h3>
          </div>
          <button
            onClick={resetTransform}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {product.suggestedPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onTransformChange({ ...transform, ...preset.transform })}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 text-zinc-700 dark:text-zinc-300 transition text-center"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Detailed Sliders & Transformations */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          Fine Controls
        </h3>

        {/* Scale Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            <span>Size / Scale</span>
            <span className="font-mono">{Math.round(transform.scale * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max={product.printArea.maxScale || 2.2}
            step="0.05"
            value={transform.scale}
            onChange={(e) => onTransformChange({ ...transform, scale: parseFloat(e.target.value) })}
            className="w-full accent-blue-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Rotation Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            <span>Rotation</span>
            <span className="font-mono">{transform.rotation}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={transform.rotation}
            onChange={(e) => onTransformChange({ ...transform, rotation: parseInt(e.target.value) })}
            className="w-full accent-blue-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Horizontal Offset X */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              <span>Position X</span>
              <span className="font-mono">{transform.x}%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={transform.x}
              onChange={(e) => onTransformChange({ ...transform, x: parseInt(e.target.value) })}
              className="w-full accent-blue-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Vertical Offset Y */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              <span>Position Y</span>
              <span className="font-mono">{transform.y}%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={transform.y}
              onChange={(e) => onTransformChange({ ...transform, y: parseInt(e.target.value) })}
              className="w-full accent-blue-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            <span>Ink Opacity (Vintage Wash)</span>
            <span className="font-mono">{Math.round(transform.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={transform.opacity}
            onChange={(e) => onTransformChange({ ...transform, opacity: parseFloat(e.target.value) })}
            className="w-full accent-blue-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Flip Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-500">Flip:</span>
          <button
            onClick={() => onTransformChange({ ...transform, horizontalFlip: !transform.horizontalFlip })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
              transform.horizontalFlip
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-600'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            Horizontal
          </button>
          <button
            onClick={() => onTransformChange({ ...transform, verticalFlip: !transform.verticalFlip })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
              transform.verticalFlip
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-600'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5" />
            Vertical
          </button>
        </div>
      </div>

      {/* 4. Blending & Realistic Ink Mode */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Print Blend Mode
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'multiply', label: 'Multiply (Realistic Ink)', desc: 'Natural garment/glaze absorption' },
            { id: 'normal', label: 'Normal (Opaque)', desc: 'Sticker / high density vinyl' },
            { id: 'overlay', label: 'Overlay', desc: 'Contrasting texture' },
            { id: 'screen', label: 'Screen', desc: 'Bright ink highlight' },
            { id: 'soft-light', label: 'Soft Light', desc: 'Subtle wash' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => onTransformChange({ ...transform, blendMode: mode.id as any })}
              className={`p-2.5 rounded-xl border text-left transition ${
                transform.blendMode === mode.id
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <span className="text-xs font-semibold block">{mode.label}</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">{mode.desc}</span>
            </button>
          ))}
        </div>

        {/* Logo Color Tinting */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Logo Color Filter
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'original', label: 'Original Colors' },
              { id: 'white', label: 'Invert to White' },
              { id: 'black', label: 'Monochrome Black' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => onTransformChange({ ...transform, colorFilter: f.id as any })}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  transform.colorFilter === f.id
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
