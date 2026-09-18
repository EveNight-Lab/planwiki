/**
 * @domain 프로토타입 & AI 전달
 * @feature 사람 공유용 PDF 인쇄 및 저장
 * @phase 연산
 * @target 기획서 인쇄 및 PDF 변환기
 * @desc 전체 기획서 본문과 목차를 한 권의 보고서 서식으로 정돈하여 PDF로 저장하도록 유도
 */
export function exportWorkspaceToPdf(onExpandAll: () => void): void {
  // 1. Force expand all sections so all content is rendered for printing
  onExpandAll();

  // 2. Short timeout to allow React to update DOM and render all accordion contents
  setTimeout(() => {
    window.print();
  }, 300);
}
