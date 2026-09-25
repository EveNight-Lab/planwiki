/**
 * @domain 외부 AI 연동
 * @feature 외부 AI 기획 텍스트 문서 임포트
 * @phase 입력 (Trigger)
 * @target AI 기획 텍스트 입력 및 가져오기 대화상자
 * @desc 외부 AI 대화 결과(JSON)를 붙여넣어 검증 후 현재 워크스페이스 단락으로 일괄 추가하는 모달
 * @next src/pages/WorkspaceView.tsx
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  FileText,
  X,
  ArrowRight,
  ListTree,
} from 'lucide-react';
import { toast } from 'sonner';
import { copyPlanWikiPromptToClipboard } from '../../lib/aiPromptTemplates';
import { parseAiPlanToNodes } from '../../lib/aiPlanParser';
import type { DocNode } from '../../types/workspace';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (nodes: DocNode[]) => void;
  nextOrder?: number;
}

export const AiImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImport,
  nextOrder = 1,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // 실시간 유효성 검사 및 파싱
  const parseResult = useMemo(() => {
    if (!inputText.trim()) return null;
    return parseAiPlanToNodes(inputText, nextOrder);
  }, [inputText, nextOrder]);

  if (!isOpen) return null;

  const handleCopyPrompt = async () => {
    const success = await copyPlanWikiPromptToClipboard();
    if (success) {
      setCopiedPrompt(true);
      toast.success('PlanWiki 기획서 양식 프롬프트가 클립보드에 복사되었습니다!', {
        description: 'ChatGPT, Claude 등 외부 AI 대화창에 붙여넣어 답변을 요청하세요.',
      });
      setTimeout(() => setCopiedPrompt(false), 2500);
    } else {
      toast.error('클립보드 복사에 실패했습니다.');
    }
  };

  const handleExecuteImport = () => {
    if (!parseResult || !parseResult.success || parseResult.nodes.length === 0) {
      toast.error('가져올 수 있는 유효한 기획 데이터가 없습니다.');
      return;
    }

    onImport(parseResult.nodes);
    toast.success(`${parseResult.totalNodeCount}개의 기획 단락을 성공적으로 가져왔습니다!`, {
      description: '문서 트리에 즉시 반영되어 안전하게 저장되었습니다.',
    });
    setInputText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>외부 AI 기획 내용 가져오기</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ChatGPT, Claude 대화방에서 나온 기획서를 PlanWiki 단락으로 즉시 변환합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto scrollbar-thin">
          {/* Step 1: Prompt Copy Card */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>AI에게 전달할 양식 프롬프트</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                기획 대화방에 붙여넣을 <strong>표준 규격 지시문(인라인 HTML 예시 포함)</strong>을 복사합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyPrompt}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition shadow-xs shrink-0 whitespace-nowrap active:scale-95 ${
                copiedPrompt
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? '복사 완료!' : '양식 프롬프트 복사'}</span>
            </button>
          </div>

          {/* Step 2: Paste AI Response */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="ai-json-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900 flex items-center justify-center text-[10px]">2</span>
                <span>AI 답변 붙여넣기 (JSON 코드블록 지원)</span>
              </label>
              {inputText.trim() && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  지우기
                </button>
              )}
            </div>

            <textarea
              id="ai-json-input"
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`외부 AI가 출력한 JSON 코드블록을 이곳에 그대로 붙여넣으세요.\n\n예: \`\`\`json\n[\n  { "title": "01. 서비스 개요", "content": "### 목표\\n본문 마크다운..." }\n]\n\`\`\``}
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition resize-y"
              spellCheck={false}
            />
          </div>

          {/* Real-time Preview or Error Feedback */}
          {parseResult && (
            <div>
              {parseResult.success ? (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>파싱 성공: 총 {parseResult.totalNodeCount}개 기획 단락 감지됨</span>
                    </span>
                    <span className="text-[11px] font-normal opacity-80">
                      순서 #{nextOrder}부터 자동 매핑
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                    {parseResult.nodes.map((node, i) => (
                      <span
                        key={node.id || i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-emerald-200 dark:border-emerald-800 shadow-xs"
                      >
                        <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold">{node.meta.title}</span>
                        {node.content.includes('```html:preview') && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold">
                            인라인 HTML
                          </span>
                        )}
                        {node.children.length > 0 && (
                          <span className="text-[10px] text-slate-400">
                            (+하위 {node.children.length})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">파싱 오류:</span> {parseResult.error}
                    <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                      상단의 [양식 프롬프트 복사]를 눌러 AI에게 JSON 스키마를 다시 요청해 보세요.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <ListTree className="w-3.5 h-3.5" />
            <span>기존 기획서의 맨 아래에 추가됩니다</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={!parseResult || !parseResult.success}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl transition shadow-md active:scale-95 ${
                parseResult && parseResult.success
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
              }`}
            >
              <span>기획서로 가져오기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Zero-config live preview for Inspector Board (Port 5174)
// @ts-expect-error Inspector preview metadata
AiImportModal._previewProps = {
  isOpen: true,
  onClose: () => {},
  onImport: () => {},
  nextOrder: 3,
};
