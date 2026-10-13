import React from 'react';
import { MockupProduct, LogoTransform, SceneEnvironment } from '../types/mockup';
import { PRODUCTS } from '../data/products';
import { MockupCanvas } from './MockupCanvas';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CatalogViewProps {
  logoUrl: string | null;
  transform: LogoTransform;
  scene: SceneEnvironment;
  onSelectProduct: (product: MockupProduct) => void;
  onOpenAIGenerator: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  logoUrl,
  transform,
  scene,
  onSelectProduct,
  onOpenAIGenerator,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            Full Brand Product Lineup
          </h2>
          <p className="text-sm text-blue-100 max-w-xl">
            See your logo rendered across every product mockup in real time. Click any item to customize colors, positioning, or generate AI studio mockups.
          </p>
        </div>
        <button
          onClick={onOpenAIGenerator}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-900 font-bold text-xs shadow-md hover:bg-blue-50 transition shrink-0"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          AI Studio Photoshoot
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRODUCTS.map((prod) => (
          <div
            key={prod.id}
            onClick={() => onSelectProduct(prod)}
            className="group cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-blue-500 transition flex flex-col justify-between"
          >
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center relative">
              <MockupCanvas
                product={prod}
                logoUrl={logoUrl}
                productColor={prod.defaultColor}
                scene={scene}
                transform={transform}
                onTransformChange={() => {}}
                showGuides={false}
              />
              <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition rounded-xl flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition transform translate-y-2 group-hover:translate-y-0">
                  Customize {prod.shortName} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition">
                  {prod.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">{prod.tagline}</p>
              </div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                {prod.availableColors.length} Colors
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
