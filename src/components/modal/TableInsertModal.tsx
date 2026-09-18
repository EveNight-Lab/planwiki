/**
 * @domain 기획 문서 작업
 * @feature 마크다운 기획 작성 & 표/그림 보기
 * @phase 입력
 * @target 표 크기 및 서식 선택 팝업
 * @trigger 에디터의 '표 삽입' 버튼 클릭
 * @desc 원하는 가로 칸수와 세로 줄수를 고르면 마크다운 표를 자동으로 만들어 본문에 넣어줌
 * @next src/components/doc/MarkdownEditor.tsx
 */
import React, { useState } from 'react';
import { Table, X, Check, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (markdownTable: string) => void;
}

export const TableInsertModal: React.FC<Props> = ({ isOpen, onClose, onInsertTable }) => {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [hoverCols, setHoverCols] = useState(0);
  const [hoverRows, setHoverRows] = useState(0);

  if (!isOpen) return null;

  const generateMarkdownTable = (c: number, r: number): string => {
    // Header
    let md = '\n| ' + Array.from({ length: c }, (_, i) => `항목 ${i + 1}`).join(' | ') + ' |\n';
    // Divider
    md += '| ' + Array.from({ length: c }, () => ':---').join(' | ') + ' |\n';
    // Rows
    for (let i = 0; i < r; i++) {
      md += '| ' + Array.from({ length: c }, () => '내용').join(' | ') + ' |\n';
    }
    return md + '\n';
  };

  const handleApplyCustom = () => {
    const tableMd = generateMarkdownTable(cols, rows);
    onInsertTable(tableMd);
    onClose();
  };

  const handleApplyPreset = (type: 'requirements' | 'api' | 'status') => {
    let md = '';
    if (type === 'requirements') {
      md = `\n| 기능 명칭 | 요구사항 상세 설명 | 중요도 | 진행 상태 |\n| :--- | :--- | :---: | :---: |\n| 회원가입 기능 | 소셜 로그인 및 이메일 인증 지원 | P0 | 진행 중 |\n| 결제 시스템 | PG 결제위젯 및 영수증 발급 | P0 | 대기 |\n| 마이페이지 | 프로필 정보 수정 및 탈퇴 | P1 | 예정 |\n\n`;
    } else if (type === 'api') {
      md = `\n| 파라미터명 | 데이터 형식 | 필수 여부 | 상세 설명 |\n| :--- | :---: | :---: | :--- |\n| orderId | 문자열 (String) | 필수 | 고유 주문 식별자 |\n| amount | 숫자 (Number) | 필수 | 최종 승인 금액 (원) |\n| customerEmail | 문자열 (String) | 선택 | 영수증 전송용 이메일 주소 |\n\n`;
    } else if (type === 'status') {
      md = `\n| 단계 | 작업 내용 | 담당자 | 마감 예정일 | 상태 |\n| :---: | :--- | :---: | :---: | :---: |\n| 1단계 | 화면 기획서 초안 작성 | 기획팀 | 2026-09-20 | ✅ 완료 |\n| 2단계 | 단일 프로토타입 검증 | 개발팀 | 2026-09-25 | 🚀 진행 중 |\n| 3단계 | 본 개발 구현 및 배포 | 전체 | 2026-10-05 | ⏳ 대기 |\n\n`;
    }
    onInsertTable(md);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                표 만들기 (크기 및 서식 선택)
              </h3>
              <p className="text-xs text-slate-500">
                원하는 칸 수와 줄 수를 고르거나 추천 양식을 선택하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Grid Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                표 크기 직접 선택
              </span>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {hoverCols || cols}칸 (가로) × {hoverRows || rows}줄 (세로)
              </span>
            </div>

            {/* Visual Mini Grid (6x6) */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <div
                className="grid grid-cols-6 gap-1.5 cursor-pointer"
                onMouseLeave={() => {
                  setHoverCols(0);
                  setHoverRows(0);
                }}
              >
                {Array.from({ length: 6 }).map((_, rIdx) =>
                  Array.from({ length: 6 }).map((_, cIdx) => {
                    const c = cIdx + 1;
                    const r = rIdx + 1;
                    const isSelected =
                      hoverCols && hoverRows
                        ? c <= hoverCols && r <= hoverRows
                        : c <= cols && r <= rows;

                    return (
                      <div
                        key={`${r}-${c}`}
                        onMouseEnter={() => {
                          setHoverCols(c);
                          setHoverRows(r);
                        }}
                        onClick={() => {
                          setCols(c);
                          setRows(r);
                        }}
                        className={`w-6 h-6 rounded-md border transition-all ${
                          isSelected
                            ? 'bg-blue-500 border-blue-600 scale-105'
                            : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                        }`}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Quick Preset Templates */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>자주 쓰는 기획서 양식 (원클릭)</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('requirements')}
                className="flex items-center justify-between p-2.5 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    📋 기능 요구사항 명세 표
                  </div>
                  <div className="text-[11px] text-slate-400">
                    기능 명칭, 상세 설명, 중요도(P0~P2), 상태
                  </div>
                </div>
                <Check className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('api')}
                className="flex items-center justify-between p-2.5 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    🌐 API 파라미터 규격 표
                  </div>
                  <div className="text-[11px] text-slate-400">
                    파라미터명, 데이터 형식, 필수 여부, 상세 설명
                  </div>
                </div>
                <Check className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('status')}
                className="flex items-center justify-between p-2.5 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    🚀 개발 일정 및 진행 단계 표
                  </div>
                  <div className="text-[11px] text-slate-400">
                    단계, 작업 내용, 담당자, 마감일, 진행 상태
                  </div>
                </div>
                <Check className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition" />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleApplyCustom}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition"
            >
              {cols}칸 × {rows}줄 표 넣기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
