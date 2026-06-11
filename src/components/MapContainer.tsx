import React, { useState, useRef, useEffect } from 'react';
import { Spot, Category } from '../types';
import { MapPin, RotateCw, Layers, Plus, Compass, Sparkles, Navigation, Info, Locate } from 'lucide-react';

interface MapContainerProps {
  spots: Spot[];
  selectedSpot: Spot | null;
  onSelectSpot: (spot: Spot) => void;
  isAdmin: boolean;
  onAddSpotClick: (x: number, y: number) => void;
  selectedCategory: string | null;
  categories: Category[];
  isMobileDrawerExpanded: boolean;
}

// 筑摩野中学校の航空写真の緯度経度境界（およそ敷地全体をフィットするおよそ0.01%の比率マッピング）
const CHIKUMANO_BOUNDS = {
  north: 36.186100, // マップ画像の上端
  south: 36.184100, // マップ画像の下端
  west: 137.964400, // マップ画像の左端
  east: 137.967150  // マップ画像の右端
};

// 疑似体験用のシミュレーション（デモGPSスポット）
const DEMO_LOCATIONS = [
  { name: 'メイン入場口前', lat: 36.184350, lng: 137.964720, desc: '筑摩野中へのメインゲート。模擬店の甘い香りが漂い、受付テントが設置されています。' },
  { name: '第1グラウンド（模擬店群）', lat: 36.184850, lng: 137.965400, desc: '焼きそばや綿あめ、ポップコーンなど人気のクラス出店テントがずらりと並んで大賑わいです。' },
  { name: '体育館（ステージ発表）', lat: 36.185250, lng: 137.965900, desc: '吹奏楽部や有志バンドの熱い演奏、演劇部による迫真の劇が上演中。拍手喝采が響いています。' },
  { name: '北校舎1階フロア（展示）', lat: 36.185705, lng: 137.966320, desc: '理科の自由研究や、美術の授業、写真部によるフォトギャラリーが美しい照明で展示されています。' },
];

export default function MapContainer({
  spots,
  selectedSpot,
  onSelectSpot,
  isAdmin,
  onAddSpotClick,
  selectedCategory,
  categories,
  isMobileDrawerExpanded,
}: MapContainerProps) {
  const [imageError, setImageError] = useState(false);
  
  // Aspect ratio / Dimension calculations
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({ width: 768, height: 1396 });
  const [containerSize, setContainerSize] = useState({ width: 600, height: 800 });
  
  // Auto-rotation states
  const [autoRotate, setAutoRotate] = useState(true);
  const [manualRotation, setManualRotation] = useState<0 | 90 | 180 | 270>(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan states
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // GPS / Location states
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ x: number; y: number; lat: number; lng: number; isInside: boolean } | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);

  // Auto-shirink map scales
  useEffect(() => {
    if (isMobileDrawerExpanded) {
      setZoom({ scale: 1, x: 0, y: 0 });
    }
  }, [isMobileDrawerExpanded]);

  const panStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0, dragged: false });

  // Convert lat/lng to unrotated x, y percentages of map image boundaries
  const convertLatLngToMapCoords = (lat: number, lng: number) => {
    const { north, south, west, east } = CHIKUMANO_BOUNDS;
    const isInside = lat <= north && lat >= south && lng >= west && lng <= east;
    
    // Normalized ratios
    const x = ((lng - west) / (east - west)) * 100;
    const y = ((north - lat) / (north - south)) * 100;
    
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      isInside
    };
  };

  // Synchronize Geolocation State & Settings
  useEffect(() => {
    let watchId: number | null = null;

    const syncLocationState = () => {
      // 1. Read toggle preferences
      const isGpsToggledOn = localStorage.getItem('rindou-gps-enabled') !== 'false';
      const consentStr = localStorage.getItem('rindou-cookie-consent');
      
      let consentAllows = true;
      if (consentStr) {
        try {
          const parsed = JSON.parse(consentStr);
          if (parsed.geolocation === false) {
            consentAllows = false;
          }
        } catch (e) {}
      }

      const activeEnabled = isGpsToggledOn && consentAllows;
      setGpsEnabled(activeEnabled);

      if (activeEnabled) {
        // Disconnect previous if active
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }

        if (navigator.geolocation) {
          watchId = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const coords = convertLatLngToMapCoords(latitude, longitude);
              
              setCurrentLocation({
                x: coords.x,
                y: coords.y,
                lat: latitude,
                lng: longitude,
                isInside: coords.isInside
              });
            },
            (error) => {
              console.warn("Geolocation tracking error:", error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 5000,
            }
          );
        }
      } else {
        setCurrentLocation(null);
        setDemoMode(false);
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
      }
    };

    syncLocationState();

    window.addEventListener('rindou-settings-updated', syncLocationState);
    return () => {
      window.removeEventListener('rindou-settings-updated', syncLocationState);
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Update position if demoMode triggers or index shifts
  useEffect(() => {
    if (demoMode) {
      const target = DEMO_LOCATIONS[demoIndex];
      const coords = convertLatLngToMapCoords(target.lat, target.lng);
      setCurrentLocation({
        x: coords.x,
        y: coords.y,
        lat: target.lat,
        lng: target.lng,
        isInside: true
      });
    } else {
      // Re-trigger sync to restore real coordinates if available
      window.dispatchEvent(new Event('rindou-settings-updated'));
    }
  }, [demoMode, demoIndex]);

  // Handle zooming
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
    handleCanvasMouseMove(e);

    if (!isPanning) return;

    const dx_screen = e.clientX - panStartRef.current.x;
    const dy_screen = e.clientY - panStartRef.current.y;

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

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch pan Handlers
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
  
  // Resize observer
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
    
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setContainerSize({ width: rect.width, height: rect.height });
    }
    
    return () => observer.disconnect();
  }, []);

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

  const isImageNaturallyPortrait = imgNaturalSize.height > imgNaturalSize.width;
  const isContainerPortrait = containerSize.height > containerSize.width;

  const rotation = autoRotate
    ? (isContainerPortrait !== isImageNaturallyPortrait ? 90 : 0)
    : manualRotation;

  const imageRatio = imgNaturalSize.width / imgNaturalSize.height;
  const isRotated = rotation === 90 || rotation === 270;

  let canvasWidth = 0;
  let canvasHeight = 0;

  const CW = containerSize.width;
  const CH = containerSize.height;

  if (!isRotated) {
    const fitHeightBased = CW / imageRatio;
    if (fitHeightBased <= CH) {
      canvasWidth = CW;
      canvasHeight = fitHeightBased;
    } else {
      canvasHeight = CH;
      canvasWidth = CH * imageRatio;
    }
  } else {
    const effectiveRatio = imgNaturalSize.height / imgNaturalSize.width;
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
    
    canvasWidth = effectiveHeight;
    canvasHeight = effectiveWidth;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const isZoomIn = e.deltaY < 0;

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

  const filteredSpots = selectedCategory
    ? spots.filter((s) => s.category === selectedCategory)
    : spots;

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panStartRef.current.dragged) {
      panStartRef.current.dragged = false;
      return;
    }

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

    const tx_norm = zoom.x / canvasWidth;
    const ty_norm = zoom.y / canvasHeight;

    const baseMapX = 0.5 + (x - 0.5 - tx_norm) / zoom.scale;
    const baseMapY = 0.5 + (y - 0.5 - ty_norm) / zoom.scale;

    const finalX = parseFloat((baseMapX * 100).toFixed(2));
    const finalY = parseFloat((baseMapY * 100).toFixed(2));

    if (finalX >= 0 && finalX <= 100 && finalY >= 0 && finalY <= 100) {
      onAddSpotClick(finalX, finalY);
    }
  };

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

  const getCategoryColor = (category: string) => {
    const matchedCategory = categories.find((c) => c.id === category);
    const colorScheme = matchedCategory ? matchedCategory.color : 'rose';
    
    switch (colorScheme) {
      case 'indigo':
        return { bg: 'bg-indigo-500', ring: 'ring-indigo-500/30', text: 'text-indigo-500 hover:text-white' };
      case 'emerald':
        return { bg: 'bg-emerald-500', ring: 'ring-emerald-505/30', text: 'text-emerald-550 hover:text-white' };
      case 'amber':
        return { bg: 'bg-amber-500', ring: 'ring-amber-500/30', text: 'text-amber-500 hover:text-white' };
      case 'violet':
        return { bg: 'bg-violet-500', ring: 'ring-violet-500/30', text: 'text-violet-500 hover:text-white' };
      case 'teal':
        return { bg: 'bg-teal-500', ring: 'ring-teal-500/30', text: 'text-teal-500 hover:text-white' };
      case 'orange':
        return { bg: 'bg-orange-500', ring: 'ring-orange-500/30', text: 'text-orange-500 hover:text-white' };
      case 'fuchsia':
        return { bg: 'bg-fuchsia-500', ring: 'ring-fuchsia-500/30', text: 'text-fuchsia-500 hover:text-white' };
      case 'rose':
      default:
        return { bg: 'bg-rose-500', ring: 'ring-rose-500/30', text: 'text-rose-500 hover:text-white' };
    }
  };

  // Helper utility to target center on User Location Marker
  const handleFocusOnUser = () => {
    if (!currentLocation) return;
    
    const normX = currentLocation.x / 100;
    const normY = currentLocation.y / 100;
    
    const targetScale = 2.0; 
    const maxPanX = (canvasWidth * targetScale - canvasWidth) / 2;
    const maxPanY = (canvasHeight * targetScale - canvasHeight) / 2;
    
    const nextOffsetX = (0.5 - normX) * canvasWidth * targetScale;
    const nextOffsetY = (0.5 - normY) * canvasHeight * targetScale;
    
    setZoom({
      scale: targetScale,
      x: Math.max(-maxPanX, Math.min(maxPanX, nextOffsetX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, nextOffsetY))
    });
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col relative overflow-hidden select-none bg-neutral-100/60 school-grid">
      
      {/* Floating Header Panel */}
      <div className="absolute top-4 left-4 z-20 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md shadow-[0_12px_30px_rgba(109,40,217,0.05)] border border-violet-100/40 p-4 rounded-3xl hidden md:block select-none pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center border border-violet-100/80 text-violet-650 animate-pulse">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-805 tracking-tight font-display">
              筑摩野中 りんどう祭校内マップ
            </h3>
            <p className="text-[9px] text-neutral-400 mt-1 font-medium leading-relaxed flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <span>
                {isAdmin 
                  ? '管理者モード：任意の場所をタップして新しい口コミピンを配置できます' 
                  : '学内のカラーピンをタップすると、寄せられた口コミを閲覧・追加できます'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Floating Categories legend - Top Right Overlay */}
      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md shadow-[0_12px_30px_rgba(109,40,217,0.05)] border border-violet-100/40 p-3.5 rounded-3xl flex flex-col gap-2 text-[9.5px] font-bold text-neutral-600 pointer-events-auto max-w-[170px] max-h-[180px] overflow-y-auto scrollbar-none">
        <span className="text-[8.5px] uppercase tracking-widest text-violet-600/70 border-b border-violet-50 pb-1.5 font-display block">カテゴリー案内</span>
        {categories && categories.length > 0 ? (
          categories.map((cat) => {
            const colors = getCategoryColor(cat.id);
            return (
              <div key={cat.id} className="flex items-center gap-2 flex-nowrap shrink-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-xs border border-white ${colors.bg}`} />
                <span className="truncate text-neutral-700 hover:text-neutral-900 transition-colors" title={cat.label}>{cat.label}</span>
              </div>
            );
          })
        ) : (
          <div className="text-[8px] text-neutral-400 font-medium">登録なし</div>
        )}
      </div>

      {/* Main viewport */}
      <div className="flex-grow w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden touch-none">
        
        {/* Exact-Bounded Canvas */}
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
          className={`relative transition-all duration-[600ms] ease-out select-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[24px] border-4 border-white bg-white group overflow-hidden touch-none ${
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
              <div className="w-full h-full bg-neutral-50 relative text-neutral-600 flex flex-col items-center justify-center p-6 select-none">
                <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                  <Compass className="w-10 h-10 text-neutral-400 mb-3 animate-spin-slow" />
                  <h4 className="font-bold text-xs text-neutral-800">校内マップを読み込み中</h4>
                  <p className="text-[10px] text-neutral-400 mt-2 leading-relaxed">
                    校内マップ画像（<code className="text-indigo-600 font-mono bg-indigo-50 px-1 py-0.5 rounded">public/map.png</code>）を読み込んでいます。
                  </p>
                </div>
              </div>
            )}

            {/* SPOT HOTSPOT PINS */}
            {filteredSpots.map((spot) => {
              const isSelected = selectedSpot?.id === spot.id;
              const colors = getCategoryColor(spot.category);
              
              return (
                <div
                  key={spot.id}
                  style={{
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    transform: `translate(-50%, -50%) rotate(${-rotation}deg) scale(${1 / Math.max(1, zoom.scale)})`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSpot(spot);
                  }}
                  className="absolute z-20 group cursor-pointer"
                >
                  <div className={`absolute -inset-3.5 rounded-full transition-all duration-300 ${
                    isSelected 
                      ? 'ring-4 ring-rose-400 bg-white/20 scale-125' 
                      : 'group-hover:ring-4 group-hover:ring-indigo-400/20'
                  }`} />

                  <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-bold transition-all duration-300 shadow-md ${
                    isSelected 
                      ? 'bg-rose-600 scale-125 animate-bounce' 
                      : `${colors.bg} group-hover:scale-110`
                  }`}>
                    <MapPin className="w-4 h-4 fill-white/10" />
                  </div>

                  <div className="absolute top-9 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-neutral-900/90 text-white border border-neutral-700/50 px-2 py-0.5 rounded-md whitespace-nowrap text-[9px] font-bold shadow-md tracking-tight transition-all duration-200 z-30 pointer-events-none flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.bg}`} />
                    <span>{spot.name}</span>
                  </div>
                </div>
              );
            })}

            {/* GPS USER CURRENT LOCATION PIN - Polished pulsing water-drop aura style */}
            {gpsEnabled && currentLocation && (
              <div
                style={{
                  left: `${currentLocation.x}%`,
                  top: `${currentLocation.y}%`,
                  transform: `translate(-50%, -50%) rotate(${-rotation}deg) scale(${1 / Math.max(1, zoom.scale)})`,
                }}
                className="absolute z-30"
              >
                {/* Ping waves ripples */}
                <div className="absolute -inset-4.5 rounded-full bg-violet-500/30 animate-ping pointer-events-none" />
                <div className="absolute -inset-2.5 rounded-full bg-violet-400/40 animate-pulse scale-110 pointer-events-none" />
                
                <div 
                  className="w-6.5 h-6.5 rounded-full bg-violet-600 border-[2.5px] border-white text-white flex items-center justify-center shadow-lg relative cursor-pointer hover:bg-violet-750 active:scale-95 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFocusOnUser();
                  }}
                  title="あなたの現在位置（クリックで地図を自動追従フォーカス）"
                >
                  <Navigation className="w-2.5 h-2.5 fill-white/90 transform -rotate-45" />
                  {/* Pulse visual corner flash */}
                  <div className="absolute -top-0.5 -right-0.5 w-2 bg-rose-450 rounded-full border border-white animate-pulse" />
                </div>

                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-violet-900/95 text-white text-[7.5px] leading-none font-bold px-1.5 py-0.5 rounded-md shadow-xs border border-violet-400/25 whitespace-nowrap scale-90 pointer-events-none">
                  {demoMode ? '現在地 (デモ)' : 'あなた'}
                </div>
              </div>
            )}

            {/* ADMIN NEW PIN FEEDBACK GRID */}
            {isAdmin && hoverPosition && (
              <div
                style={{
                  left: `${hoverPosition.x}%`,
                  top: `${hoverPosition.y}%`,
                  transform: `translate(-50%, -50%) rotate(${-rotation}deg) scale(${1 / Math.max(1, zoom.scale)})`,
                }}
                className="absolute pointer-events-none z-10 flex flex-col items-center"
              >
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

      {/* Floating GPS Status & Demo controller Panel (Bottom Left Overlay) */}
      {gpsEnabled && (
        <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2.5 pointer-events-auto select-none max-w-[280px]">
          {/* Quick tracker panel */}
          <div className="bg-white/95 backdrop-blur-md shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-violet-100/40 p-3 rounded-2xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <Locate className="w-3.5 h-3.5 text-violet-650 animate-pulse" />
                <span className="text-[10px] font-black text-neutral-800">GPS位置追跡システム</span>
              </div>
              <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90">
                受信中
              </span>
            </div>

            {/* Coords state output */}
            {currentLocation ? (
              <div className="space-y-1">
                <div className="text-[8.5px] text-neutral-500 leading-normal">
                  {currentLocation.isInside ? (
                    <span className="text-emerald-700 font-bold">● 筑摩野中学校の校内に到着しています</span>
                  ) : (
                    <span className="text-amber-800 font-medium">▲ 現在、中学校の外にいます（デモ切替推奨）</span>
                  )}
                </div>
                <div className="flex gap-2 text-[8px] text-neutral-400 font-mono">
                  <span>Lat: {parseFloat(currentLocation.lat.toFixed(5))}</span>
                  <span>Lng: {parseFloat(currentLocation.lng.toFixed(5))}</span>
                </div>
              </div>
            ) : (
              <span className="text-[8.5px] text-neutral-400 font-medium">現在位置を検索しています...</span>
            )}

            {/* Quick alignment focus controls */}
            {currentLocation && (
              <button
                onClick={handleFocusOnUser}
                className="w-full bg-violet-650 hover:bg-violet-750 text-white font-bold text-[8.5px] py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
              >
                <Navigation className="w-2.5 h-2.5" />
                <span>自分の場所へマップを移動</span>
              </button>
            )}
          </div>

          {/* Decisive Teleport Demo simulation toggle */}
          <div className="bg-white/95 backdrop-blur-md shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-violet-100/40 p-3 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold text-neutral-700">GPS検証用テレポート</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {demoMode && (
              <div className="space-y-1.5 border-t border-dashed border-violet-100 pt-2 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-violet-700 font-bold bg-violet-50 px-1.5 py-0.5 rounded font-sans">
                    場所: {DEMO_LOCATIONS[demoIndex].name}
                  </span>
                  <button
                    onClick={() => setDemoIndex((prev) => (prev + 1) % DEMO_LOCATIONS.length)}
                    className="text-[8px] text-indigo-600 hover:text-indigo-800 font-bold bg-transparent border-none cursor-pointer underline hover:no-underline select-none"
                  >
                    次の場所へ
                  </button>
                </div>
                <p className="text-[8.5px] text-neutral-500 leading-relaxed font-sans font-medium">
                  {DEMO_LOCATIONS[demoIndex].desc}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Toolbar: Zoom, Rotation */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col md:flex-row items-end md:items-center gap-2.5 pointer-events-auto select-none">
        
        {/* Dynamic Zoom & Pan Controller */}
        <div className="flex bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-violet-100/40 p-0.5 overflow-hidden font-bold">
          <button
            onClick={() => handleZoom('out')}
            disabled={zoom.scale <= 1}
            className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
              zoom.scale <= 1 
                ? 'opacity-40 text-neutral-300 cursor-not-allowed' 
                : 'text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 cursor-pointer'
            }`}
            title="縮小"
          >
            ー
          </button>
          
          <div className="px-2.5 flex items-center justify-center font-mono text-[10px] font-bold text-neutral-550 border-x border-neutral-100 min-w-[50px] whitespace-nowrap">
            {Math.round(zoom.scale * 100)}%
          </div>
          
          <button
            onClick={() => handleZoom('in')}
            disabled={zoom.scale >= 5}
            className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
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
              className="px-3.5 text-[10px] font-bold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-xl shrink-0 transition-all cursor-pointer flex items-center justify-center shadow-xs shadow-violet-500/10"
              title="初期サイズに戻す"
            >
              リセット
            </button>
          )}
        </div>

        {/* Dynamic Rotation Mode Controller */}
        <div className="flex bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-violet-100/40 p-0.5 overflow-hidden">
          <button
            onClick={() => {
              setAutoRotate(true);
            }}
            className={`px-3.5 py-2 text-[9px] font-black rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              autoRotate 
                ? 'bg-violet-600 text-white shadow-xs shadow-violet-500/10' 
                : 'text-neutral-550 hover:text-neutral-900 bg-transparent'
            }`}
          >
            <Sparkles className="w-3" />
            <span>自動回転</span>
          </button>
          <button
            onClick={() => {
              setAutoRotate(false);
              setManualRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270);
            }}
            className={`px-3.5 py-2 text-[9px] font-black rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              !autoRotate 
                ? 'bg-violet-50 border border-violet-200/50 text-violet-700' 
                : 'text-neutral-400 hover:text-neutral-900'
            }`}
            title="手動で回転を切り替えます"
          >
            <RotateCw className="w-3 h-3 animate-spin-slow" />
            <span>手動 ({manualRotation}°)</span>
          </button>
        </div>

      </div>

    </div>
  );
}
