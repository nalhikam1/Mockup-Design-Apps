/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MockupProduct, LogoTransform, SceneEnvironment, SampleLogo } from './types/mockup';
import { PRODUCTS, SCENE_ENVIRONMENTS } from './data/products';
import { SAMPLE_LOGOS } from './data/sampleLogos';
import { Header } from './components/Header';
import { ProductSelector } from './components/ProductSelector';
import { MockupCanvas } from './components/MockupCanvas';
import { LogoControls } from './components/LogoControls';
import { ProductCustomizer } from './components/ProductCustomizer';
import { CatalogView } from './components/CatalogView';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import {
  Upload,
  Sparkles,
  Sliders,
  Palette,
  CheckCircle2,
  Download,
  Eye,
  Info,
} from 'lucide-react';

export default function App() {
  // Selected product (starts with Ceramic Mug or T-Shirt)
  const [selectedProduct, setSelectedProduct] = useState<MockupProduct>(PRODUCTS[0]);

  // Active logo: default to the North Roast vector logo for an instant impressive initial preview
  const [logoUrl, setLogoUrl] = useState<string | null>(SAMPLE_LOGOS[0].svgDataUri);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(SAMPLE_LOGOS[0].id);

  // Product color & Scene background
  const [productColor, setProductColor] = useState<string>(PRODUCTS[0].defaultColor);
  const [scene, setScene] = useState<SceneEnvironment>(SCENE_ENVIRONMENTS[0]);

  // Logo transform
  const [transform, setTransform] = useState<LogoTransform>({
    x: 0,
    y: 0,
    scale: 0.95,
    rotation: 0,
    opacity: 1,
    blendMode: 'multiply',
    colorFilter: 'original',
    tintColor: '#ffffff',
    horizontalFlip: false,
    verticalFlip: false,
  });

  // Editor sub-tab: 'logo' vs 'product'
  const [editorTab, setEditorTab] = useState<'logo' | 'product'>('logo');

  // View mode: 'editor' vs 'catalog'
  const [currentView, setCurrentView] = useState<'editor' | 'catalog'>('editor');

  // UI state
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Export function reference from canvas
  const exportFnRef = useRef<((scale?: number, format?: 'image/png' | 'image/jpeg') => Promise<string>) | null>(null);

  // When product changes, update default color and suggest preset
  const handleSelectProduct = (product: MockupProduct) => {
    setSelectedProduct(product);
    setProductColor(product.defaultColor);
    // Apply first preset if available
    if (product.suggestedPresets.length > 0) {
      setTransform((prev) => ({
        ...prev,
        ...product.suggestedPresets[0].transform,
      }));
    }
    // Switch to editor view if in catalog
    setCurrentView('editor');
  };

  // When a user selects a sample logo
  const handleSelectSample = (sample: SampleLogo) => {
    setLogoUrl(sample.svgDataUri);
    setSelectedSampleId(sample.id);
    showToast(`Loaded ${sample.name} logo`);
  };

  // When a user uploads their custom logo
  const handleLogoUpload = (dataUrl: string) => {
    setLogoUrl(dataUrl);
    setSelectedSampleId(null);
    showToast('Custom logo uploaded successfully!');
  };

  // When an AI generated logo is applied
  const handleApplyAILogo = (dataUrl: string) => {
    setLogoUrl(dataUrl);
    setSelectedSampleId(null);
    showToast('AI artwork applied to all mockups!');
  };

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // High-res export
  const handleExport = async (scale = 2, format: 'image/png' | 'image/jpeg' = 'image/png') => {
    if (!exportFnRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await exportFnRef.current(scale, format);
      const a = document.createElement('a');
      a.href = dataUrl;
      const extension = format === 'image/jpeg' ? 'jpg' : 'png';
      a.download = `mockupcraft-${selectedProduct.id}-${scale}x-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Exported ${scale}x mockup successfully!`);
    } catch (err) {
      console.error(err);
      showToast('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenAIGenerator={() => setIsAIModalOpen(true)}
        onExportCurrent={() => handleExport(2, 'image/png')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Product Carousel / Horizontal Selector */}
        <ProductSelector
          selectedProduct={selectedProduct}
          onSelectProduct={handleSelectProduct}
        />

        {currentView === 'catalog' ? (
          /* ALL PRODUCTS LINEUP GRID */
          <CatalogView
            logoUrl={logoUrl}
            transform={transform}
            scene={scene}
            onSelectProduct={handleSelectProduct}
            onOpenAIGenerator={() => setIsAIModalOpen(true)}
          />
        ) : (
          /* SINGLE PRODUCT INTERACTIVE STUDIO */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Canvas & Scene Previews (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Product Info Bar */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-xs text-zinc-500">{selectedProduct.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowGuides(!showGuides)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                      showGuides
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Guides
                  </button>
                </div>
              </div>

              {/* Main Realistic Mockup Canvas */}
              <div className="relative">
                <MockupCanvas
                  product={selectedProduct}
                  logoUrl={logoUrl}
                  productColor={productColor}
                  scene={scene}
                  transform={transform}
                  onTransformChange={setTransform}
                  showGuides={showGuides}
                  onExportReady={(fn) => {
                    exportFnRef.current = fn;
                  }}
                />
              </div>

              {/* Quick Prompt to AI Studio */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Want Photorealistic AI Photoshoots?
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Generate in 1K, 2K, 4K with gemini-3-pro-image-preview or edit artwork with gemini-nano-banana-2.1
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition whitespace-nowrap"
                >
                  Open AI Studio
                </button>
              </div>
            </div>

            {/* Right Column: Customization Tabs & Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Controls Tab Switcher */}
              <div className="flex items-center p-1 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-2xl">
                <button
                  onClick={() => setEditorTab('logo')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
                    editorTab === 'logo'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Logo & Artwork</span>
                </button>

                <button
                  onClick={() => setEditorTab('product')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
                    editorTab === 'product'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Product & Scene</span>
                </button>
              </div>

              {/* Tab 1: Logo Upload & Fine Adjustment */}
              {editorTab === 'logo' && (
                <LogoControls
                  product={selectedProduct}
                  logoUrl={logoUrl}
                  transform={transform}
                  onTransformChange={setTransform}
                  onLogoUpload={handleLogoUpload}
                  selectedSampleId={selectedSampleId}
                  onSelectSample={handleSelectSample}
                  onOpenAIGenerator={() => setIsAIModalOpen(true)}
                />
              )}

              {/* Tab 2: Product Color, Scene Environment & Export */}
              {editorTab === 'product' && (
                <ProductCustomizer
                  product={selectedProduct}
                  productColor={productColor}
                  onProductColorChange={setProductColor}
                  scene={scene}
                  onSceneChange={setScene}
                  showGuides={showGuides}
                  onToggleGuides={() => setShowGuides(!showGuides)}
                  onExport={handleExport}
                  isExporting={isExporting}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* AI Studio Modal for gemini-3-pro-image-preview and gemini-nano-banana-2.1 */}
      <AIGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        product={selectedProduct}
        logoUrl={logoUrl}
        onApplyLogo={handleApplyAILogo}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
