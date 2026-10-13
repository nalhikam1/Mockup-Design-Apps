import React from 'react';
import { MockupProduct, SceneEnvironment } from '../types/mockup';
import { SCENE_ENVIRONMENTS } from '../data/products';
import { Palette, Sun, Download, Check, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';

interface ProductCustomizerProps {
  product: MockupProduct;
  productColor: string;
  onProductColorChange: (hex: string) => void;
  scene: SceneEnvironment;
  onSceneChange: (scene: SceneEnvironment) => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  onExport: (scale: number, format: 'image/png' | 'image/jpeg') => void;
  isExporting: boolean;
}

export const ProductCustomizer: React.FC<ProductCustomizerProps> = ({
  product,
  productColor,
  onProductColorChange,
  scene,
  onSceneChange,
  showGuides,
  onToggleGuides,
  onExport,
  isExporting,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Product Color Palette */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Product Color
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500 uppercase">
            {productColor}
          </span>
        </div>

        {/* Preset Color Swatches */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {product.availableColors.map((color) => {
            const isSelected = productColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                onClick={() => onProductColorChange(color.hex)}
                className={`group relative aspect-square rounded-xl border flex items-center justify-center transition shadow-sm ${
                  isSelected
                    ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900 border-transparent scale-105'
                    : 'border-zinc-200 dark:border-zinc-700 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {isSelected && (
                  <Check
                    className={`w-4 h-4 ${
                      color.textContrast === 'light' ? 'text-white' : 'text-zinc-900'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Color Picker Input */}
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Custom Hex Color:
          </label>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="color"
              value={productColor}
              onChange={(e) => onProductColorChange(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700 p-0.5 bg-transparent"
            />
            <input
              type="text"
              value={productColor}
              onChange={(e) => onProductColorChange(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg w-28 text-zinc-800 dark:text-zinc-200"
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      {/* 2. Scene Environment Background */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Scene Environment & Lighting
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {SCENE_ENVIRONMENTS.map((env) => {
            const isSelected = scene.id === env.id;
            return (
              <button
                key={env.id}
                onClick={() => onSceneChange(env)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 dark:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold">{env.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-500" />}
                </div>
                <div
                  className={`w-full h-4 rounded-md border border-black/10 ${env.backgroundClass}`}
                  style={{
                    backgroundImage: env.surfaceType === 'transparent'
                      ? 'radial-gradient(#94a3b8 1px, transparent 1px)'
                      : undefined,
                    backgroundSize: '8px 8px',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Guides toggle */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Print Area Alignment Guides
            </span>
          </div>
          <button
            onClick={onToggleGuides}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              showGuides
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {showGuides ? 'Visible' : 'Hidden'}
          </button>
        </div>
      </div>

      {/* 3. Export Options */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Export High-Res Mockup
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            disabled={isExporting}
            onClick={() => onExport(1, 'image/png')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition disabled:opacity-50"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
            Standard (1K PNG)
          </button>

          <button
            disabled={isExporting}
            onClick={() => onExport(2, 'image/png')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            Retina (2K PNG)
          </button>

          <button
            disabled={isExporting}
            onClick={() => onExport(4, 'image/png')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Print Ready (4K)
          </button>
        </div>
      </div>
    </div>
  );
};
