import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, ExternalLink, Globe, Sparkles, Cloud, Lock, Check, ToggleLeft, Info, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CookieConsentModalProps {
  onConsentComplete?: (choices: { functional: boolean; analytics: boolean; geolocation: boolean }) => void;
}

export default function CookieConsentModal({ onConsentComplete }: CookieConsentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Consent categories
  const [consentFunctional, setConsentFunctional] = useState(true);
  const [consentAnalytics, setConsentAnalytics] = useState(true);
  const [consentGeolocation, setConsentGeolocation] = useState(true);

  useEffect(() => {
    // Check if user has already made a decision
    const savedConsent = localStorage.getItem('rindou-cookie-consent');
    if (!savedConsent) {
      setIsOpen(true);
    }
  }, []);

  const saveConsent = (functional: boolean, analytics: boolean, geolocation: boolean) => {
    const preferences = {
      essential: true,
      functional,
      analytics,
      geolocation,
      timestamp: new Date().toISOString(),
    };
    
    // Save to localStorage
    localStorage.setItem('rindou-cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('rindou-gps-enabled', String(geolocation));
    
    // Set formal browser cookies for high fidelity compliance
    document.cookie = `rindou_essential=true; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `rindou_functional=${functional}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `rindou_analytics=${analytics}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `rindou_geolocation=${geolocation}; path=/; max-age=31536000; SameSite=Lax`;

    setIsOpen(false);
    if (onConsentComplete) {
      onConsentComplete({ functional, analytics, geolocation });
    }

    // Dispatch custom event to let other components know metadata is refreshed
    window.dispatchEvent(new Event('rindou-settings-updated'));
  };

  const handleAcceptAll = () => {
    saveConsent(true, true, true);
  };

  const handleAcceptEssentialOnly = () => {
    saveConsent(false, false, false);
  };

  const handleSaveCustom = () => {
    saveConsent(consentFunctional, consentAnalytics, consentGeolocation);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          id="cookie-consent-overlay"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="bg-white text-neutral-800 max-w-2xl w-full rounded-[28px] border border-neutral-100 shadow-2xl overflow-hidden flex flex-col my-8"
            id="cookie-consent-card"
          >
            {/* Header decoration */}
            <div className="bg-neutral-50 border-b border-neutral-200/80 px-6 py-5 text-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cookie className="w-5 h-5 text-indigo-500 shrink-0 font-sans" />
                <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-neutral-900 font-sans">
                  Credits & Cookie Consent / クレジットとCookie同意
                </h2>
              </div>
              <span className="text-[9px] uppercase tracking-widest font-mono bg-neutral-200/60 text-neutral-600 px-2.5 py-0.5 rounded-full font-bold">
                First Visit
              </span>
            </div>

            {/* Modal content */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[65vh] text-left">
              
              {/* Section 1: Spatial & Creation Credits (Verbatim Requests) */}
              <div className="space-y-3.5 font-sans">
                <div className="flex items-center gap-2 text-neutral-800">
                  <Globe className="w-4 h-4 text-neutral-500 shrink-0" />
                  <h3 className="text-xs font-black tracking-wide uppercase text-neutral-750">マップデータの出典・作成について</h3>
                </div>
                
                <div className="bg-neutral-50 rounded-2xl border border-neutral-200/60 p-5 space-y-3.5 text-xs text-neutral-600 leading-relaxed">
                  <p className="font-medium">
                    本アプリで利用している校内マップデータは、<strong>国土地理院の航空写真</strong>を利用しています。
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 bg-white p-3.5 rounded-xl border border-neutral-200/80 font-mono text-[10px]">
                    <span className="font-black text-neutral-400 shrink-0">元の地図データURL:</span>
                    <a 
                      href="https://maps.gsi.go.jp/#18/36.185161/137.966151/&base=ort&ls=ort&disp=1&vs=c0g1j0h0k0l0u0t0z0r0s0m0f1" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-bold hover:underline hover:text-indigo-800 break-all inline-flex items-center gap-1"
                    >
                      国土地理院 地図閲覧サービス (航空写真)
                      <ExternalLink className="w-3 h-3 shrink-0 text-indigo-500" />
                    </a>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium text-neutral-505">
                      このオリジナルの空中写真データをベースに、本ツール作成者が <strong>Gemini（AI）</strong> を活用して
                      デザインおよびイラスト加工（イラスト化）を行い、コーディングからデプロイまでを最先端の開発環境で構築しました。
                    </p>
                    
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 font-medium text-neutral-650">
                      <li className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-neutral-200/50">
                        <Sparkles className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>加工（イラスト化）: <strong className="text-neutral-800">gemini.google.com</strong></span>
                      </li>
                      <li className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-neutral-200/50">
                        <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>コーディング: <strong className="text-neutral-800">Google AI Studio</strong></span>
                      </li>
                      <li className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-neutral-200/50 sm:col-span-2">
                        <Cloud className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>デプロイシステム: <strong className="text-neutral-800">Cloudflare</strong></span>
                      </li>
                    </ul>
                  </div>

                  {/* Exact user credit request block - Settled Modern Neutral Style */}
                  <div className="bg-neutral-100/80 border-l-4 border-neutral-450 p-3.5 rounded-r-xl font-medium text-neutral-800 space-y-1.5 text-xs mt-3">
                    <div className="font-black text-[10px] text-neutral-500 uppercase tracking-wider">必ずご確認ください（登録クレジット）</div>
                    <p className="leading-relaxed select-text font-serif italic text-neutral-700">
                      「出典：上記URL of 空中写真を基に、本ツール作成者がgemini.google.comを用いてイラスト化（加工）して作成。」
                    </p>
                  </div>

                  <div className="text-[10px] text-neutral-400 font-bold italic select-none pt-1">
                    Thank you to Google. Thank you to Cloudflare.
                  </div>
                </div>
              </div>

              {/* Section 2: Cookie & Location Usage Consent & Selector */}
              <div className="space-y-3 font-sans">
                <div className="flex items-center gap-2 text-neutral-850">
                  <ShieldCheck className="w-4 h-4 text-neutral-500 shrink-0" />
                  <h3 className="text-xs font-black tracking-wide uppercase text-neutral-855">Cookie使用および位置情報GPS機能の許可について</h3>
                </div>
                
                <p className="text-xs text-amber-905 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl leading-relaxed flex gap-2">
                  <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    ユーザーの皆様に校内マップを安全・便利にご利用いただくため、機能設定の保存（Cookie・ローカルストレージ）およびGPSによる自己現在地表示機能の使用に関する同意をお願いいたします。
                  </span>
                </p>

                {/* Cookie classification card details */}
                <div className="border border-neutral-250 rounded-3xl overflow-hidden divide-y divide-neutral-100 text-xs shadow-xs">
                  
                  {/* Category 1: Essential Cookies */}
                  <div className="p-4 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                        <span>① 必須のCookie (Necessary)</span>
                        <span className="text-[9px] bg-neutral-200/80 text-neutral-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0 scale-90">強制必須</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">
                        サイトのコアシステム、本同意設定の保持、および口コミや評価を即時に反映・表示するために利用します。<strong>（アプリの基本動作や同意履歴の保存に必要なため、拒否できません）</strong>
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center justify-end">
                      <span className="text-neutral-600 font-bold bg-neutral-150 px-3 py-1 rounded-lg border border-neutral-200 text-[10.5px]">同意必須</span>
                    </div>
                  </div>

                  {/* Category 2: Functional Cookies */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        <span>② 機能性Cookie (Functional)</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">
                        校内マップの「拡大倍率（ズーム）」や「回転表示（90〜270度）」、口コミスポット一覧の「並び替えフィルター順」などの利便性をパーソナライズ保存するために使用します。
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={consentFunctional}
                          onChange={(e) => setConsentFunctional(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-neutral-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-neutral-800"></div>
                        <span className="ml-2 font-bold text-[11px] text-neutral-650 min-w-[28px]">
                          {consentFunctional ? '許可' : '拒否'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Category 3: Analytical Cookies */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        <span>③ 分析・統計用Cookie (Analytics)</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">
                        校内マップの利用状況（アクセス件数、一番多く閲覧された校内スポット）などを匿名性の高い統計情報として自動分析し、今後のりんどう祭でのマップ改善に役立てるために収集します。
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2 font-sans text-xs">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={consentAnalytics}
                          onChange={(e) => setConsentAnalytics(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-neutral-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-neutral-800"></div>
                        <span className="ml-2 font-bold text-[11px] text-neutral-650 min-w-[28px]">
                          {consentAnalytics ? '許可' : '拒否'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Category 4: Geolocation GPS Track */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-violet-50/45">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-violet-950">
                        <Navigation className="w-3.5 h-3.5 text-violet-600 animate-pulse fill-violet-200/50 hover:rotate-45 transition-transform" />
                        <span>④ GPSによる自己現在地表示 (Geolocation)</span>
                      </div>
                      <p className="text-[11px] text-neutral-550 leading-relaxed font-sans">
                        りんどう祭開催中の筑摩野中学校にて、ご自身の現在位置を校内デザインマップ上にリアルタイム表示します。
                        <strong className="text-violet-700 block mt-1">
                          ※プライバシー保護：本機能で取得されるGPS位置情報は、ご自身のブラウザ端末内（ローカル）でのみ直接マッピング処理されます。サーバー等に送信・保存・記録されることは一切なく、他の参加者や管理者に共有されることも一切ありません。完全なローカル処理で安心・安全です。
                        </strong>
                        <span className="text-neutral-450 block mt-1">
                          ※いつでも右上「設定 (歯車)」アイコンのメニューから位置情報のオン・オフを切り替えることができます。
                        </span>
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2 font-sans text-xs">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={consentGeolocation}
                          onChange={(e) => setConsentGeolocation(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-neutral-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-violet-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white peer-checked:bg-violet-650 after:border-neutral-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all"></div>
                        <span className="ml-2 font-bold text-[11px] text-violet-750 min-w-[28px]">
                          {consentGeolocation ? '使用する' : 'オフ'}
                        </span>
                      </label>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Action Panel Buttons (Google UI Theme look) */}
            <div className="bg-neutral-50 px-6 sm:px-8 py-5 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
              
              <button
                onClick={handleAcceptEssentialOnly}
                className="w-full sm:w-auto px-4.5 py-2.5 bg-neutral-200 hover:bg-neutral-300/85 text-neutral-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                title="必須項目以外のすべてのCookieを拒否します"
              >
                必要項目以外を拒否
              </button>

              <button
                onClick={handleSaveCustom}
                className="w-full sm:w-auto px-4.5 py-2.5 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-250 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                title="選択した設定を登録して進みます"
              >
                カスタム設定を保存
              </button>

              <button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-5.5 py-2.5 bg-violet-650 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                title="すべての機能性に同意して開始します"
              >
                <Check className="w-3.5 h-3.5 text-white" />
                <span>すべてに同意して開始</span>
              </button>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
