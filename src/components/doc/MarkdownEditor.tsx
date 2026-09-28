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
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Trash2, Plus } from 'lucide-react';
import { MarkdownViewer } from './MarkdownViewer';
import { VisualTableEditor } from './VisualTableEditor';
import { EditorToolbar } from './EditorToolbar';
import { SmartFloatingToolbar } from './SmartFloatingToolbar';
import { markdownToHtml, htmlToMarkdown, createPrototypeWidgetHtml } from '../../lib/markdownConvert';
import { DEFAULT_INLINE_HTML_CONTENT, DEFAULT_INLINE_HTML_TEMPLATE } from '../../lib/markdownSegments';

interface Props {
  initialContent?: string;
  assets?: Record<string, string>;
  onSave?: (content: string) => void;
  onUploadAsset?: (file: File) => Promise<string | null>;
  onClose?: () => void;
  hideBottomCloseButton?: boolean;
}

export const MarkdownEditor: React.FC<Props> = ({
  initialContent = '',
  assets = {},
  onSave = () => {},
  onUploadAsset,
  onClose = () => {},
  hideBottomCloseButton = false,
}) => {
  const [mode, setMode] = useState<'visual' | 'markdown'>('visual');
  const [markdownText, setMarkdownText] = useState(initialContent);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [showTableModal, setShowTableModal] = useState(false);

  interface ActiveBlockInfo {
    type: 'image' | 'table' | 'callout';
    element: HTMLElement;
    top: number;
    left: number;
  }
  const [activeBlock, setActiveBlock] = useState<ActiveBlockInfo | null>(null);

  const visualEditorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInternalUpdateRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const onSaveRef = useRef(onSave);
  const localAssetsRef = useRef<Record<string, string>>({ ...assets });
  useEffect(() => {
    localAssetsRef.current = { ...localAssetsRef.current, ...assets };
  }, [assets]);

  // 블록 액션 툴바 위치 계산
  const updateActiveBlockPos = useCallback((el: HTMLElement, type: 'image' | 'table' | 'callout') => {
    const rect = el.getBoundingClientRect();
    const toolbarWidth = type === 'table' ? 240 : 120;
    const toolbarHeight = 36;

    // 수평: 요소 우측 상단 정렬 (화면 안전 마진 10px)
    const idealLeft = rect.right - toolbarWidth;
    const clampedLeft = Math.max(10, Math.min(window.innerWidth - toolbarWidth - 10, idealLeft));

    // 수직: 요소 바로 위 (공간 부족 시 요소 바로 아래)
    let idealTop = rect.top - toolbarHeight - 6;
    if (idealTop < 8) {
      idealTop = rect.bottom + 6;
    }
    const clampedTop = Math.max(8, Math.min(window.innerHeight - toolbarHeight - 8, idealTop));

    setActiveBlock({
      type,
      element: el,
      top: clampedTop,
      left: clampedLeft,
    });
  }, []);

  // 스크롤 시 블록 위치 동기화
  useEffect(() => {
    const handleScroll = () => {
      if (activeBlock) {
        if (!document.body.contains(activeBlock.element)) {
          setActiveBlock(null);
        } else {
          updateActiveBlockPos(activeBlock.element, activeBlock.type);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [activeBlock, updateActiveBlockPos]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Initialize visual editor with rendered HTML on first mount or reset
  useEffect(() => {
    if (visualEditorRef.current && mode === 'visual' && !hasInitializedRef.current) {
      visualEditorRef.current.innerHTML = markdownToHtml(initialContent, localAssetsRef.current);
      hasInitializedRef.current = true;
    }
  }, [mode, initialContent]);

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
    const md = htmlToMarkdown(html, localAssetsRef.current);
    setMarkdownText(md);
    setIsSaved(false);
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 50);
  };

  // Backspace / Delete 키로 선택된 이미지나 블록 즉각 삭제
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!activeBlock) return;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (activeBlock.type === 'image') {
          e.preventDefault();
          activeBlock.element.remove();
          setActiveBlock(null);
          syncVisualToMarkdown();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeBlock]);

  // Switch between Visual (Blog) and Markdown (Code) modes
  const handleToggleMode = (targetMode: 'visual' | 'markdown') => {
    if (targetMode === mode) return;

    if (targetMode === 'visual') {
      if (visualEditorRef.current) {
        visualEditorRef.current.innerHTML = markdownToHtml(markdownText, localAssetsRef.current);
      }
    } else {
      if (visualEditorRef.current) {
        const md = htmlToMarkdown(visualEditorRef.current.innerHTML, localAssetsRef.current);
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

  const handleInsertInlineSandbox = () => {
    if (mode === 'visual') {
      const widgetHtml = createPrototypeWidgetHtml(DEFAULT_INLINE_HTML_CONTENT);
      document.execCommand('insertHTML', false, widgetHtml);
      syncVisualToMarkdown();
      setTimeout(() => {
        if (visualEditorRef.current) {
          const widgets = visualEditorRef.current.querySelectorAll('.prototype-embed-widget');
          const lastWidget = widgets[widgets.length - 1];
          if (lastWidget) {
            let next = lastWidget.nextElementSibling;
            if (!next || next.classList.contains('prototype-embed-widget')) {
              const p = document.createElement('p');
              p.innerHTML = '<br>';
              lastWidget.after(p);
              next = p;
            }
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(next, 0);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }
      }, 50);
    } else {
      insertRawText(`\n${DEFAULT_INLINE_HTML_TEMPLATE.trim()}\n\n`);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadAsset) return;

    const assetUrl = await onUploadAsset(file);
    if (assetUrl) {
      localAssetsRef.current[file.name] = assetUrl;
      if (mode === 'visual') {
        const imgHtml = `<p><img src="${assetUrl}" data-asset-name="${file.name}" alt="${file.name}" class="rounded-xl shadow-md my-4 max-w-full" /></p><p><br></p>`;
        document.execCommand('insertHTML', false, imgHtml);
        syncVisualToMarkdown();
      } else {
        insertRawText(`\n![${file.name}](assets/${file.name})\n`);
      }
    }
    e.target.value = '';
  };

  const handleDeleteImage = () => {
    if (!activeBlock || activeBlock.type !== 'image') return;
    activeBlock.element.remove();
    setActiveBlock(null);
    syncVisualToMarkdown();
  };

  const handleAddTableRow = () => {
    if (!activeBlock || activeBlock.type !== 'table') return;
    const table = activeBlock.element as HTMLTableElement;
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) return;
    const colCount = rows[0].children.length;
    const newRow = document.createElement('tr');
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement('td');
      td.innerHTML = '<br>';
      newRow.appendChild(td);
    }
    const tbody = table.querySelector('tbody') || table;
    tbody.appendChild(newRow);
    syncVisualToMarkdown();
    updateActiveBlockPos(table, 'table');
  };

  const handleAddTableColumn = () => {
    if (!activeBlock || activeBlock.type !== 'table') return;
    const table = activeBlock.element as HTMLTableElement;
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, idx) => {
      if (idx === 0 && row.querySelector('th')) {
        const th = document.createElement('th');
        th.innerText = '새 열';
        row.appendChild(th);
      } else {
        const td = document.createElement('td');
        td.innerHTML = '<br>';
        row.appendChild(td);
      }
    });
    syncVisualToMarkdown();
    updateActiveBlockPos(table, 'table');
  };

  const handleDeleteTable = () => {
    if (!activeBlock || activeBlock.type !== 'table') return;
    activeBlock.element.remove();
    setActiveBlock(null);
    syncVisualToMarkdown();
  };

  const handleDeleteCallout = () => {
    if (!activeBlock || activeBlock.type !== 'callout') return;
    activeBlock.element.remove();
    setActiveBlock(null);
    syncVisualToMarkdown();
  };

  const handleVisualClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // 0. 이미지 선택 감지
    if (target.tagName === 'IMG') {
      e.stopPropagation();
      visualEditorRef.current?.querySelectorAll('img').forEach((img) => {
        img.classList.remove('ring-4', 'ring-blue-500', 'ring-offset-2');
      });
      target.classList.add('ring-4', 'ring-blue-500', 'ring-offset-2');
      updateActiveBlockPos(target, 'image');
      return;
    }

    // 0-1. 표 선택 감지 (TD, TH, TABLE)
    const tableEl = target.closest('table');
    if (tableEl) {
      visualEditorRef.current?.querySelectorAll('img').forEach((img) => {
        img.classList.remove('ring-4', 'ring-blue-500', 'ring-offset-2');
      });
      updateActiveBlockPos(tableEl, 'table');
      return;
    }

    // 0-2. 콜아웃 선택 감지 (BLOCKQUOTE)
    const blockquoteEl = target.closest('blockquote');
    if (blockquoteEl) {
      visualEditorRef.current?.querySelectorAll('img').forEach((img) => {
        img.classList.remove('ring-4', 'ring-blue-500', 'ring-offset-2');
      });
      updateActiveBlockPos(blockquoteEl, 'callout');
      return;
    }

    // 일반 텍스트나 다른 곳 클릭 시 이미지 선택 링 및 액션 메뉴 해제
    visualEditorRef.current?.querySelectorAll('img').forEach((img) => {
      img.classList.remove('ring-4', 'ring-blue-500', 'ring-offset-2');
    });
    setActiveBlock(null);

    // 1. Checkbox toggle
    if (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      const cb = target as HTMLInputElement;
      if (cb.checked) {
        cb.setAttribute('checked', 'checked');
      } else {
        cb.removeAttribute('checked');
      }
      syncVisualToMarkdown();
      return;
    }

    // 2. Prototype: 뷰포트 데스크톱 전환
    const desktopBtn = target.closest('.prototype-viewport-desktop');
    if (desktopBtn) {
      e.preventDefault();
      e.stopPropagation();
      const widget = desktopBtn.closest('.prototype-embed-widget');
      const mobileBtn = widget?.querySelector('.prototype-viewport-mobile');
      const container = widget?.querySelector('.prototype-iframe-container');
      const iframe = widget?.querySelector('iframe');
      if (widget && container) {
        container.className = 'prototype-iframe-container w-full transition-all duration-300 bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800 max-w-full';
        if (iframe) {
          iframe.className = 'w-full h-80 border-none block pointer-events-auto';
        }
        desktopBtn.className = 'prototype-viewport-desktop p-1.5 rounded-md text-white bg-slate-700 transition';
        if (mobileBtn) {
          mobileBtn.className = 'prototype-viewport-mobile p-1.5 rounded-md text-slate-400 hover:text-white transition';
        }
      }
      return;
    }

    // 3. Prototype: 뷰포트 모바일 전환 (375px 스마트폰 프레임)
    const mobileBtn = target.closest('.prototype-viewport-mobile');
    if (mobileBtn) {
      e.preventDefault();
      e.stopPropagation();
      const widget = mobileBtn.closest('.prototype-embed-widget');
      const desktopBtnEl = widget?.querySelector('.prototype-viewport-desktop');
      const container = widget?.querySelector('.prototype-iframe-container');
      const iframe = widget?.querySelector('iframe');
      if (widget && container) {
        container.className = 'prototype-iframe-container w-full transition-all duration-300 bg-white dark:bg-slate-950 overflow-hidden max-w-[375px] rounded-[36px] border-[6px] border-slate-800 shadow-2xl ring-1 ring-slate-700/50 flex flex-col shrink-0';
        if (iframe) {
          iframe.className = 'w-full border-none block transition-all duration-300 h-[580px] pointer-events-auto';
        }
        mobileBtn.className = 'prototype-viewport-mobile p-1.5 rounded-md text-white bg-slate-700 transition';
        if (desktopBtnEl) {
          desktopBtnEl.className = 'prototype-viewport-desktop p-1.5 rounded-md text-slate-400 hover:text-white transition';
        }
      }
      return;
    }

    // 4. Prototype: 코드 편집 패널 열기/닫기
    const codeToggleBtn = target.closest('.prototype-code-toggle') || target.closest('.prototype-code-close-btn');
    if (codeToggleBtn) {
      e.preventDefault();
      e.stopPropagation();
      const widget = codeToggleBtn.closest('.prototype-embed-widget');
      const panel = widget?.querySelector('.prototype-code-panel');
      if (panel) {
        panel.classList.toggle('hidden');
      }
      return;
    }

    // 5. Prototype: 코드 지우기
    const codeClearBtn = target.closest('.prototype-code-clear-btn');
    if (codeClearBtn) {
      e.preventDefault();
      e.stopPropagation();
      const widget = codeClearBtn.closest('.prototype-embed-widget');
      const textarea = widget?.querySelector('.prototype-code-textarea') as HTMLTextAreaElement | null;
      const iframe = widget?.querySelector('iframe') as HTMLIFrameElement | null;
      if (widget && textarea) {
        textarea.value = '';
        widget.setAttribute('data-prototype-code', '');
        if (iframe) {
          iframe.srcdoc = '';
        }
        syncVisualToMarkdown();
      }
      return;
    }

    // 6. Prototype: 화면 새로고침
    const reloadBtn = target.closest('.prototype-reload-btn');
    if (reloadBtn) {
      e.preventDefault();
      e.stopPropagation();
      const widget = reloadBtn.closest('.prototype-embed-widget');
      const iframe = widget?.querySelector('iframe') as HTMLIFrameElement | null;
      if (iframe) {
        const currentSrcDoc = iframe.srcdoc;
        iframe.srcdoc = '';
        setTimeout(() => {
          iframe.srcdoc = currentSrcDoc;
        }, 50);
      }
      return;
    }

    // 7. Prototype: 전체화면 토글
    const fullscreenBtn = target.closest('.prototype-fullscreen-btn');
    if (fullscreenBtn) {
      e.preventDefault();
      e.stopPropagation();
      const widget = fullscreenBtn.closest('.prototype-embed-widget');
      if (widget) {
        const isFull = widget.classList.contains('fixed');
        if (isFull) {
          widget.classList.remove('fixed', 'inset-0', 'z-50', 'm-0', 'rounded-none', 'h-screen', 'w-screen', 'flex', 'flex-col');
          widget.classList.add('my-6', 'rounded-2xl');
        } else {
          widget.classList.remove('my-6', 'rounded-2xl');
          widget.classList.add('fixed', 'inset-0', 'z-50', 'm-0', 'rounded-none', 'h-screen', 'w-screen', 'flex', 'flex-col');
        }
      }
      return;
    }

    // 8. Prototype: 새 탭에서 열기
    const externalBtn = target.closest('.prototype-external-btn');
    if (externalBtn) {
      e.preventDefault();
      e.stopPropagation();
      const widget = externalBtn.closest('.prototype-embed-widget');
      if (widget) {
        const encoded = widget.getAttribute('data-prototype-code') || '';
        const code = encoded ? decodeURIComponent(encoded) : '';
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
      return;
    }

    // 9. Prototype: 블록 삭제
    const deleteBtn = target.closest('.prototype-delete-btn');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (confirm('이 프로토타입 블록을 삭제하시겠습니까?')) {
        const widget = deleteBtn.closest('.prototype-embed-widget');
        if (widget) {
          widget.remove();
          syncVisualToMarkdown();
        }
      }
      return;
    }

    // 10. Prototype: 위젯 여백/외곽 클릭 시 바로 아래 문단으로 커서 이동
    const widgetCard = target.closest('.prototype-embed-widget');
    if (widgetCard && !target.closest('button') && !target.closest('textarea') && !target.closest('iframe')) {
      let next = widgetCard.nextElementSibling;
      if (!next || next.classList.contains('prototype-embed-widget')) {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        widgetCard.after(p);
        next = p;
      }
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(next);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
      syncVisualToMarkdown();
    }
  };

  const handleEditorWrapperClick = (e: React.MouseEvent) => {
    if (!visualEditorRef.current) return;
    const editor = visualEditorRef.current;
    
    // 에디터 바닥 빈 여백을 클릭했거나 위젯 바깥을 클릭했을 때
    if (e.target === e.currentTarget || e.target === editor) {
      let last = editor.lastElementChild;
      if (!last || last.classList.contains('prototype-embed-widget') || last.tagName === 'TABLE') {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        editor.appendChild(p);
        last = p;
      }
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(last);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      syncVisualToMarkdown();
    }
  };

  const handleQuickSave = () => {
    if (mode === 'visual' && visualEditorRef.current) {
      const finalMd = htmlToMarkdown(visualEditorRef.current.innerHTML, localAssetsRef.current);
      onSave(finalMd);
      setMarkdownText(finalMd);
    } else {
      onSave(markdownText);
    }
    setIsSaved(true);
  };

  const handleSaveAndClose = () => {
    if (mode === 'visual' && visualEditorRef.current) {
      const finalMd = htmlToMarkdown(visualEditorRef.current.innerHTML, localAssetsRef.current);
      onSave(finalMd);
    } else {
      onSave(markdownText);
    }
    setIsSaved(true);
    onClose();
  };

  return (
    <div className="border border-blue-200 dark:border-blue-900 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl transition-all">
      {/* Minimal Header Toolbar */}
      <EditorToolbar
        mode={mode}
        onToggleMode={handleToggleMode}
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
        <div
          onClick={handleEditorWrapperClick}
          className="p-4 sm:p-6 bg-white dark:bg-slate-900 min-h-[380px] max-h-[700px] overflow-y-auto cursor-text"
        >
          <div
            ref={visualEditorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              const target = e.target as HTMLElement;
              if (target && target.classList?.contains('prototype-code-textarea')) {
                const widget = target.closest('.prototype-embed-widget');
                const textarea = target as HTMLTextAreaElement;
                const iframe = widget?.querySelector('iframe') as HTMLIFrameElement | null;
                if (widget && iframe) {
                  widget.setAttribute('data-prototype-code', encodeURIComponent(textarea.value));
                  iframe.srcdoc = textarea.value;
                }
              }
              syncVisualToMarkdown();
            }}
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
        {!hideBottomCloseButton && (
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
        )}
      </div>

      {/* Visual Table Editor Modal */}
      <VisualTableEditor
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onInsertTable={handleInsertTable}
      />

      {/* 스마트 컨텍스추얼 플로팅 도구함 및 퀵 생성 FAB */}
      <SmartFloatingToolbar
        editorRef={visualEditorRef}
        textareaRef={textareaRef}
        mode={mode}
        onFormatInline={execFormat}
        onFormatHeading={handleFormatHeading}
        onOpenTableModal={() => setShowTableModal(true)}
        onInsertChecklist={handleInsertChecklist}
        onInsertCallout={handleInsertCallout}
        onInsertInlineSandbox={handleInsertInlineSandbox}
        onTriggerImageUpload={() => fileInputRef.current?.click()}
      />

      {/* 🎯 플로팅 블록 액션 바: 이미지, 표, 콜아웃 클릭 시 즉시 노출되는 삭제/조작 툴팁 */}
      {activeBlock && mode === 'visual' && (
        <div
          style={{ top: `${activeBlock.top}px`, left: `${activeBlock.left}px` }}
          className="fixed z-50 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-xl p-1 border border-slate-700 shadow-2xl flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100 select-none text-xs"
        >
          {activeBlock.type === 'image' && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleDeleteImage();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-semibold transition active:scale-95 shadow-xs"
              title="이 이미지 삭제 (Backspace 키로도 삭제 가능)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>이미지 삭제</span>
            </button>
          )}

          {activeBlock.type === 'table' && (
            <>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAddTableRow();
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200 transition"
                title="표 아래에 새 행 추가"
              >
                <Plus className="w-3 h-3 text-blue-400" />
                <span>행 추가</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAddTableColumn();
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200 transition"
                title="표 우측에 새 열 추가"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>열 추가</span>
              </button>
              <div className="w-px h-3.5 bg-slate-700 mx-0.5" />
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleDeleteTable();
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-950/60 text-red-400 hover:text-red-300 font-semibold transition"
                title="표 전체 삭제"
              >
                <Trash2 className="w-3 h-3" />
                <span>표 삭제</span>
              </button>
            </>
          )}

          {activeBlock.type === 'callout' && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleDeleteCallout();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-semibold transition active:scale-95 shadow-xs"
              title="콜아웃 박스 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>콜아웃 삭제</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
