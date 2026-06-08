/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Spot, Category } from '../types';
import { MapPin, RotateCw, Layers, Plus, Compass, Sparkles, Navigation, Info } from 'lucide-react';

interface MapContainerProps {
  spots: Spot[];
  selectedSpot: Spot | null;
  onSelectSpot: (spot: Spot) => void;
  isAdmin: boolean;
  onAddSpotClick: (x: number, y: number) => void;
  selectedCategory: string | null;
  categories: Category[];
}

export default function MapContainer({
  spots,
  selectedSpot,
  onSelectSpot,
  isAdmin,
  onAddSpotClick,
  selectedCategory,
  categories,
}: MapContainerProps) {
  const [imageError, setImageError] = useState(false);
  
  // Aspect ratio / Dimension calculations
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({ width: 768, height: 1396 }); // standard vertical rindo school map default aspect ratio
  const [containerSize, setContainerSize] = useState({ width: 600, height: 800 });
  
  // Auto-rotation states - enabled by default per user's requests!
  const [autoRotate, setAutoRotate] = useState(true);
  const [manualRotation, setManualRotation] = useState<0 | 90 | 180 | 270>(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan states for campus exploration
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0, dragged: false });

  // Custom Zoom controller handler with precise clamping and mouse-anchor-preserving focus
  const handleZoom = (direction: 'in' | 'out' | 'reset', mx_rel = 0, my_rel = 0, zoomStep = 0.5) => {
    setZoom((prev) => {
      let nextScale = prev.scale;
      if (direction === 'in') {
        nextScale = Math.min(5, prev.scale + zoomStep);
      } else if (direction === 'out') {
        nextScale = Math.max(1, prev.scale - zoomStep);
      } else {
        nextScale = 1;
      }

      nextScale = parseFloat(nextScale.toFixed(2));

      if (nextScale <= 1.05) {
        return { scale: 1, x: 0, y: 0 };
      }

      // Clamp existing pan to the new scale boundary while shifting center anchor
      const maxPanX = (canvasWidth * nextScale - canvasWidth) / 2;
      const maxPanY = (canvasHeight * nextScale - canvasHeight) / 2;

      const ratio = nextScale / prev.scale;
      const nextOffsetX = mx_rel * (1 - ratio) + prev.x * ratio;
      const nextOffsetY = my_rel * (1 - ratio) + prev.y * ratio;

      return {
        scale: nextScale,
        x: Math.max(-maxPanX, Math.min(maxPanX, nextOffsetX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, nextOffsetY)),
      };
    });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Left click only
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: zoom.x,
      offsetY: zoom.y,
      dragged: false,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Keep hover pointer tracking active for administrative coordinate tooltips
    handleCanvasMouseMove(e);

    if (!isPanning) return;

    const dx_screen = e.clientX - panStartRef.current.x;
    const dy_screen = e.clientY - panStartRef.current.y;

    if (Math.hypot(dx_screen, dy_screen) > 4) {
      panStartRef.current.dragged = true;
    }

    // Adapt drag coordinates depending on rotation alignment
    let local_dx = dx_screen;
    let local_dy = dy_screen;

    if (rotation === 90) {
      local_dx = dy_screen;
      local_dy = -dx_screen;
    } else if (rotation === 180) {
      local_dx = -dx_screen;
      local_dy = -dy_screen;
    } else if (rotation === 270) {
      local_dx = -dy_screen;
      local_dy = dx_screen;
    }

    const nextOffsetX = panStartRef.current.offsetX + local_dx;
    const nextOffsetY = panStartRef.current.offsetY + local_dy;

    const maxPanX = (canvasWidth * zoom.scale - canvasWidth) / 2;
    const maxPanY = (canvasHeight * zoom.scale - canvasHeight) / 2;

    setZoom((prev) => ({
      ...prev,
      x: Math.max(-maxPanX, Math.min(maxPanX, nextOffsetX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, nextOffsetY)),
    }));
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Mobile Touch Pan Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsPanning(true);
    panStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      offsetX: zoom.x,
      offsetY: zoom.y,
      dragged: false,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPanning || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx_screen = touch.clientX - panStartRef.current.x;
    const dy_screen = touch.clientY - panStartRef.current.y;

    if (Math.hypot(dx_screen, dy_screen) > 4) {
      panStartRef.current.dragged = true;
    }

    let local_dx = dx_screen;
    let local_dy = dy_screen;

    if (rotation === 90) {
      local_dx = dy_screen;
      local_dy = -dx_screen;
    } else if (rotation === 180) {
      local_dx = -dx_screen;
      local_dy = -dy_screen;
    } else if (rotation === 270) {
      local_dx = -dy_screen;
      local_dy = dx_screen;
    }

    const nextOffsetX = panStartRef.current.offsetX + local_dx;
    const nextOffsetY = panStartRef.current.offsetY + local_dy;

    const maxPanX = (canvasWidth * zoom.scale - canvasWidth) / 2;
    const maxPanY = (canvasHeight * zoom.scale - canvasHeight) / 2;

    setZoom((prev) => ({
      ...prev,
      x: Math.max(-maxPanX, Math.min(maxPanX, nextOffsetX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, nextOffsetY)),
    }));
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };
  
  // ResizeObserver to track container container boundaries dynamically in real-time
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setContainerSize({ width, height });
      }
    });
    
    observer.observe(containerRef.current);
    
    // Initial size
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setContainerSize({ width: rect.width, height: rect.height });
    }
    
    return () => observer.disconnect();
  }, []);

  // Update natural dimensions when image loads
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setImgNaturalSize({ width: naturalWidth, height: naturalHeight });
    }
  };

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      if (naturalWidth && naturalHeight) {
        setImgNaturalSize({ width: naturalWidth, height: naturalHeight });
      }
    }
  }, []);

  // Calculate dynamic rotation based on aspect ratio mapping if autoRotate is active
  const isImageNaturallyPortrait = imgNaturalSize.height > imgNaturalSize.width;
  const isContainerPortrait = containerSize.height > containerSize.width;

  const rotation = autoRotate
    ? (isContainerPortrait !== isImageNaturallyPortrait ? 90 : 0)
    : manualRotation;

  // Active Dimensions fitting calculations (Prismatic layout fit)
  const imageRatio = imgNaturalSize.width / imgNaturalSize.height;
  const isRotated = rotation === 90 || rotation === 270;

  let canvasWidth = 0;
  let canvasHeight = 0;

  const CW = containerSize.width;
  const CH = containerSize.height;

  if (!isRotated) {
    // Fit unrotated Aspect Ratio Ratio R = width/height in parent (CW, CH)
    const fitHeightBased = CW / imageRatio;
    if (fitHeightBased <= CH) {
      canvasWidth = CW;
      canvasHeight = fitHeightBased;
    } else {
      canvasHeight = CH;
      canvasWidth = CH * imageRatio;
    }
  } else {
    // Fit rotated Aspect Ratio (flipped coordinates) 1 / Ratio in parent (CW, CH)
    const effectiveRatio = imgNaturalSize.height / imgNaturalSize.width; // 1 / R
    const fitHeightBased = CW / effectiveRatio;
    
    let effectiveWidth = 0;
    let effectiveHeight = 0;
    
    if (fitHeightBased <= CH) {
      effectiveWidth = CW;
      effectiveHeight = fitHeightBased;
    } else {
      effectiveHeight = CH;
      effectiveWidth = CH * effectiveRatio;
    }
    
    // Swap back to retrieve unrotated canvas size
    canvasWidth = effectiveHeight;
    canvasHeight = effectiveWidth;
  }

  // Native non-passive Wheel listener to bypass React's standard passive constraints (prevents entire browser/page zooming)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault(); // Stop entire page zoom/scrolling
      const isZoomIn = e.deltaY < 0;

      // Calculate mouse position relative to the unrotated canvas center space
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx_screen = e.clientX - centerX;
      const dy_screen = e.clientY - centerY;

      let mx_rel = dx_screen;
      let my_rel = dy_screen;

      if (rotation === 90) {
        mx_rel = dy_screen;
        my_rel = -dx_screen;
      } else if (rotation === 180) {
        mx_rel = -dx_screen;
        my_rel = -dy_screen;
      } else if (rotation === 270) {
        mx_rel = -dy_screen;
        my_rel = dx_screen;
      }

      handleZoom(isZoomIn ? 'in' : 'out', mx_rel, my_rel, 0.25);
    };

    canvas.addEventListener('wheel', onWheelNative, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', onWheelNative);
    };
  }, [canvasWidth, canvasHeight, rotation]);

  // Filter spots based on current promise classification
  const filteredSpots = selectedCategory
    ? spots.filter((s) => s.category === selectedCategory)
    : spots;

  // Precise Click-to-Coordinate placement taking zoom/pan layers into account
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Skip if finished a map drag exploration
    if (panStartRef.current.dragged) {
      panStartRef.current.dragged = false;
      return;
    }

    if (!isAdmin) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    // Calculate normalized position [0 - 1] relative to current onscreen bounds
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;

    let x = normX;
    let y = normY;

    // Apply inverse coordinate rotation
    if (rotation === 90) {
      x = normY;
      y = 1 - normX;
    } else if (rotation === 180) {
      x = 1 - normX;
      y = 1 - normY;
    } else if (rotation === 270) {
      x = 1 - normY;
      y = normX;
    }

    // Reconstruct coordinate before zoom & panning logic in local unrotated canvas space
    const tx_norm = zoom.x / canvasWidth;
    const ty_norm = zoom.y / canvasHeight;

    const baseMapX = 0.5 + (x - 0.5 - tx_norm) / zoom.scale;
    const baseMapY = 0.5 + (y - 0.5 - ty_norm) / zoom.scale;

    // Convert to percentage with 2 decimal accuracy (0.01% resolution)
    const finalX = parseFloat((baseMapX * 100).toFixed(2));
    const finalY = parseFloat((baseMapY * 100).toFixed(2));

    if (finalX >= 0 && finalX <= 100 && finalY >= 0 && finalY <= 100) {
      onAddSpotClick(finalX, finalY);
    }
  };

  // Hover tracker inside canvas for real-time administrator precision coordinates placement feedback
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAdmin) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;

    let x = normX;
    let y = normY;

    if (rotation === 90) {
      x = normY;
      y = 1 - normX;
    } else if (rotation === 180) {
      x = 1 - normX;
      y = 1 - normY;
    } else if (rotation === 270) {
      x = 1 - normY;
      y = normX;
    }

    // Reconstruct coordinate before zoom & panning logic in local unrotated canvas space
    const tx_norm = zoom.x / canvasWidth;
    const ty_norm = zoom.y / canvasHeight;

    const baseMapX = 0.5 + (x - 0.5 - tx_norm) / zoom.scale;
    const baseMapY = 0.5 + (y - 0.5 - ty_norm) / zoom.scale;

    setHoverPosition({
      x: parseFloat((baseMapX * 100).toFixed(2)),
      y: parseFloat((baseMapY * 100).toFixed(2)),
    });
  };

  const handleCanvasMouseLeave = () => {
    setHoverPosition(null);
  };

  // Pin category styling maps
  const getCategoryColor = (category: string) => {
    const matchedCategory = categories.find((c) => c.id === category);
    const colorScheme = matchedCategory ? matchedCategory.color : 'rose';
    
    switch (colorScheme) {
      case 'indigo':
        return {
          bg: 'bg-indigo-500',
          ring: 'ring-indigo-500/30',
          text: 'text-indigo-500 hover:text-white',
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-500',
          ring: 'ring-emerald-500/30',
          text: 'text-emerald-500 hover:text-white',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500',
          ring: 'ring-amber-500/30',
          text: 'text-amber-500 hover:text-white',
        };
      case 'violet':
        return {
          bg: 'bg-violet-500',
          ring: 'ring-violet-500/30',
          text: 'text-violet-500 hover:text-white',
        };
      case 'teal':
        return {
          bg: 'bg-teal-500',
          ring: 'ring-teal-500/30',
          text: 'text-teal-500 hover:text-white',
        };
      case 'orange':
        return {
          bg: 'bg-orange-500',
          ring: 'ring-orange-500/30',
          text: 'text-orange-500 hover:text-white',
        };
      case 'fuchsia':
        return {
          bg: 'bg-fuchsia-500',
          ring: 'ring-fuchsia-500/30',
          text: 'text-fuchsia-500 hover:text-white',
        };
      case 'rose':
      default:
        return {
          bg: 'bg-rose-500',
          ring: 'ring-rose-500/30',
          text: 'text-rose-500 hover:text-white',
        };
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col relative overflow-hidden select-none bg-neutral-100">
      
      {/* Floating Header Panel (Overlaid like Google Maps info panels) */}
      <div className="absolute top-4 left-4 z-20 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-neutral-100/50 p-3 rounded-2xl hidden md:block select-none pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600 animate-pulse">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-neutral-800">
              筑摩野中校内マップ
            </h3>
            <p className="text-[9px] text-neutral-400 mt-0.5 font-medium leading-relaxed flex items-center gap-1">
              <Info className="w-3 h-3 text-neutral-400 shrink-0" />
              <span>
                {isAdmin 
                  ? '管理者モード: 任意の場所をクリックして新しい口コミスポットを配置' 
                  : 'マップ上のカラーピンをタップすると口コミを閲覧・追加できます'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Floating Categories legend - Top Right Overlay */}
      <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md shadow-md border border-neutral-100/50 p-2.5 rounded-2xl flex flex-col gap-1.5 text-[9px] font-bold text-neutral-600 pointer-events-auto">
        <span className="text-[8px] uppercase tracking-wider text-neutral-400 border-b pb-1">カテゴリー</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>ステージ発表</span>
        </div>
        <div className="flex items-center gap-1.5 flex-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>展示企画</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>模擬店・おやき</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>特別催し物</span>
        </div>
      </div>

      {/* Main viewport containing the exact-bounded image with no drift */}
      <div className="flex-grow w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden touch-none">
        
        {/* Exact-Bounded Canvas with aspect preservation and transform-free drift proofing */}
        <div 
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleCanvasMouseLeave();
            handleMouseUp();
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative transition-all duration-[600ms] ease-out select-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[24px] border-4 border-white bg-white group select-none overflow-hidden touch-none ${
            isAdmin ? 'cursor-crosshair' : 'cursor-default'
          }`}
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          
          {/* Zoom and Pan translation layer */}
          <div
            className="w-full h-full relative"
            style={{
              transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Main School Map Image */}
            {!imageError ? (
              <img
                ref={imgRef}
                src="/map.png"
                onLoad={handleImageLoad}
                onError={() => setImageError(true)}
                alt="Chikumano Rindoufes Map"
                className="w-full h-full object-fill pointer-events-none select-none select-none-drag"
                referrerPolicy="no-referrer"
              />
            ) : (
              /* Simple placeholder if map.png fails to load */
              <div className="w-full h-full bg-neutral-50 relative text-neutral-600 flex flex-col items-center justify-center p-6 select-none">
                <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                  <Compass className="w-10 h-10 text-neutral-400 mb-3 animate-spin-slow" />
                  <h4 className="font-bold text-xs text-neutral-800">校内マップを読み込み中</h4>
                  <p className="text-[10px] text-neutral-400 mt-2 leading-relaxed">
                    校内マップ画像（<code className="text-indigo-600 font-mono bg-indigo-50 px-1 py-0.5 rounded">public/map.png</code>）を読み込んでいます。画像が表示されない場合は、ファイルの配置をご確認ください。
                  </p>
                </div>
              </div>
            )}

            {/* SPOT HOTSPOT PINS - Rendered under unrotated local coordinates */}
            {filteredSpots.map((spot) => {
              const isSelected = selectedSpot?.id === spot.id;
              const colors = getCategoryColor(spot.category);
              
              return (
                <div
                  key={spot.id}
                  style={{
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    // Crucial: rotate pin back so they stay physically upright regardless of current image rotation coordinates!
                    // Plus: compensate scale so markers don't blow up in sizes when zoomed in
                    transform: `translate(-50%, -50%) rotate(${-rotation}deg) scale(${1 / Math.max(1, zoom.scale)})`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Stop click pass-through to canvas click
                    onSelectSpot(spot);
                  }}
                  className="absolute z-20 group cursor-pointer"
                >
                  {/* Visual pulsating aura ring */}
                  <div className={`absolute -inset-3.5 rounded-full transition-all duration-300 ${
                    isSelected 
                      ? 'ring-4 ring-rose-400 bg-white/20 scale-125' 
                      : 'group-hover:ring-4 group-hover:ring-indigo-400/20'
                  }`} />

                  {/* Pin element - Highly polished teardrop style */}
                  <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-bold transition-all duration-300 shadow-md ${
                    isSelected 
                      ? 'bg-rose-600 scale-125 animate-bounce' 
                      : `${colors.bg} group-hover:scale-110`
                  }`}>
                    <MapPin className="w-4 h-4 fill-white/10" />
                  </div>

                  {/* Desktop label overlay - Kept perfectly upright */}
                  <div className="absolute top-9 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-neutral-900/90 text-white border border-neutral-700/50 px-2 py-0.5 rounded-md whitespace-nowrap text-[9px] font-bold shadow-md tracking-tight transition-all duration-200 z-30 pointer-events-none flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.bg}`} />
                    <span>{spot.name}</span>
                  </div>
                </div>
              );
            })}

            {/* ADMIN NEW PIN PLACEMENT PRECISION COORDINATES FEEDBACK GRID */}
            {isAdmin && hoverPosition && (
              <div
                style={{
                  left: `${hoverPosition.x}%`,
                  top: `${hoverPosition.y}%`,
                  transform: `translate(-50%, -50%) rotate(${-rotation}deg) scale(${1 / Math.max(1, zoom.scale)})`,
                }}
                className="absolute pointer-events-none z-10 flex flex-col items-center"
              >
                {/* Dynamic Coordinate Crosshairs */}
                <div className="absolute w-[2000px] h-[0.5px] bg-amber-500/30" />
                <div className="absolute h-[2000px] w-[0.5px] bg-amber-500/30" />
                
                <div className="w-5 h-5 rounded-full border border-dashed border-amber-500 flex items-center justify-center animate-spin-slow bg-amber-500/10">
                  <Plus className="w-3.5 h-3.5 text-amber-500" />
                </div>
                
                <span className="mt-2.5 bg-amber-600 text-[8px] font-bold font-mono text-white px-1.5 py-0.5 rounded shadow border border-amber-400 whitespace-nowrap">
                  X: {hoverPosition.x}%, Y: {hoverPosition.y}%
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Floating Toolbar: Zoom, Rotation, Mode selectors, Responsive Auto labels (Google Maps styling) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col md:flex-row items-end md:items-center gap-2 pointer-events-auto select-none">
        
        {/* Dynamic Zoom & Pan Controller */}
        <div className="flex bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-neutral-100 p-0.5 overflow-hidden font-bold">
          <button
            onClick={() => handleZoom('out')}
            disabled={zoom.scale <= 1}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
              zoom.scale <= 1 
                ? 'opacity-40 text-neutral-300 cursor-not-allowed' 
                : 'text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 cursor-pointer'
            }`}
            title="縮小"
          >
            ー
          </button>
          
          <div className="px-2 flex items-center justify-center font-mono text-[10px] font-bold text-neutral-500 border-x border-neutral-100/80 min-w-[50px] whitespace-nowrap">
            {Math.round(zoom.scale * 100)}%
          </div>
          
          <button
            onClick={() => handleZoom('in')}
            disabled={zoom.scale >= 5}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
              zoom.scale >= 5 
                ? 'opacity-40 text-neutral-300 cursor-not-allowed' 
                : 'text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 cursor-pointer'
            }`}
            title="拡大"
          >
            ＋
          </button>

          {zoom.scale > 1 && (
            <button
              onClick={() => handleZoom('reset')}
              className="px-2.5 text-[10px] font-bold text-indigo-100 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shrink-0 transition-all cursor-pointer flex items-center justify-center"
              title="初期サイズに戻す"
            >
              リセット
            </button>
          )}
        </div>

        {/* Dynamic Rotation Mode Controller */}
        <div className="flex bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-neutral-100 p-0.5 overflow-hidden">
          <button
            onClick={() => {
              setAutoRotate(true);
            }}
            className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all duration-200 flex items-center gap-1 ${
              autoRotate 
                ? 'bg-indigo-600 text-white' 
                : 'text-neutral-500 hover:text-neutral-900 bg-transparent'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>自動回転: オン</span>
          </button>
          <button
            onClick={() => {
              setAutoRotate(false);
              setManualRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270);
            }}
            className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all duration-200 flex items-center gap-1 ${
              !autoRotate 
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700' 
                : 'text-neutral-400 hover:text-neutral-900'
            }`}
            title="手動で回転を切り替えます"
          >
            <RotateCw className="w-2.5 h-2.5 animate-spin-slow" />
            <span>手動回転 ({manualRotation}°)</span>
          </button>
        </div>

      </div>

    </div>
  );
}
