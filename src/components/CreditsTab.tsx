import React from 'react';
import { Globe, Sparkles, Cloud, Lock, ExternalLink, Heart, ArrowRight, FileText } from 'lucide-react';

export default function CreditsTab() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16 animate-fade-in text-left" id="credits-tab">
      <div className="flex flex-col items-start gap-2 mb-6">
        <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Credits / 出典・謝辞
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-2">
          クレジットとマップデータの出典情報
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-xl">
          当アプリケーションの構築における地図データのライセンス、高度なイラスト化の生成AI技術、および開発インフラの紹介です。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Primary Credit Block */}
        <div className="md:col-span-2 space-y-6">
          {/* Section 1: Map Source */}
          <div className="bg-white rounded-[24px] border border-neutral-200/60 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-neutral-900">
              <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                <Globe className="w-4 h-4 text-blue-650" />
              </span>
              <h3 className="text-base font-black">国土地理院 航空写真データの利用</h3>
            </div>
            
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              本マップアプリの配置ベースとなっている地形および校外・校内位置データは、<strong>国土地理院が提供する公式航空写真・空中写真データ</strong>をベースとして、正確にマッピングされています。
            </p>

            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 space-y-2">
              <span className="text-[10px] uppercase font-bold text-blue-850 tracking-wider block">
                元データ参照URL
              </span>
              <a 
                href="https://maps.gsi.go.jp/#18/36.185161/137.966151/&base=ort&ls=ort&disp=1&vs=c0g1j0h0k0l0u0t0z0r0s0m0f1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-blue-700 hover:text-blue-900 break-all inline-flex items-center gap-1.5 hover:underline"
              >
                国土地理院 電子国土Web 地図・空中写真
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {/* Section 2: Precise Verbatim Attribution */}
          <div className="bg-amber-50/70 rounded-[24px] border border-amber-250/50 p-6 sm:p-8 space-y-3.5">
            <div className="flex items-center gap-2 text-amber-800">
              <FileText className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="text-sm font-black uppercase tracking-wider">
                公式出典表記（確実な内容の記載）
              </h3>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs max-w-full overflow-hidden">
              <p className="text-xs sm:text-[13px] font-medium leading-relaxed text-neutral-800 select-all font-serif italic">
                「出典：上記URLの空中写真を基に、本ツール作成者がgemini.google.comを用いてイラスト化（加工）して作成。」
              </p>
            </div>
            
            <p className="text-[11px] text-amber-700 leading-relaxed">
              ※上記表記は、国土地理院のコンテンツ利用規約および作成者の知的加工プロセスを正確に示す公式なライセンス・出典表明となります。
            </p>
          </div>

          {/* Section 3: Thank you to Google and Cloudflare */}
          <div className="bg-neutral-50/70 rounded-[24px] border border-neutral-200/60 p-6 sm:p-8 space-y-4">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                <h3 className="text-sm font-black text-neutral-850 uppercase tracking-wider">
                  Special Thank You
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans">
                マップ作成・自動コード編成・およびサーバー群展開でお世話になっている二社の驚異的なインフラシステムに心より感謝申し上げます。
              </p>

              <div className="pt-3 flex flex-wrap gap-4 border-t border-neutral-200/60 text-xs font-mono">
                <div className="flex items-center gap-2 text-neutral-600 bg-white/80 px-3 py-1.5 rounded-lg border border-neutral-250/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Thank you to Google</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600 bg-white/80 px-3 py-1.5 rounded-lg border border-neutral-250/50">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Thank you to Cloudflare</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Creation Stack Panels */}
        <div className="space-y-6 text-xs text-neutral-600">
          <div className="bg-white rounded-[24px] border border-neutral-200/60 p-5 space-y-4">
            <h4 className="font-bold text-neutral-800 text-xs border-b border-neutral-100 pb-2">
              テクノロジースタック
            </h4>

            {/* List */}
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <div>
                  <div className="font-bold text-neutral-800 text-[11px]">gemini.google.com</div>
                  <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">
                    精確な地図写真をAIによる高度なセマンティック色彩・線画変換を行い、魅力的な校内イラストマップへと昇華。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <div>
                  <div className="font-bold text-neutral-800 text-[11px]">Google AI Studio</div>
                  <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">
                    インパネ・自動パン・口コミ書き込みサーバーなどの高度なReactロジック全体のオーケストレーションに使用。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
                  <Cloud className="w-3.5 h-3.5" />
                </span>
                <div>
                  <div className="font-bold text-neutral-800 text-[11px]">Cloudflare Pages</div>
                  <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">
                    超高速エッジサーバー配信およびグローバルCDN機能を利用して、りんどう祭のアクセス集中期でも安定した稼働を提供。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-[24px] border border-neutral-250/40 p-5 space-y-3">
            <h4 className="font-bold text-neutral-800 text-[11px]">
              クレジット表示への配慮
            </h4>
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              当アプリはりんどう祭をサポートするために作られた非営利のツールであり、すべての画像やマップ利用規約、およびプライバシー同意基準を完全に遵守するよう努めています。
            </p>
            <div className="text-[9px] text-neutral-400">
              最終更新日: 2026年6月7日
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
