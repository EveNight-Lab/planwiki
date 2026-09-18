/**
 * @domain 프로토타입 & AI 전달
 * @feature 웹 화면 직접 테스트 (코드펜 대체)
 * @phase 입력
 * @trigger '새 기획 항목 추가' 창에서 만들기 버튼 클릭
 * @target 새 기획 항목 생성창
 * @desc 새로운 기획 폴더와 테스트용 단일 HTML 파일을 만들어주는 입력창
 * @next src/components/sandbox/LiveSandbox.tsx
 */
import React, { useState } from 'react';
import { FolderPlus, X, Code } from 'lucide-react';

interface Props {
  isOpen: boolean;
  parentTitle: string;
  defaultOrder: number;
  onClose: () => void;
  onSubmit: (data: {
    dirName: string;
    title: string;
    order: number;
    tags: string[];
    withPrototype: boolean;
  }) => void;
}

export const NewSectionModal: React.FC<Props> = ({
  isOpen,
  parentTitle,
  defaultOrder,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [dirName, setDirName] = useState('');
  const order = defaultOrder;
  const [tagsInput, setTagsInput] = useState('');
  const [withPrototype, setWithPrototype] = useState(false);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    // Auto-generate directory name if not manually edited
    const sanitized = val
      .trim()
      .replace(/[\s\t\n]+/g, '-')
      .replace(/[^a-zA-Z0-9가-힣_-]/g, '');
    const prefix = `${order.toString().padStart(2, '0')}_`;
    setDirName(`${prefix}${sanitized}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dirName.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      title: title.trim(),
      dirName: dirName.trim(),
      order,
      tags,
      withPrototype,
    });

    setTitle('');
    setDirName('');
    setTagsInput('');
    setWithPrototype(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                새 기획 섹션 추가
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[260px]">
                상위: {parentTitle}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              기획 섹션 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="예: PG사 결제위젯 연동 규격"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                생성될 폴더명 (자동 부여)
              </label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                순서: {order}번째 섹션
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 font-mono text-xs text-slate-600 dark:text-slate-300">
              <input
                type="text"
                required
                value={dirName}
                onChange={(e) => setDirName(e.target.value)}
                placeholder="01_폴더명"
                className="w-full bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              목차 순서는 섹션 추가 후 편집 모드에서 <strong>[위/아래 이동]</strong> 및 <strong>[상위/하위 계층 변경]</strong> 버튼으로 언제든 자유롭게 바꿀 수 있습니다.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="예: API, Security, P0"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer">
              <input
                type="checkbox"
                checked={withPrototype}
                onChange={(e) => setWithPrototype(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <div className="text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                  <Code className="w-3.5 h-3.5" /> 검증용 HTML 프로토타입 함께 생성
                </span>
                <span className="text-amber-700/80 dark:text-amber-400 text-[11px] block mt-0.5">
                  preview.html 파일을 폴더 내에 자동 생성합니다.
                </span>
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition"
            >
              생성하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
