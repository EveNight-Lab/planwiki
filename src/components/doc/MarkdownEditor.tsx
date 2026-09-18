// @cohesive-file
/**
 * @domain 기획 문서 작업
 * @feature 마크다운 기획 작성 & 표/그림 보기
 * @phase 입력
 * @trigger 표 만들기, 그림 넣기 버튼 클릭 또는 본문 타이핑
 * @target 기획서 본문 입력창
 * @desc 블로그/노션 스타일 위지윅(비주얼) 편집과 표준 마크다운 원본 편집을 모두 지원하는 하이브리드 에디터
 * @next src/components/doc/MarkdownViewer.tsx
 */
import React, { useState, useEffect, useRef } from 'react';
import { Save } from 'lucide-react';
import { MarkdownViewer } from './MarkdownViewer';
import { VisualTableEditor } from './VisualTableEditor';
import { EditorToolbar } from './EditorToolbar';
import { markdownToHtml, htmlToMarkdown } from '../../lib/markdownConvert';

interface Props {
  initialContent?: string;
  assets?: Record<string, string>;
  onSave?: (content: string) => void;
  onUploadAsset?: (file: File) => Promise<string | null>;
  onClose?: () => void;
}

export const MarkdownEditor: React.FC<Props> = ({
  initialContent = '',
  assets = {},
  onSave = () => {},
  onUploadAsset,
  onClose = () => {},
}) => {
  const [mode, setMode] = useState<'visual' | 'markdown'>('visual');
  const [markdownText, setMarkdownText] = useState(initialContent);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [showTableModal, setShowTableModal] = useState(false);

  const visualEditorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInternalUpdateRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Initialize visual editor with rendered HTML on first mount or reset
  useEffect(() => {
    if (visualEditorRef.current && mode === 'visual' && !hasInitializedRef.current) {
      visualEditorRef.current.innerHTML = markdownToHtml(initialContent, assets);
      hasInitializedRef.current = true;
    }
  }, [mode, initialContent, assets]);

  // Debounced auto-save (1.5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof onSaveRef.current === 'function') {
        onSaveRef.current(markdownText);
      }
      setIsSaved(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [markdownText]);

  // Sync from Visual Editor to Markdown state
  const syncVisualToMarkdown = () => {
    if (!visualEditorRef.current) return;
    isInternalUpdateRef.current = true;
    const html = visualEditorRef.current.innerHTML;
    const md = htmlToMarkdown(html, assets);
    setMarkdownText(md);
    setIsSaved(false);
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 50);
  };

  // Switch between Visual (Blog) and Markdown (Code) modes
  const handleToggleMode = (targetMode: 'visual' | 'markdown') => {
    if (targetMode === mode) return;

    if (targetMode === 'visual') {
      if (visualEditorRef.current) {
        visualEditorRef.current.innerHTML = markdownToHtml(markdownText, assets);
      }
    } else {
      if (visualEditorRef.current) {
        const md = htmlToMarkdown(visualEditorRef.current.innerHTML, assets);
        setMarkdownText(md);
      }
    }
    setMode(targetMode);
  };

  const handleRawTextChange = (val: string) => {
    setMarkdownText(val);
    setIsSaved(false);
  };

  const execFormat = (cmd: string) => {
    if (mode === 'visual') {
      visualEditorRef.current?.focus();
      document.execCommand(cmd, false);
      syncVisualToMarkdown();
    } else {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = markdownText.substring(start, end);
      const wrapper = cmd === 'bold' ? '**' : cmd === 'italic' ? '*' : '';
      const replacement = wrapper + selected + wrapper;
      const newText = markdownText.substring(0, start) + replacement + markdownText.substring(end);
      handleRawTextChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + wrapper.length, start + wrapper.length + selected.length);
      }, 0);
    }
  };

  const handleFormatHeading = (tag: 'h1' | 'h2' | 'p') => {
    if (mode === 'visual') {
      const editor = visualEditorRef.current;
      if (!editor) return;
      editor.focus();

      const tagStr = tag === 'p' ? '<p>' : `<${tag}>`;
      let success = document.execCommand('formatBlock', false, tagStr);
      if (!success) {
        success = document.execCommand('formatBlock', false, tag);
      }

      if (!success && (!editor.innerText || editor.innerText.trim() === '')) {
        editor.innerHTML = `<${tag}>${tag === 'p' ? '내용을 입력하세요.' : `${tag === 'h1' ? '큰제목' : '소제목'} 입력`}</${tag}>`;
      }

      syncVisualToMarkdown();
    } else {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = markdownText.substring(start, end);
      const prefix = tag === 'h1' ? '# ' : tag === 'h2' ? '## ' : '';
      const replacement = prefix + (selected || (tag === 'p' ? '본문' : '제목'));
      const newText = markdownText.substring(0, start) + replacement + markdownText.substring(end);
      handleRawTextChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 2));
      }, 0);
    }
  };

  const insertRawText = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      handleRawTextChange(markdownText + textToInsert);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = markdownText.substring(0, start) + textToInsert + markdownText.substring(end);
    handleRawTextChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const handleInsertCallout = () => {
    if (mode === 'visual') {
      const calloutHtml = `<blockquote><p>💡 <strong>주요 안내</strong>: 기획 세부 정책이나 유의사항을 여기에 작성하세요.</p></blockquote><p><br></p>`;
      document.execCommand('insertHTML', false, calloutHtml);
      syncVisualToMarkdown();
    } else {
      insertRawText(`\n> 💡 **주요 안내**: 기획 세부 정책이나 유의사항을 여기에 작성하세요.\n\n`);
    }
  };

  const handleInsertChecklist = () => {
    if (mode === 'visual') {
      const checklistHtml = `<ul class="task-list"><li><input type="checkbox"> 해야 할 기획 작업 1</li><li><input type="checkbox"> 해야 할 기획 작업 2</li><li><input type="checkbox" checked> 완료된 항목</li></ul><p><br></p>`;
      document.execCommand('insertHTML', false, checklistHtml);
      syncVisualToMarkdown();
    } else {
      insertRawText(`\n- [ ] 해야 할 기획 작업 1\n- [ ] 해야 할 기획 작업 2\n- [x] 이미 완료된 항목\n\n`);
    }
  };

  const handleInsertTable = (tableMd: string) => {
    if (mode === 'visual') {
      const tableHtml = markdownToHtml(tableMd, assets);
      document.execCommand('insertHTML', false, `${tableHtml}<p><br></p>`);
      syncVisualToMarkdown();
    } else {
      insertRawText(`\n${tableMd}\n`);
    }
    setShowTableModal(false);
  };

  const handleAddTableRow = () => {
    if (mode === 'visual' && visualEditorRef.current) {
      const sel = window.getSelection();
      let targetTable: HTMLTableElement | null = null;
      if (sel && sel.anchorNode) {
        const el = sel.anchorNode.nodeType === Node.ELEMENT_NODE
          ? (sel.anchorNode as HTMLElement)
          : sel.anchorNode.parentElement;
        targetTable = el?.closest('table') || null;
      }
      if (!targetTable) {
        targetTable = visualEditorRef.current.querySelector('table');
      }

      if (targetTable) {
        const colCount = targetTable.rows[0]?.cells.length || 3;
        const tbody = targetTable.querySelector('tbody') || targetTable;
        const newRow = document.createElement('tr');
        for (let i = 0; i < colCount; i++) {
          const td = document.createElement('td');
          td.textContent = '새 항목';
          newRow.appendChild(td);
        }
        tbody.appendChild(newRow);
        syncVisualToMarkdown();
        return;
      }
    }
    setShowTableModal(true);
  };

  const handleAddTableCol = () => {
    if (mode === 'visual' && visualEditorRef.current) {
      const sel = window.getSelection();
      let targetTable: HTMLTableElement | null = null;
      if (sel && sel.anchorNode) {
        const el = sel.anchorNode.nodeType === Node.ELEMENT_NODE
          ? (sel.anchorNode as HTMLElement)
          : sel.anchorNode.parentElement;
        targetTable = el?.closest('table') || null;
      }
      if (!targetTable) {
        targetTable = visualEditorRef.current.querySelector('table');
      }

      if (targetTable) {
        const theadRow = targetTable.querySelector('thead tr') || targetTable.rows[0];
        if (theadRow) {
          const th = document.createElement('th');
          th.textContent = '새 열';
          theadRow.appendChild(th);
        }

        const rows = targetTable.querySelectorAll('tbody tr');
        if (rows.length > 0) {
          rows.forEach((row) => {
            const td = document.createElement('td');
            td.textContent = '-';
            row.appendChild(td);
          });
        } else {
          for (let i = 1; i < targetTable.rows.length; i++) {
            const td = document.createElement('td');
            td.textContent = '-';
            targetTable.rows[i].appendChild(td);
          }
        }

        syncVisualToMarkdown();
        return;
      }
    }
    setShowTableModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadAsset) return;

    const assetUrl = await onUploadAsset(file);
    if (assetUrl) {
      if (mode === 'visual') {
        const imgHtml = `<p><img src="${assetUrl}" alt="${file.name}" class="rounded-xl shadow-md my-4 max-w-full" /></p><p><br></p>`;
        document.execCommand('insertHTML', false, imgHtml);
        syncVisualToMarkdown();
      } else {
        insertRawText(`\n![${file.name}](assets/${file.name})\n`);
      }
    }
    e.target.value = '';
  };

  const handleVisualClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      const cb = target as HTMLInputElement;
      if (cb.checked) {
        cb.setAttribute('checked', 'checked');
      } else {
        cb.removeAttribute('checked');
      }
      syncVisualToMarkdown();
    }
  };

  const handleQuickSave = () => {
    if (mode === 'visual' && visualEditorRef.current) {
      const finalMd = htmlToMarkdown(visualEditorRef.current.innerHTML, assets);
      onSave(finalMd);
      setMarkdownText(finalMd);
    } else {
      onSave(markdownText);
    }
    setIsSaved(true);
  };

  const handleSaveAndClose = () => {
    if (mode === 'visual' && visualEditorRef.current) {
      const finalMd = htmlToMarkdown(visualEditorRef.current.innerHTML, assets);
      onSave(finalMd);
    } else {
      onSave(markdownText);
    }
    setIsSaved(true);
    onClose();
  };

  return (
    <div className="border border-blue-200 dark:border-blue-900 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl transition-all">
      {/* Extracted Modular Toolbar */}
      <EditorToolbar
        mode={mode}
        onToggleMode={handleToggleMode}
        onFormatHeading={handleFormatHeading}
        onFormatInline={execFormat}
        onInsertCallout={handleInsertCallout}
        onOpenTableModal={() => setShowTableModal(true)}
        onAddTableRow={handleAddTableRow}
        onAddTableCol={handleAddTableCol}
        onInsertChecklist={handleInsertChecklist}
        onTriggerImageUpload={() => fileInputRef.current?.click()}
        isSaved={isSaved}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onManualSave={handleQuickSave}
        onClose={onClose}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Editor Body */}
      {mode === 'visual' ? (
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 min-h-[380px] max-h-[700px] overflow-y-auto">
          <div
            ref={visualEditorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncVisualToMarkdown}
            onClick={handleVisualClick}
            className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-100 outline-none
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:pb-2 [&_h1]:border-b [&_h1]:border-slate-200 dark:[&_h1]:border-slate-800
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h2]:mt-5 [&_h2]:mb-2.5
              [&_p]:my-2.5 [&_p]:leading-relaxed
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-sm
              [&_th]:bg-slate-100 dark:[&_th]:bg-slate-800 [&_th]:border [&_th]:border-slate-300 dark:[&_th]:border-slate-700 [&_th]:p-2.5 [&_th]:text-left [&_th]:font-semibold
              [&_td]:border [&_td]:border-slate-200 dark:[&_td]:border-slate-800 [&_td]:p-2.5
              [&_tr:nth-child(even)]:bg-slate-50/60 dark:[&_tr:nth-child(even)]:bg-slate-800/40
              [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-blue-50/50 dark:[&_blockquote]:bg-blue-950/20 [&_blockquote]:py-2.5 [&_blockquote]:px-4 [&_blockquote]:rounded-r-lg
              [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
              [&_li:has(input:checked)]:line-through [&_li:has(input:checked)]:opacity-60 [&_li:has(input:checked)]:text-slate-400
              [&_img]:rounded-xl [&_img]:shadow-md [&_img]:max-w-full [&_img]:my-4"
          />
        </div>
      ) : (
        <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800' : 'grid-cols-1'}`}>
          <div className="p-3 sm:p-4 bg-white dark:bg-slate-900">
            <textarea
              ref={textareaRef}
              value={markdownText}
              onChange={(e) => handleRawTextChange(e.target.value)}
              placeholder="마크다운 원본 내용을 입력하세요..."
              className="w-full h-72 sm:h-80 lg:h-96 resize-y font-mono text-base sm:text-sm leading-relaxed p-2 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
              spellCheck={false}
            />
          </div>

          {showPreview && (
            <div className="p-5 max-h-96 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
              <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-3">
                실시간 렌더링 미리보기
              </div>
              <MarkdownViewer content={markdownText} assets={assets} />
            </div>
          )}
        </div>
      )}

      {/* Editor Footer Actions Bar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 text-xs">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans truncate min-w-0 order-2 sm:order-1">
          {mode === 'visual'
            ? '💡 블로그 작성 모드: 글자를 드래그하여 굵게/기울임을 주거나, 표의 칸을 클릭해 바로 작성하세요.'
            : '💻 마크다운 원본 모드: 표준 GFM 마크다운 문법으로 직접 작성 중입니다.'}
        </span>
        <div className="flex items-center gap-2 shrink-0 ml-auto order-1 sm:order-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition whitespace-nowrap shrink-0"
          >
            취소 / 닫기
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition active:scale-95 whitespace-nowrap shrink-0"
          >
            <Save className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">저장 및 완료</span>
          </button>
        </div>
      </div>

      {/* Visual Table Editor Modal */}
      <VisualTableEditor
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onInsertTable={handleInsertTable}
      />
    </div>
  );
};
