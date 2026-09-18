// @cohesive-file
/**
 * @domain 기획 문서 작업
 * @feature 마크다운 기획 작성 & 표/그림 보기
 * @phase 입력
 * @target 시각적 표 편집 및 칸 늘리기 팝업
 * @trigger 에디터의 '표 만들기 / 비주얼 표 편집' 버튼 클릭
 * @desc 엑셀처럼 표의 칸(열)과 줄(행)을 직접 늘리고 줄이며 내용을 입력하는 비주얼 표 편집기
 * @next src/components/doc/MarkdownEditor.tsx
 */
import React, { useState } from 'react';
import {
  Table,
  Plus,
  Trash2,
  X,
  Check,
  Sparkles,
  Rows,
  Columns,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (markdownTable: string) => void;
  initialMarkdown?: string;
}

// Pure helper: Parse markdown table into headers and rows
function parseMarkdownTable(md: string): { headers: string[]; rows: string[][] } | null {
  if (!md || !md.includes('|')) return null;

  const lines = md
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|') && l.endsWith('|'));

  if (lines.length < 2) return null;

  const parseRow = (line: string) =>
    line
      .slice(1, -1)
      .split('|')
      .map((c) => c.trim());

  const headers = parseRow(lines[0]);
  // Line 1 is typically divider (| :--- | :--- |)
  const dataLines = lines.slice(2);
  const rows = dataLines.map((line) => {
    const row = parseRow(line);
    while (row.length < headers.length) row.push('');
    return row.slice(0, headers.length);
  });

  return { headers, rows };
}

// Pure helper: Serialize headers and rows into markdown table
function serializeMarkdownTable(headers: string[], rows: string[][]): string {
  if (headers.length === 0) return '';

  const headerLine = '| ' + headers.map((h) => h || '항목').join(' | ') + ' |';
  const dividerLine = '| ' + headers.map(() => ':---').join(' | ') + ' |';
  const rowLines = rows.map(
    (row) =>
      '| ' +
      headers
        .map((_, i) => row[i] || '')
        .join(' | ') +
      ' |'
  );

  return `\n${headerLine}\n${dividerLine}\n${rowLines.join('\n')}\n\n`;
}

export const VisualTableEditor: React.FC<Props> = ({
  isOpen,
  onClose,
  onInsertTable,
  initialMarkdown,
}) => {
  const parsed = initialMarkdown ? parseMarkdownTable(initialMarkdown) : null;

  const [headers, setHeaders] = useState<string[]>(
    parsed?.headers || ['구분', '세부 내용', '담당 / 비고']
  );
  const [rows, setRows] = useState<string[][]>(
    parsed?.rows || [
      ['기본 기능', '사용자 등록 및 로그인 지원', '완료'],
      ['핵심 메커니즘', '단일 HTML 프로토타입 샌드박스 연동', '진행 중'],
      ['내보내기', 'PDF 기획서 및 AI 패키지 다운로드', '대기'],
    ]
  );

  if (!isOpen) return null;

  // Add Column (칸 늘리기)
  const handleAddColumn = () => {
    const newColName = `항목 ${headers.length + 1}`;
    setHeaders([...headers, newColName]);
    setRows(rows.map((r) => [...r, '']));
  };

  // Delete Column
  const handleDeleteColumn = (colIdx: number) => {
    if (headers.length <= 1) {
      alert('표에는 최소 1개의 열(칸)이 있어야 합니다.');
      return;
    }
    setHeaders(headers.filter((_, i) => i !== colIdx));
    setRows(rows.map((r) => r.filter((_, i) => i !== colIdx)));
  };

  // Add Row (줄 늘리기)
  const handleAddRow = () => {
    setRows([...rows, Array(headers.length).fill('')]);
  };

  // Delete Row
  const handleDeleteRow = (rowIdx: number) => {
    if (rows.length <= 1) {
      alert('표에는 최소 1개의 줄(행)이 있어야 합니다.');
      return;
    }
    setRows(rows.filter((_, i) => i !== rowIdx));
  };

  // Update Header Cell
  const handleHeaderChange = (idx: number, val: string) => {
    const next = [...headers];
    next[idx] = val;
    setHeaders(next);
  };

  // Update Body Cell
  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const next = rows.map((r, ri) => {
      if (ri !== rIdx) return r;
      const newRow = [...r];
      newRow[cIdx] = val;
      return newRow;
    });
    setRows(next);
  };

  // Apply Presets
  const applyPreset = (type: 'default' | 'spec' | 'api' | 'schedule') => {
    if (type === 'default') {
      setHeaders(['항목 1', '항목 2', '항목 3']);
      setRows([
        ['내용 1', '내용 2', '내용 3'],
        ['내용 4', '내용 5', '내용 6'],
      ]);
    } else if (type === 'spec') {
      setHeaders(['기능 명칭', '요구사항 상세', '우선순위', '진행 상태']);
      setRows([
        ['회원가입', '소셜 로그인 및 이메일 인증', 'P0', '완료'],
        ['결제 시스템', '결제위젯 및 취소 로직', 'P0', '진행 중'],
        ['마이페이지', '프로필 정보 수정', 'P1', '예정'],
      ]);
    } else if (type === 'api') {
      setHeaders(['파라미터명', '타입', '필수 여부', '상세 설명']);
      setRows([
        ['userId', 'String', '필수', '고유 사용자 식별 ID'],
        ['amount', 'Number', '필수', '결제 승인 요청 금액(원)'],
        ['redirectUrl', 'String', '선택', '인증 성공 후 복귀 URL'],
      ]);
    } else if (type === 'schedule') {
      setHeaders(['단계', '목표 작업', '담당자', '마감일', '상태']);
      setRows([
        ['1단계', '화면 기획서 초안 작성', '기획팀', '2026-09-20', '완료'],
        ['2단계', '프로토타입 메커니즘 검증', '개발팀', '2026-09-25', '진행 중'],
        ['3단계', '최종 검수 및 배포', '전체', '2026-10-05', '대기'],
      ]);
    }
  };

  // Finish and Insert
  const handleApply = () => {
    const md = serializeMarkdownTable(headers, rows);
    onInsertTable(md);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                비주얼 표 편집기
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                마크다운 기호 없이 엑셀처럼 칸을 늘리고 줄이며 내용을 입력하세요
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

        {/* Toolbar & Presets */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              양식:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('default')}
              className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            >
              기본 표
            </button>
            <button
              type="button"
              onClick={() => applyPreset('spec')}
              className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            >
              요구사항 명세표
            </button>
            <button
              type="button"
              onClick={() => applyPreset('api')}
              className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            >
              API 파라미터 규격
            </button>
            <button
              type="button"
              onClick={() => applyPreset('schedule')}
              className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            >
              일정 계획표
            </button>
          </div>

          {/* Size Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              type="button"
              onClick={handleAddColumn}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>+ 칸(열) 늘리기</span>
            </button>

            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition"
            >
              <Rows className="w-3.5 h-3.5" />
              <span>+ 줄(행) 늘리기</span>
            </button>
          </div>
        </div>

        {/* Visual Grid Workspace */}
        <div className="flex-1 p-5 overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
          <div className="inline-block min-w-full align-middle border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 border-collapse">
              {/* Table Header */}
              <thead className="bg-slate-100 dark:bg-slate-800/80">
                <tr>
                  <th className="w-10 px-3 py-2 text-center text-xs font-bold text-slate-400 border-r border-slate-200 dark:border-slate-700">
                    #
                  </th>
                  {headers.map((head, cIdx) => (
                    <th
                      key={cIdx}
                      className="px-2 py-2 text-left text-xs font-bold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700 min-w-[150px]"
                    >
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={head}
                          onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                          placeholder={`열 ${cIdx + 1}`}
                          className="w-full bg-white dark:bg-slate-700 px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteColumn(cIdx)}
                          title="이 열(칸) 삭제"
                          className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="w-12 px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={handleAddColumn}
                      title="새 열(칸) 추가"
                      className="p-1 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="w-10 px-3 py-2 text-center text-xs font-mono text-slate-400 border-r border-slate-100 dark:border-slate-800">
                      {rIdx + 1}
                    </td>
                    {headers.map((_, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-2 py-1.5 border-r border-slate-100 dark:border-slate-800"
                      >
                        <input
                          type="text"
                          value={row[cIdx] || ''}
                          onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                          placeholder="내용 입력..."
                          className="w-full bg-transparent px-2 py-1 text-xs rounded-md focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                        />
                      </td>
                    ))}
                    <td className="w-12 px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(rIdx)}
                        title="이 줄(행) 삭제"
                        className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Row Add at Bottom */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 transition"
            >
              <Plus className="w-4 h-4 text-emerald-500" />
              <span>아래에 새 줄(행) 추가하기</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="text-xs text-slate-500">
            총 <span className="font-bold text-blue-600">{headers.length}칸</span> x{' '}
            <span className="font-bold text-emerald-600">{rows.length}줄</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>표 본문에 삽입하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
