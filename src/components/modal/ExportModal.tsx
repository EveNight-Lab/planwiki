/**
 * @domain 워크스페이스 & 기획 관리
 * @feature 통합 내보내기 & AI 연동 팝업
 * @phase 출력
 * @target 프로젝트 내보내기 통합 모달
 * @trigger 헤더의 '내보내기' 버튼 클릭 시 오픈
 * @desc ZIP 패키징, PDF 인쇄, 외부 AI 기획서 가져오기 및 프롬프트 복사를 한곳에서 제공하는 통합 창구
 * @next src/lib/exportZip.ts, src/lib/exportPdf.ts
 */
import React from 'react';
import {
  Download,
  PackageCheck,
  Printer,
  Sparkles,
  Bot,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { copyPlanWikiPromptToClipboard } from '../../lib/aiPromptTemplates';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  onExportZip: () => void;
  onExportPdf: () => void;
  onOpenAiImport?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  workspaceName,
  onExportZip,
  onExportPdf,
  onOpenAiImport,
}) => {
  if (!isOpen) return null;

  const handleCopyPrompt = async () => {
    const success = await copyPlanWikiPromptToClipboard();
    if (success) {
      toast.success('AI 기획서 양식 프롬프트가 클립보드에 복사되었습니다!', {
        description: 'ChatGPT, Claude 등 외부 AI 대화창에 붙여넣어 작성된 기획서를 요청하세요.',
      });
      onClose();
    } else {
      toast.error('클립보드 복사에 실패했습니다.');
    }
  };

  const handleZipClick = () => {
    onExportZip();
    onClose();
  };

  const handlePdfClick = () => {
    onExportPdf();
    onClose();
  };

  const handleAiImportClick = () => {
    onClose();
    if (onOpenAiImport) {
      onOpenAiImport();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                프로젝트 내보내기 & AI 연동
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {workspaceName} 기획 산출물 관리
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Option Cards */}
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {/* 1. ZIP Package */}
          <button
            type="button"
            onClick={handleZipClick}
            className="w-full flex items-start gap-3.5 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 text-left transition active:scale-[0.99] group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  AI 패키지 다운로드 (ZIP)
                </span>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-semibold px-1.5 py-0.5 rounded">
                  추천
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                모든 마크다운 기획서, 첨부 이미지, HTML 프로토타입 일체를 백업용 ZIP 파일로 패키징합니다. (Antigravity/Claude 첨부용)
              </p>
            </div>
          </button>

          {/* 2. PDF / Print */}
          <button
            type="button"
            onClick={handlePdfClick}
            className="w-full flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition active:scale-[0.99] group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Printer className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                PDF 기획서 출력 (A4 인쇄용)
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                전체 기획서 항목을 자동 전개하여 깔끔한 A4 규격 문서로 인쇄하거나 PDF로 저장합니다.
              </p>
            </div>
          </button>

          {/* 3. AI Import (if available) */}
          {onOpenAiImport && (
            <button
              type="button"
              onClick={handleAiImportClick}
              className="w-full flex items-start gap-3.5 p-3.5 rounded-2xl border border-violet-200 dark:border-violet-800/60 bg-violet-50/50 dark:bg-violet-950/30 hover:bg-violet-100/60 dark:hover:bg-violet-900/40 text-left transition active:scale-[0.99] group"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  AI 기획서 가져오기 (Import)
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  외부 AI(ChatGPT, Claude) 대화방에서 도출된 기획서 텍스트를 붙여넣어 구조화된 문서로 일괄 생성합니다.
                </p>
              </div>
            </button>
          )}

          {/* 4. Copy AI Prompt */}
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="w-full flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition active:scale-[0.99] group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-700 dark:bg-slate-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                AI 기획 양식 프롬프트 복사
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                외부 AI에게 PlanWiki 양식에 맞추어 기획서를 써달라고 요구할 수 있는 완성형 지시문을 클립보드에 복사합니다.
              </p>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-400 text-center pt-2">
          모든 데이터는 브라우저 내부에서 안전하게 처리되며 외부 서버로 무단 전송되지 않습니다.
        </p>
      </div>
    </div>
  );
};

// Zero-config preview props for inspector
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(ExportModal as any)._previewProps = {
  isOpen: true,
  onClose: () => {},
  workspaceName: '샘플 기획서',
  onExportZip: () => {},
  onExportPdf: () => {},
  onOpenAiImport: () => {},
};
