/**
 * @domain 기획 문서 작업
 * @feature 마크다운 기획 작성 & 표/그림 보기
 * @phase 처리
 * @target turndown-plugin-gfm 모듈 타입 선언
 * @desc HTML을 마크다운 표 및 GFM 확장 문법으로 변환하기 위한 플러그인 타입 선언
 */
declare module 'turndown-plugin-gfm' {
  import TurndownService from 'turndown';
  export const gfm: TurndownService.Plugin;
  export const tables: TurndownService.Plugin;
  export const taskListItems: TurndownService.Plugin;
  export const strikethrough: TurndownService.Plugin;
}
