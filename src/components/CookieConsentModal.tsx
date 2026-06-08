import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, ExternalLink, Globe, Sparkles, Cloud, Lock, Check, ToggleLeft, Info } from 'lucide-react';

interface CookieConsentModalProps {
  onConsentComplete?: (choices: { functional: boolean; analytics: boolean }) => void;
}

export default function CookieConsentModal({ onConsentComplete }: CookieConsentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Consent categories
  const [consentFunctional, setConsentFunctional] = useState(true);
  const [consentAnalytics, setConsentAnalytics] = useState(true);

  useEffect(() => {
    // Check if user has already made a decision
    const savedConsent = localStorage.getItem('rindou-cookie-consent');
    if (!savedConsent) {
      setIsOpen(true);
    }
  }, []);

  const saveConsent = (functional: boolean, analytics: boolean) => {
    const preferences = {
      essential: true,
      functional,
      analytics,
      timestamp: new Date().toISOString(),
    };
    
    // Save to localStorage
    localStorage.setItem('rindou-cookie-consent', JSON.stringify(preferences));
    
    // Set formal browser cookies for high fidelity compliance
    document.cookie = `rindou_essential=true; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `rindou_functional=${functional}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `rindou_analytics=${analytics}; path=/; max-age=31536000; SameSite=Lax`;

    setIsOpen(false);
    if (onConsentComplete) {
      onConsentComplete({ functional, analytics });
    }
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleAcceptEssentialOnly = () => {
    saveConsent(false, false);
  };

  const handleSaveCustom = () => {
    saveConsent(consentFunctional, consentAnalytics);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      id="cookie-consent-overlay"
    >
      <div 
        className="bg-white text-neutral-800 max-w-2xl w-full rounded-[28px] border border-neutral-100 shadow-2xl overflow-hidden flex flex-col my-8 animate-scale-up"
        id="cookie-consent-card"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cookie className="w-5 h-5 animate-pulse" />
            <h2 className="text-sm font-black tracking-wider uppercase">
              Credits & Cookie Consent / クレジットとCookie同意
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-mono bg-white/20 px-2 py-0.5 rounded-full">
            First Visit
          </span>
        </div>

        {/* Modal content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[65vh] text-left">
          
          {/* Section 1: Spatial & Creation Credits (Verbatim Requests) */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-indigo-600">
              <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
              <h3 className="text-xs font-black tracking-wide uppercase">マップデータの出典・作成について</h3>
            </div>
            
            <div className="bg-neutral-50 rounded-2xl border border-neutral-150 p-4 space-y-3.5 text-xs text-neutral-600 leading-relaxed font-sans">
              <p>
                本アプリで利用している校内マップデータは、<strong>国土地理院の航空写真</strong>を利用しています。
              </p>
              
              <div className="flex items-start gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/60 font-mono text-[10px]">
                <span className="font-bold text-indigo-500 shrink-0">元の地図データURL:</span>
                <a 
                  href="https://maps.gsi.go.jp/#18/36.185161/137.966151/&base=ort&ls=ort&disp=1&vs=c0g1j0h0k0l0u0t0z0r0s0m0f1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 font-medium hover:underline hover:text-indigo-800 break-all inline-flex items-center gap-1"
                >
                  国土地理院 地図閲覧サービス (航空写真)
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              
              <div className="space-y-2">
                <p>
                  このオリジナルの空中写真データをベースに、本ツール作成者が <strong>Gemini（AI）</strong> を活用して
                  デザインおよびイラスト加工（イラスト化）を行い、コーディングからデプロイまでを最先端の開発環境で構築しました。
                </p>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <li className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-neutral-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>加工（イラスト化）: <strong>gemini.google.com</strong></span>
                  </li>
                  <li className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-neutral-200">
                    <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>コーディング: <strong>Google AI Studio</strong></span>
                  </li>
                  <li className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-neutral-200 sm:col-span-2">
                    <Cloud className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>デプロイシステム: <strong>Cloudflare</strong></span>
                  </li>
                </ul>
              </div>

              {/* Exact user credit request block */}
              <div className="bg-amber-50/80 border-l-4 border-amber-500 p-3.5 rounded-r-xl font-medium text-neutral-800 space-y-1.5 shadow-sm text-xs mt-3">
                <div className="font-bold text-[10.5px] text-amber-800 uppercase tracking-wider">必ずご確認ください（登録クレジット）</div>
                <p className="leading-relaxed select-text font-serif italic text-neutral-700">
                  「出典：上記URLの空中写真を基に、本ツール作成者がgemini.google.comを用いてイラスト化（加工）して作成。」
                </p>
              </div>

              <div className="text-[10px] text-neutral-400 font-medium italic select-none pt-1">
                Thank you to Google. Thank you to Cloudflare.
              </div>
            </div>
          </div>

          {/* Section 2: Cookie Usage Consent & Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600">
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <h3 className="text-xs font-black tracking-wide uppercase">Cookie（クッキー）および類似技術の使用について</h3>
            </div>
            
            <p className="text-xs text-neutral-500 leading-relaxed">
              ユーザーの皆様に安全かつ快適に本サービスをご利用いただき、アプリ設定を保持するために、
              以下の目的別Cookieまたはローカルストレージを使用します。設定より必要な情報以外はいつでも拒否を選択頂けます。
            </p>

            {/* Cookie classification card details */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100 text-xs">
              
              {/* Category 1: Essential Cookies */}
              <div className="p-4 bg-indigo-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    <span>① 必須のCookie (Necessary)</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0 scale-90">強制必須</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">
                    サイトのコアシステム、本同意設定の保持（クレジット表示・Cookie許可を二度出さないための設定保存）、および口コミや評価を即時に反映・表示するために利用します。<strong>（アプリの基本動作や同意履歴の保存に必要なため、拒否できません）</strong>
                  </p>
                </div>
                <div className="shrink-0 flex items-center justify-end">
                  <span className="text-indigo-600 font-bold bg-indigo-50/80 px-3 py-1 rounded-lg border border-indigo-100">同意必須</span>
                </div>
              </div>

              {/* Category 2: Functional Cookies */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                    <div className="w-10 h-5.5 bg-neutral-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-2 font-bold text-[11px] text-neutral-600 min-w-[28px]">
                      {consentFunctional ? '許可' : '拒否'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Category 3: Analytical Cookies */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
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
                    <div className="w-10 h-5.5 bg-neutral-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-2 font-bold text-[11px] text-neutral-600 min-w-[28px]">
                      {consentAnalytics ? '許可' : '拒否'}
                    </span>
                  </label>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Action Panel Buttons (Google UI Theme look) */}
        <div className="bg-neutral-50 px-6 sm:px-8 py-5 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          
          <button
            onClick={handleAcceptEssentialOnly}
            className="w-full sm:w-auto px-4.5 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            title="必須項目以外のすべてのCookieを拒否します"
          >
            必要項目以外を拒否
          </button>

          <button
            onClick={handleSaveCustom}
            className="w-full sm:w-auto px-4.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            title="選択した設定を登録して進みます"
          >
            カスタム設定を保存
          </button>

          <button
            onClick={handleAcceptAll}
            className="w-full sm:w-auto px-5.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/10 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
            title="すべての機能性に同意して開始します"
          >
            <Check className="w-3.5 h-3.5" />
            <span>すべてに同意して開始</span>
          </button>

        </div>
      </div>
    </div>
  );
}
