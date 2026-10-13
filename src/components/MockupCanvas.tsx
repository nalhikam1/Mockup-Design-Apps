import React, { useRef, useState, useEffect, useCallback } from 'react';
import { MockupProduct, LogoTransform, SceneEnvironment } from '../types/mockup';
import { Maximize2, RotateCw, ZoomIn, Eye, Move } from 'lucide-react';

interface MockupCanvasProps {
  product: MockupProduct;
  logoUrl: string | null;
  productColor: string;
  scene: SceneEnvironment;
  transform: LogoTransform;
  onTransformChange: (newTransform: LogoTransform) => void;
  showGuides?: boolean;
  onExportReady?: (exportFn: (scale?: number, format?: 'image/png' | 'image/jpeg') => Promise<string>) => void;
}

export const MockupCanvas: React.FC<MockupCanvasProps> = ({
  product,
  logoUrl,
  productColor,
  scene,
  transform,
  onTransformChange,
  showGuides = true,
  onExportReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; initialX: number; initialY: number } | null>(null);

  // Logo position calculation within print area
  const printArea = product.printArea;
  const printCenterX = printArea.x + printArea.width / 2;
  const printCenterY = printArea.y + printArea.height / 2;

  // Actual logo center in SVG coordinate system (0 to 100)
  const logoCenterX = printCenterX + (transform.x / 100) * printArea.width;
  const logoCenterY = printCenterY + (transform.y / 100) * printArea.height;
  const logoWidth = printArea.width * transform.scale;
  const logoHeight = printArea.height * transform.scale;

  // Handle direct on-canvas drag
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!logoUrl) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialX: transform.x,
      initialY: transform.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPixels = e.clientX - dragStart.x;
    const deltaYPixels = e.clientY - dragStart.y;

    // Convert pixel delta into percentage offset of printArea
    const svgPixelWidth = rect.width;
    const svgPixelHeight = rect.height;
    const deltaXPercent = (deltaXPixels / svgPixelWidth) * (100 / (printArea.width / 100));
    const deltaYPercent = (deltaYPixels / svgPixelHeight) * (100 / (printArea.height / 100));

    const newX = Math.max(-50, Math.min(50, dragStart.initialX + deltaXPercent));
    const newY = Math.max(-50, Math.min(50, dragStart.initialY + deltaYPercent));

    onTransformChange({
      ...transform,
      x: Math.round(newX * 10) / 10,
      y: Math.round(newY * 10) / 10,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Export to high-res canvas callback
  const exportMockup = useCallback(
    async (scale = 2, format: 'image/png' | 'image/jpeg' = 'image/png'): Promise<string> => {
      if (!svgRef.current) throw new Error('SVG not ready');

      const svgElement = svgRef.current;
      const svgXml = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobUrl = URL.createObjectURL(svgBlob);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const exportCanvas = document.createElement('canvas');
          const baseWidth = 1000;
          const baseHeight = 1000;
          exportCanvas.width = baseWidth * scale;
          exportCanvas.height = baseHeight * scale;
          const ctx = exportCanvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context failed'));
            return;
          }

          if (format === 'image/jpeg' || scene.surfaceType !== 'transparent') {
            // Fill background if jpeg or non-transparent
            ctx.fillStyle = scene.surfaceType === 'transparent' ? '#ffffff' : '#f1f5f9';
            ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
          }

          ctx.drawImage(img, 0, 0, exportCanvas.width, exportCanvas.height);
          URL.revokeObjectURL(blobUrl);
          const dataUrl = exportCanvas.toDataURL(format, 0.95);
          resolve(dataUrl);
        };
        img.onerror = (err) => {
          URL.revokeObjectURL(blobUrl);
          reject(err);
        };
        img.src = blobUrl;
      });
    },
    [scene]
  );

  useEffect(() => {
    if (onExportReady) {
      onExportReady(exportMockup);
    }
  }, [exportMockup, onExportReady]);

  // CSS blend mode & filter string for the placed logo
  const getFilterStyle = () => {
    if (transform.colorFilter === 'white') {
      return 'brightness(0) invert(1)';
    }
    if (transform.colorFilter === 'black') {
      return 'brightness(0)';
    }
    if (transform.colorFilter === 'tint') {
      return `sepia(1) hue-rotate(180deg) saturate(3)`;
    }
    return 'none';
  };

  // Cylinder perspective warp curve calculation for mug/tumbler
  const curveFactor = product.cylinderDistortion || 0;
  const cylinderTransform = curveFactor > 0
    ? `scale(${1 - Math.abs(transform.x / 100) * curveFactor * 0.4}, 1)`
    : '';

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-square max-h-[640px] mx-auto rounded-2xl overflow-hidden shadow-2xl select-none transition-colors duration-500 flex items-center justify-center ${scene.backgroundClass}`}
      style={{
        backgroundImage: scene.surfaceType === 'transparent'
          ? 'radial-gradient(#cbd5e1 1px, transparent 1px)'
          : undefined,
        backgroundSize: scene.surfaceType === 'transparent' ? '16px 16px' : undefined,
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle noise for fabric texture */}
          <filter id="fabricWeave" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.08 0" />
            <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
          </filter>

          {/* Ceramic gloss reflection gradient */}
          <linearGradient id="ceramicGloss" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
            <stop offset="12%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.0" />
            <stop offset="88%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>

          {/* Tumbler metallic sheen */}
          <linearGradient id="metallicSheen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
            <stop offset="15%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.15" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
          </linearGradient>

          {/* T-Shirt fabric fold shadow overlay */}
          <linearGradient id="tshirtShading" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="45%" stopColor="#000000" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
          </linearGradient>

          {/* Drop shadow on ground */}
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#0f172a" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
          </radialGradient>

          {/* Clip paths for products to cleanly restrict print area if needed */}
          <clipPath id="mugPrintClip">
            <path d="M 28 26 C 28 23 72 23 72 26 L 70 78 C 70 82 30 82 30 78 Z" />
          </clipPath>
          <clipPath id="tumblerPrintClip">
            <path d="M 33 22 L 67 22 L 64 82 C 64 84 36 84 36 82 Z" />
          </clipPath>
          <clipPath id="totePrintClip">
            <rect x="25" y="32" width="50" height="50" rx="3" />
          </clipPath>
          <clipPath id="notebookPrintClip">
            <rect x="28" y="20" width="44" height="60" rx="2" />
          </clipPath>
        </defs>

        {/* ========================================================
            BASE SHADOW UNDER PRODUCT
        ======================================================== */}
        {product.id === 'mug-ceramic' && (
          <ellipse cx="50" cy="85" rx="28" ry="6" fill="url(#groundShadow)" />
        )}
        {product.id === 'tumbler-flask' && (
          <ellipse cx="50" cy="86" rx="20" ry="4.5" fill="url(#groundShadow)" />
        )}
        {(product.id === 'tshirt-crew' || product.id === 'hoodie-pullover') && (
          <ellipse cx="50" cy="89" rx="34" ry="5.5" fill="url(#groundShadow)" />
        )}
        {product.id === 'tote-bag' && (
          <ellipse cx="50" cy="86" rx="30" ry="5" fill="url(#groundShadow)" />
        )}
        {product.id === 'notebook-hardcover' && (
          <ellipse cx="50" cy="84" rx="26" ry="4" fill="url(#groundShadow)" />
        )}
        {product.id === 'cap-baseball' && (
          <ellipse cx="50" cy="80" rx="26" ry="6" fill="url(#groundShadow)" />
        )}

        {/* ========================================================
            PRODUCT 1: CERAMIC COFFEE MUG
        ======================================================== */}
        {product.id === 'mug-ceramic' && (
          <g id="product-mug">
            {/* Mug Handle (drawn behind or to side) */}
            <path
              d="M 68 34 C 84 34 85 66 67 68 L 65 62 C 77 60 76 40 66 40 Z"
              fill={productColor}
              stroke="#000000"
              strokeOpacity="0.15"
              strokeWidth="0.5"
            />
            {/* Handle inner shadow */}
            <path
              d="M 68 34 C 84 34 85 66 67 68"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.22"
              strokeWidth="1.2"
            />

            {/* Mug Outer Body */}
            <path
              d="M 28 26 C 28 22 72 22 72 26 L 70 78 C 70 83 30 83 30 78 Z"
              fill={productColor}
            />

            {/* Mug Rim Oval (Top Opening) */}
            <ellipse cx="50" cy="26" rx="22" ry="4.8" fill={productColor} />
            <ellipse
              cx="50"
              cy="26"
              rx="20"
              ry="4"
              fill="#1e1814"
              opacity="0.88"
            />
            {/* Coffee Liquid Surface */}
            <ellipse
              cx="50"
              cy="27"
              rx="18"
              ry="3.3"
              fill="#2c1a0e"
            />
            <ellipse
              cx="52"
              cy="26.6"
              rx="12"
              ry="1.8"
              fill="#3e2718"
              opacity="0.8"
            />

            {/* Mug Bottom Bevel Oval */}
            <path
              d="M 30 78 C 30 83 70 83 70 78 C 70 81 30 81 30 78 Z"
              fill="#000000"
              opacity="0.2"
            />
          </g>
        )}

        {/* ========================================================
            PRODUCT 2: T-SHIRT (CREWNECK)
        ======================================================== */}
        {product.id === 'tshirt-crew' && (
          <g id="product-tshirt">
            {/* T-Shirt Silhouette */}
            <path
              d="M 37 16 C 44 21 56 21 63 16 L 82 24 L 75 39 L 69 35 L 69 82 C 69 84 31 84 31 82 L 31 35 L 25 39 L 18 24 Z"
              fill={productColor}
            />
            {/* Back neck inner curve */}
            <path
              d="M 40 18 C 45 22 55 22 60 18 C 56 16 44 16 40 18 Z"
              fill="#000000"
              opacity="0.25"
            />
            {/* Ribbed Collar */}
            <path
              d="M 38 17 C 44 24 56 24 62 17 C 60 19 40 19 38 17 Z"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.2"
              strokeWidth="1.2"
            />
            {/* Sleeve stitching seams */}
            <path d="M 69 35 L 75 39" stroke="#000000" strokeOpacity="0.15" strokeWidth="0.6" strokeDasharray="1 0.6" />
            <path d="M 31 35 L 25 39" stroke="#000000" strokeOpacity="0.15" strokeWidth="0.6" strokeDasharray="1 0.6" />
            {/* Bottom Hem Seam */}
            <line x1="31" y1="80" x2="69" y2="80" stroke="#000000" strokeOpacity="0.12" strokeWidth="0.6" strokeDasharray="1.2 0.6" />
            {/* Natural side folds */}
            <path d="M 31 45 C 33 55 32 68 31 75" fill="none" stroke="#000000" strokeOpacity="0.14" strokeWidth="0.8" />
            <path d="M 69 45 C 67 55 68 68 69 75" fill="none" stroke="#000000" strokeOpacity="0.14" strokeWidth="0.8" />
          </g>
        )}

        {/* ========================================================
            PRODUCT 3: PULLOVER HOODIE
        ======================================================== */}
        {product.id === 'hoodie-pullover' && (
          <g id="product-hoodie">
            {/* Main Body */}
            <path
              d="M 34 18 L 44 24 L 56 24 L 66 18 L 84 27 L 76 44 L 69 40 L 70 82 C 70 84 30 84 30 82 L 31 40 L 24 44 L 16 27 Z"
              fill={productColor}
            />
            {/* Hood Silhouette */}
            <path
              d="M 34 18 C 34 10 66 10 66 18 C 58 14 42 14 34 18 Z"
              fill={productColor}
              stroke="#000000"
              strokeOpacity="0.2"
              strokeWidth="0.8"
            />
            {/* Hood Collar Opening */}
            <path
              d="M 42 18 C 44 26 56 26 58 18 C 52 23 48 23 42 18 Z"
              fill="#000000"
              opacity="0.3"
            />
            {/* Kangaroo Front Pocket */}
            <path
              d="M 37 60 L 63 60 L 67 76 L 33 76 Z"
              fill={productColor}
              stroke="#000000"
              strokeOpacity="0.18"
              strokeWidth="0.8"
            />
            {/* Drawstrings */}
            <path d="M 46 22 Q 45 32 44 38" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="0.9" />
            <circle cx="44" cy="38.5" r="0.8" fill="#a1a1aa" />
            <path d="M 54 22 Q 55 31 56 37" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="0.9" />
            <circle cx="56" cy="37.5" r="0.8" fill="#a1a1aa" />
            {/* Ribbed Bottom Band */}
            <rect x="30" y="80" width="40" height="3.5" fill="#000000" opacity="0.1" />
          </g>
        )}

        {/* ========================================================
            PRODUCT 4: CANVAS TOTE BAG
        ======================================================== */}
        {product.id === 'tote-bag' && (
          <g id="product-tote">
            {/* Dual Shoulder Straps */}
            <path
              d="M 36 34 C 36 12 42 12 42 34"
              fill="none"
              stroke={productColor}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 36 34 C 36 12 42 12 42 34"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.2"
              strokeWidth="1"
            />
            <path
              d="M 58 34 C 58 12 64 12 64 34"
              fill="none"
              stroke={productColor}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 58 34 C 58 12 64 12 64 34"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.2"
              strokeWidth="1"
            />

            {/* Bag Body Rectangle with soft corners */}
            <rect x="25" y="32" width="50" height="52" rx="3.5" fill={productColor} />
            {/* Top Hem fold */}
            <rect x="25" y="32" width="50" height="3.5" fill="#000000" opacity="0.12" />
            {/* Side Gusset stitch lines */}
            <line x1="28" y1="36" x2="28" y2="81" stroke="#000000" strokeOpacity="0.1" strokeDasharray="1.5 1" />
            <line x1="72" y1="36" x2="72" y2="81" stroke="#000000" strokeOpacity="0.1" strokeDasharray="1.5 1" />
            <line x1="26" y1="82" x2="74" y2="82" stroke="#000000" strokeOpacity="0.15" strokeDasharray="1.5 1" />
          </g>
        )}

        {/* ========================================================
            PRODUCT 5: STAINLESS INSULATED TUMBLER
        ======================================================== */}
        {product.id === 'tumbler-flask' && (
          <g id="product-tumbler">
            {/* Tumbler Lid */}
            <rect x="36" y="18" width="28" height="4.5" rx="1.5" fill="#18181b" />
            <rect x="38" y="16" width="24" height="2.5" rx="1" fill="#3f3f46" />
            {/* Steel Top Ring */}
            <rect x="34" y="22.5" width="32" height="1.8" fill="#e2e8f0" />
            {/* Main Flask Body (Tapered) */}
            <path
              d="M 34 24.3 L 66 24.3 L 63 82 C 63 85 37 85 37 82 Z"
              fill={productColor}
            />
            {/* Base Ring */}
            <path
              d="M 37 82 C 37 84.5 63 84.5 63 82"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.25"
              strokeWidth="1"
            />
          </g>
        )}

        {/* ========================================================
            PRODUCT 6: BASEBALL CAP / DAD HAT
        ======================================================== */}
        {product.id === 'cap-baseball' && (
          <g id="product-cap">
            {/* Curved Visor / Bill */}
            <path
              d="M 22 58 C 30 76 70 76 78 58 C 72 54 28 54 22 58 Z"
              fill={productColor}
              stroke="#000000"
              strokeOpacity="0.18"
              strokeWidth="0.8"
            />
            {/* Visor stitching arcs */}
            <path d="M 28 60 C 35 70 65 70 72 60" fill="none" stroke="#000000" strokeOpacity="0.15" strokeWidth="0.5" strokeDasharray="1.2 0.8" />
            <path d="M 32 62 C 38 71 62 71 68 62" fill="none" stroke="#000000" strokeOpacity="0.15" strokeWidth="0.5" strokeDasharray="1.2 0.8" />

            {/* Cap Crown / Dome */}
            <path
              d="M 26 56 C 24 30 76 30 74 56 C 70 54 30 54 26 56 Z"
              fill={productColor}
            />
            {/* Crown center seam */}
            <path d="M 50 29 L 50 54" stroke="#000000" strokeOpacity="0.18" strokeWidth="0.6" />
            {/* Top button (Squatchee) */}
            <circle cx="50" cy="28.5" r="2.2" fill={productColor} stroke="#000000" strokeOpacity="0.25" strokeWidth="0.5" />
            {/* Ventilation eyelet */}
            <circle cx="40" cy="40" r="1.1" fill="none" stroke="#000000" strokeOpacity="0.3" strokeWidth="0.6" />
            <circle cx="60" cy="40" r="1.1" fill="none" stroke="#000000" strokeOpacity="0.3" strokeWidth="0.6" />
          </g>
        )}

        {/* ========================================================
            PRODUCT 7: HARDCOVER NOTEBOOK
        ======================================================== */}
        {product.id === 'notebook-hardcover' && (
          <g id="product-notebook">
            {/* Pages Edge (Right Side Thickness) */}
            <rect x="70" y="21" width="3" height="58" rx="0.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
            <line x1="71.5" y1="22" x2="71.5" y2="78" stroke="#94a3b8" strokeWidth="0.4" strokeDasharray="0.8 0.6" />

            {/* Main Hardcover Front */}
            <rect x="27" y="19" width="44" height="62" rx="2.5" fill={productColor} />
            {/* Spine indent line */}
            <line x1="31" y1="19" x2="31" y2="81" stroke="#000000" strokeOpacity="0.28" strokeWidth="0.9" />

            {/* Elastic Closure Band */}
            <rect x="64" y="19" width="3" height="62" fill="#18181b" opacity="0.85" rx="0.5" />
            <line x1="64" y1="19" x2="64" y2="81" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="0.4" />
          </g>
        )}

        {/* ========================================================
            PRODUCT 8: DIE-CUT VINYL STICKER
        ======================================================== */}
        {product.id === 'sticker-diecut' && (
          <g id="product-sticker">
            {/* Laptop Surface Mockup Background */}
            <rect x="15" y="15" width="70" height="70" rx="6" fill="#334155" opacity="0.65" />
            {/* Surface keyboard keys hint */}
            <rect x="18" y="18" width="64" height="4" rx="1" fill="#1e293b" opacity="0.5" />

            {/* Die Cut White Border Base */}
            <circle cx="50" cy="50" r="23" fill={productColor} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))" />
            <circle cx="50" cy="50" r="21.5" fill="none" stroke="#000000" strokeOpacity="0.08" strokeWidth="0.5" />
          </g>
        )}

        {/* ========================================================
            LOGO PRINT AREA & PLACED LOGO
        ======================================================== */}
        <g id="logo-layer" clipPath={product.id === 'mug-ceramic' ? 'url(#mugPrintClip)' : undefined}>
          {/* Guide frame when toggled */}
          {showGuides && (
            <rect
              x={printArea.x}
              y={printArea.y}
              width={printArea.width}
              height={printArea.height}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.4"
              strokeDasharray="1.5 1"
              opacity="0.6"
            />
          )}

          {logoUrl ? (
            <g
              transform={`translate(${logoCenterX}, ${logoCenterY}) rotate(${transform.rotation}) ${cylinderTransform}`}
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                mixBlendMode: transform.blendMode,
                opacity: transform.opacity,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Placed Logo Image */}
              <image
                href={logoUrl}
                x={-logoWidth / 2}
                y={-logoHeight / 2}
                width={logoWidth}
                height={logoHeight}
                preserveAspectRatio="xMidYMid meet"
                style={{
                  filter: getFilterStyle(),
                  transform: `${transform.horizontalFlip ? 'scaleX(-1)' : ''} ${transform.verticalFlip ? 'scaleY(-1)' : ''}`,
                }}
              />

              {/* Interactive Bounding Box Indicator */}
              {showGuides && (
                <rect
                  x={-logoWidth / 2}
                  y={-logoHeight / 2}
                  width={logoWidth}
                  height={logoHeight}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="0.4"
                  strokeDasharray="1 1"
                  pointerEvents="none"
                />
              )}
            </g>
          ) : (
            /* Empty state placeholder inside print area */
            <g
              transform={`translate(${printCenterX}, ${printCenterY})`}
              className="pointer-events-none"
            >
              <rect
                x={-printArea.width * 0.4}
                y={-printArea.height * 0.35}
                width={printArea.width * 0.8}
                height={printArea.height * 0.7}
                rx="2"
                fill="#ffffff"
                fillOpacity="0.2"
                stroke="#3b82f6"
                strokeWidth="0.4"
                strokeDasharray="1 1"
              />
              <text
                x="0"
                y="1"
                fontSize="2.8"
                fontWeight="600"
                fill="#64748b"
                textAnchor="middle"
              >
                Upload Logo
              </text>
            </g>
          )}
        </g>

        {/* ========================================================
            REALISTIC SHADING / SPECULAR HIGHLIGHT OVERLAYS
            (Rendered on top of logo so it bends realistically into the material)
        ======================================================== */}
        {product.id === 'mug-ceramic' && (
          <path
            d="M 28 26 C 28 22 72 22 72 26 L 70 78 C 70 83 30 83 30 78 Z"
            fill="url(#ceramicGloss)"
            style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }}
          />
        )}
        {product.id === 'tumbler-flask' && (
          <path
            d="M 34 24.3 L 66 24.3 L 63 82 C 63 85 37 85 37 82 Z"
            fill="url(#metallicSheen)"
            style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }}
          />
        )}
        {(product.id === 'tshirt-crew' || product.id === 'hoodie-pullover') && (
          <rect
            x="15"
            y="15"
            width="70"
            height="70"
            fill="url(#tshirtShading)"
            style={{ mixBlendMode: 'multiply', pointerEvents: 'none' }}
          />
        )}
        {product.fabricTexture && (
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            filter="url(#fabricWeave)"
            style={{ mixBlendMode: 'multiply', pointerEvents: 'none', opacity: 0.5 }}
          />
        )}
      </svg>

      {/* Floating Canvas Quick Controls badge */}
      <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-2 shadow-sm pointer-events-none">
        <Move className="w-3.5 h-3.5 text-blue-500" />
        <span>Click & drag logo to reposition</span>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-wider">
          {product.shortName}
        </span>
      </div>
    </div>
  );
};
