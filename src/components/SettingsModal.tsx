import React, { useState, useEffect } from 'react';
import { X, Cookie, ShieldCheck, Check, RotateCcw, Globe, Sparkles, Cloud, Lock, Map, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  onClose: () => void;
  onSavePreferences?: (choices: { functional: boolean; analytics: boolean; geolocation: boolean }) => void;
}

export default function SettingsModal({ onClose, onSavePreferences }: SettingsModalProps) {
  // Consent categories loaded from storage
  const [consentFunctional, setConsentFunctional] = useState(true);
  const [consentAnalytics, setConsentAnalytics] = useState(true);
  const [consentGeolocation, setConsentGeolocation] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const savedConsent = localStorage.getItem('rindou-cookie-consent');
      if (savedConsent) {
        const parsed = JSON.parse(savedConsent);
        setConsentFunctional(parsed.functional !== false);
        setConsentAnalytics(parsed.analytics !== false);
        // Fallback to separate rindou-gps-enabled key or fallback to true/false in consent
        if (parsed.geolocation !== undefined) {
          setConsentGeolocation(parsed.geolocation);
        } else {
          const gpsRaw = localStorage.getItem('rindou-gps-enabled');
          setConsentGeolocation(gpsRaw !== 'false');
        }
      } else {
        const gpsRaw = localStorage.getItem('rindou-gps-enabled');
        setConsentGeolocation(gpsRaw !== 'false');
      }
    } catch (e) {
      console.error('Error reading cookie preferences', e);
    }
  }, []);

  const handleSave = () => {
    const preferences = {
      essential: true,
      functional: consentFunctional,
      analytics: consentAnalytics,
      geolocation: consentGeolocation,
      timestamp: new Date().toISOString(),
    };
    
    // Write state
    localStorage.setItem('rindou-cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('rindou-gps-enabled', String(consentGeolocation));
    
    document.cookie = `rindou_essential=true; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `rindou_functional=${consentFunctional}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `rindou_analytics=${consentAnalytics}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `rindou_geolocation=${consentGeolocation}; path=/; max-age=31536000; SameSite=Lax`;

    setIsSaved(true);
    if (onSavePreferences) {
      onSavePreferences({ functional: consentFunctional, analytics: consentAnalytics, geolocation: consentGeolocation });
    }
    
    // Dispatch custom event so that MapContainer dynamically picks up the geo toggled state
    window.dispatchEvent(new Event('rindou-settings-updated'));

    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 850);
  };

  const handleResetConsent = () => {
    if (window.confirm('Cookie同意ポップアップおよび設定データをすべてクリアして再起動しますか？（次回訪問時の状態で再度ポップアップが表示されます）')) {
      localStorage.removeItem('rindou-cookie-consent');
      localStorage.removeItem('rindou-gps-enabled');
      // Clear cookies
      document.cookie = "rindou_essential=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "rindou_functional=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "rindou_analytics=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "rindou_geolocation=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-955/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="bg-white text-neutral-800 max-w-xl w-full rounded-[28px] border border-neutral-100 shadow-2xl overflow-hidden flex flex-col my-8 text-left"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-neutral-850 to-neutral-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cookie className="w-5 h-5 text-violet-400" />
            <h2 className="text-sm font-black tracking-wider uppercase">
              アプリの設定 & GPS位置情報管理
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form area */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          
          {/* Section 1: Cookie & GPS Configuration */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-neutral-900 tracking-wide uppercase border-l-2 border-violet-500 pl-2">
              プライバシー・GPS設定
            </h3>
            
            <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">
              マップ設定のパーソナライズ、利用状況の統計、およびGPSによる現在位置の自己表示機能をお好みに合わせて変更できます。
            </p>

            <div className="border border-neutral-200/80 rounded-2xl divide-y divide-neutral-150 overflow-hidden text-xs">
              
              {/* Necessary */}
              <div className="p-4 bg-neutral-50/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800">1. 必須クッキー (Necessary)</span>
                  <span className="text-[9px] bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">常にオン</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed font-sans mt-1">
                  システムのコア動作、同意ステータスの保持、および口コミ投稿の読み込み確認に利用されます。
                </p>
              </div>

              {/* Functional */}
              <div className="p-4 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-800 block">2. 機能性クッキー (Functional)</span>
                    <span className="text-[10px] text-neutral-400 leading-relaxed font-sans mt-0.5 block">
                      マップのズームスケールや回転角度の設定を次回表示時まで状態保持するために利用されます。
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center justify-end pl-4">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={consentFunctional}
                        onChange={(e) => setConsentFunctional(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="p-4 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-800 block">3. 統計・分析クッキー (Analytics)</span>
                    <span className="text-[10px] text-neutral-400 leading-relaxed font-sans mt-0.5 block">
                      アクセス統計を記録し、今後のりんどう祭での誘導設計の改善に役立てられます（完全な匿名データ）。
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center justify-end pl-4">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={consentAnalytics}
                        onChange={(e) => setConsentAnalytics(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Geolocation */}
              <div className="p-4 bg-violet-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-violet-950 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-violet-605" />
                      <span>4. GPSによる現在地表示許可 (Geolocation)</span>
                    </span>
                    <span className="text-[10px] text-neutral-600 leading-relaxed font-sans mt-1 block">
                      りんどう祭りの現地において、ご自身の位置を校内デザインマップ（運動場、各校舎、体育館）へリアルタイムに自己投影します。
                    </span>
                    <strong className="text-[10px] text-violet-700 font-bold block mt-1 leading-normal">
                      ※この位置情報は他の参加者には一切共有されず、サーバーにも送信されません。端末の中だけで計算されます。
                    </strong>
                  </div>
                  <div className="shrink-0 flex items-center justify-end pl-4">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={consentGeolocation}
                        onChange={(e) => setConsentGeolocation(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-neutral-300 Peer-checked:bg-violet-650 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Quick credit view for perfect transparency */}
          <div className="bg-neutral-50/80 rounded-2xl border border-neutral-200/50 p-4 space-y-2.5">
            <h4 className="font-bold text-neutral-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Map className="w-4 h-4 text-violet-500" />
              <span>マップクレジット・出典確認</span>
            </h4>
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              マップデータは「国土地理院空中写真（航空写真）」を利用し、本アプリ作成者がgemini.google.comを用いてイラスト加工。Google AI Studio環境で構築された公式マップビューワです。
            </p>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-[10.5px] text-neutral-700 leading-relaxed font-serif italic">
              「出典：国土地理院の空中写真を基に、本ツール作成者がgemini.google.comを用いてイラスト化（加工）して作成。」
            </div>
          </div>

          {/* Section 3: Force settings reset */}
          <div className="flex items-center justify-between p-3.5 bg-rose-50/50 border border-rose-150/50 rounded-2xl">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-rose-800 block">データの初期化</span>
              <span className="text-[10px] text-rose-600 block">登録データの同意履歴、Cookieをリセットして初回用の状態に戻します。</span>
            </div>
            <button
              onClick={handleResetConsent}
              type="button"
              className="px-3.5 py-2 hover:bg-rose-100 text-rose-700 hover:text-rose-950 font-bold text-[10px] rounded-xl border border-rose-200 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>初期化する</span>
            </button>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-neutral-50 px-6 py-4.5 border-t border-neutral-100 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            キャンセル
          </button>

          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
              isSaved ? 'bg-emerald-600 shadow-emerald-600/10' : 'bg-violet-650 hover:bg-violet-700'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 animate-pulse" />
                <span>変更が適用されました</span>
              </>
            ) : (
              <span>設定を保存する</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
