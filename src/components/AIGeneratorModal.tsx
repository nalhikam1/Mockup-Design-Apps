import React, { useState } from 'react';
import { MockupProduct, AIImageSize, AIAspectRatio, AIGeneratedResult } from '../types/mockup';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Check,
  Download,
  X,
  Loader2,
  RefreshCw,
  Sliders,
  Maximize2,
  Edit3,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MockupProduct;
  logoUrl: string | null;
  onApplyLogo: (imageUrl: string) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  product,
  logoUrl,
  onApplyLogo,
}) => {
  // Mode: 'generate-high-res' (gemini-3-pro-image-preview) vs 'create-edit' (gemini-nano-banana-2.1)
  const [activeTab, setActiveTab] = useState<'high-res' | 'create-edit'>('high-res');

  // gemini-3-pro-image-preview state
  const [highResPrompt, setHighResPrompt] = useState<string>(
    `Commercial studio photography of a ${product.name.toLowerCase()} featuring this brand logo, warm soft morning lighting, high-end retail aesthetic, shallow depth of field, 85mm lens`
  );
  // Affordance for specifying image size: 1K, 2K, 4K
  const [imageSize, setImageSize] = useState<AIImageSize>('2K');
  const [aspectRatio, setAspectRatio] = useState<AIAspectRatio>('1:1');
  const [useReferenceLogo, setUseReferenceLogo] = useState<boolean>(true);

  // gemini-nano-banana-2.1 state
  const [editPrompt, setEditPrompt] = useState<string>('Convert this logo into an embroidered thread patch with realistic stitch texture');
  const [editMode, setEditMode] = useState<'edit-existing' | 'create-new'>('edit-existing');
  const [editImageSize, setEditImageSize] = useState<AIImageSize>('1K');

  // Request state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<AIGeneratedResult[]>([]);
  const [currentResult, setCurrentResult] = useState<AIGeneratedResult | null>(null);

  if (!isOpen) return null;

  // Quick preset prompts for gemini-3-pro-image-preview
  const highResPresets = [
    {
      title: 'Boutique Studio Shoot',
      prompt: `Commercial studio photo of a premium ${product.name.toLowerCase()} with this brand logo centered, soft daylight through window, clean concrete counter, Scandinavian design`,
    },
    {
      title: 'Coffeehouse Lifestyle',
      prompt: `Cozy atmospheric photo in an artisan cafe of a customer holding a ${product.name.toLowerCase()} with this logo, steam rising, warm bokeh, film color grading`,
    },
    {
      title: 'Minimalist Flatlay',
      prompt: `Overhead flatlay product layout with a ${product.name.toLowerCase()}, designer notebook, fresh foliage, and ambient shadows, magazine editorial style`,
    },
    {
      title: 'Streetwear Lookbook',
      prompt: `Fashion lookbook photoshoot of model wearing a stylish ${product.name.toLowerCase()} with this logo graphic, urban architecture background, golden hour lighting`,
    },
  ];

  // Quick preset prompts for gemini-nano-banana-2.1
  const editPresets = [
    {
      title: 'Embroidered Patch',
      prompt: 'Convert this logo into an authentic embroidered patch with dense stitching texture, twill border, and slight fabric sheen',
    },
    {
      title: 'Vintage Distressed',
      prompt: 'Transform this logo into a worn 1970s vintage distressed screenprint with faded halftone ink and crackled retro texture',
    },
    {
      title: 'Gold Foil Stamped',
      prompt: 'Render this logo in luxury metallic gold foil debossing with micro reflections and textured paper background',
    },
    {
      title: 'Minimalist Vector Line',
      prompt: 'Create a clean modern geometric logo emblem with sharp lines and elegant typography for a lifestyle brand',
    },
  ];

  // Handler: Generate with gemini-3-pro-image-preview
  const handleGenerateHighRes = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: highResPrompt,
          imageSize, // Affordance for user to specify image size: 1K, 2K, 4K
          aspectRatio,
          referenceImage: useReferenceLogo && logoUrl ? logoUrl : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image.');
      }

      const newResult: AIGeneratedResult = {
        id: Date.now().toString(),
        imageUrl: data.imageUrl,
        prompt: highResPrompt,
        modelUsed: 'gemini-3-pro-image-preview',
        imageSize,
        aspectRatio,
        timestamp: Date.now(),
        type: 'high-quality-mockup',
      };

      setCurrentResult(newResult);
      setHistory((prev) => [newResult, ...prev]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while generating image.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Create or edit image with gemini-nano-banana-2.1
  const handleCreateOrEdit = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/create-edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt,
          image: editMode === 'edit-existing' && logoUrl ? logoUrl : undefined,
          aspectRatio: '1:1',
          imageSize: editImageSize,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create or edit image.');
      }

      const newResult: AIGeneratedResult = {
        id: Date.now().toString(),
        imageUrl: data.imageUrl,
        prompt: editPrompt,
        modelUsed: 'gemini-nano-banana-2.1',
        imageSize: editImageSize,
        aspectRatio: '1:1',
        timestamp: Date.now(),
        type: 'created-or-edited-image',
      };

      setCurrentResult(newResult);
      setHistory((prev) => [newResult, ...prev]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while editing image.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Gemini AI Mockup & Image Studio
              </h2>
              <p className="text-xs text-zinc-500">
                Generate high-res commercial photography or create & edit brand assets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-zinc-200 dark:border-zinc-800 flex gap-4 bg-zinc-50/50 dark:bg-zinc-900/20">
          <button
            onClick={() => {
              setActiveTab('high-res');
              setErrorMessage(null);
            }}
            className={`pb-3 px-1 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'high-res'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Generate High-Quality Images (gemini-3-pro-image-preview)
          </button>

          <button
            onClick={() => {
              setActiveTab('create-edit');
              setErrorMessage(null);
            }}
            className={`pb-3 px-1 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'create-edit'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            Create & Edit Images (gemini-nano-banana-2.1)
          </button>
        </div>

        {/* Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* TAB 1: High Quality Images with gemini-3-pro-image-preview */}
            {activeTab === 'high-res' && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                    Powered by <strong>gemini-3-pro-image-preview</strong>. Generates photorealistic product photoshoot scenes featuring your brand logo.
                  </div>
                </div>

                {/* IMAGE SIZE AFFORDANCE (1K, 2K, 4K) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                    <span>Resolution / Image Size</span>
                    <span className="text-[11px] font-normal text-zinc-400">Specify image output fidelity</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['1K', '2K', '4K'] as AIImageSize[]).map((size) => {
                      const isSelected = imageSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setImageSize(size)}
                          className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500 shadow-sm'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <span className="text-base font-black tracking-tight">{size}</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            {size === '1K' ? '1024×1024 Standard' : size === '2K' ? '2048×2048 Ultra-HD' : '4096×4096 Print'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aspect Ratio Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['1:1', '3:4', '4:3', '16:9', '9:16'] as AIAspectRatio[]).map((aspect) => (
                      <button
                        key={aspect}
                        type="button"
                        onClick={() => setAspectRatio(aspect)}
                        className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition ${
                          aspectRatio === aspect
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {aspect}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reference Image Checkbox */}
                {logoUrl && (
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                    <input
                      type="checkbox"
                      checked={useReferenceLogo}
                      onChange={(e) => setUseReferenceLogo(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                        Include current logo as visual reference
                      </span>
                      <span className="text-[11px] text-zinc-400 block">
                        Provides the model your exact logo artwork to incorporate into the scene
                      </span>
                    </div>
                  </label>
                )}

                {/* Prompt Presets */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Preset Prompts:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {highResPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setHighResPrompt(preset.prompt)}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 text-left transition hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
                      >
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                          {preset.prompt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Textarea */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Custom Prompt
                  </label>
                  <textarea
                    rows={3}
                    value={highResPrompt}
                    onChange={(e) => setHighResPrompt(e.target.value)}
                    placeholder="Describe the desired product photoshoot scene in detail..."
                    className="w-full text-xs p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                  />
                </div>

                {/* Action button */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGenerateHighRes}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating High-Res Image ({imageSize})...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate with gemini-3-pro-image-preview
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 2: Create & Edit Images with gemini-nano-banana-2.1 */}
            {activeTab === 'create-edit' && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/50 flex items-start gap-3">
                  <Wand2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-950 dark:text-purple-200 leading-relaxed">
                    Powered by <strong>gemini-nano-banana-2.1</strong>. Use text prompts to edit your existing logo or create brand new logos & graphics from scratch.
                  </div>
                </div>

                {/* Mode Selector: Edit Existing Logo vs Create New */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMode('edit-existing')}
                    className={`p-3 rounded-xl border text-left transition ${
                      editMode === 'edit-existing'
                        ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 ring-2 ring-purple-500'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Edit3 className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-xs font-bold">Edit Current Image</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Transform styles, textures, or materials
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditMode('create-new')}
                    className={`p-3 rounded-xl border text-left transition ${
                      editMode === 'create-new'
                        ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 ring-2 ring-purple-500'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-xs font-bold">Create New Graphic</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Generate fresh logos or illustrations
                    </span>
                  </button>
                </div>

                {/* Preset Prompts for Editing */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Transformation Presets:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {editPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditPrompt(preset.prompt)}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-400 text-left transition hover:bg-purple-50/30 dark:hover:bg-purple-950/20"
                      >
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                          {preset.prompt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Textarea */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Text Prompt for Creation / Editing
                  </label>
                  <textarea
                    rows={3}
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder={
                      editMode === 'edit-existing'
                        ? 'e.g., Turn this logo into an embroidered patch on twill...'
                        : 'e.g., Minimalist geometric coyote logo for mountain athletic brand...'
                    }
                    className="w-full text-xs p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                  />
                </div>

                {/* Resolution selector */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Output Size:
                  </span>
                  <div className="flex gap-2">
                    {(['1K', '2K'] as AIImageSize[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditImageSize(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                          editImageSize === s
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleCreateOrEdit}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing with gemini-nano-banana-2.1...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      {editMode === 'edit-existing' ? 'Edit Image with AI' : 'Create Image with AI'}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300">
                <p className="font-semibold mb-1">Generation Note:</p>
                <p>{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Right Column: Active Result Preview & History (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Generated Result
            </h3>

            {/* Preview Box */}
            <div className="flex-1 min-h-[300px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/40 p-3 flex flex-col items-center justify-center relative overflow-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 animate-pulse flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      Crafting Image...
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      {activeTab === 'high-res'
                        ? `Rendering in ${imageSize} resolution with gemini-3-pro-image-preview`
                        : 'Transforming artwork with gemini-nano-banana-2.1'}
                    </p>
                  </div>
                </div>
              ) : currentResult ? (
                <div className="w-full h-full flex flex-col justify-between space-y-3">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/5 dark:bg-black/40 flex items-center justify-center">
                    <img
                      src={currentResult.imageUrl}
                      alt="AI Result"
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-white">
                      {currentResult.modelUsed} {currentResult.imageSize ? `• ${currentResult.imageSize}` : ''}
                    </div>
                  </div>

                  {/* Actions for current image */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        onApplyLogo(currentResult.imageUrl);
                        onClose();
                      }}
                      className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply As Logo
                    </button>

                    <button
                      onClick={() =>
                        downloadImage(
                          currentResult.imageUrl,
                          `mockupcraft-${currentResult.modelUsed}-${Date.now()}.png`
                        )
                      }
                      className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-zinc-400 space-y-2">
                  <ImageIcon className="w-10 h-10 mx-auto stroke-1 text-zinc-300 dark:text-zinc-600" />
                  <p className="text-xs font-medium">No image generated yet</p>
                  <p className="text-[11px] text-zinc-400">
                    Configure your prompt on the left and click Generate to see results here
                  </p>
                </div>
              )}
            </div>

            {/* Recent History Strip */}
            {history.length > 1 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400">
                  Recent Generations ({history.length})
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentResult(item)}
                      className={`relative w-14 h-14 rounded-xl border overflow-hidden shrink-0 transition ${
                        currentResult?.id === item.id
                          ? 'border-blue-500 ring-2 ring-blue-500'
                          : 'border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={item.imageUrl} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
