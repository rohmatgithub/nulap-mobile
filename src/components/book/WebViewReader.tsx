import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { colors, fonts } from '@/constants/theme';
import type { Highlight, HighlightColor } from '@/types/book';

interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  theme: 'dark' | 'sepia' | 'light';
}

interface WebViewReaderProps {
  content: string;
  settings: ReaderSettings;
  highlights?: Highlight[];
  onTextSelected?: (text: string, color: HighlightColor, paragraphIndex: number, startOffset: number, endOffset: number) => void;
  onOpenMoreOptions?: (text: string, paragraphIndex: number, startOffset: number, endOffset: number) => void;
  onHighlightClick?: (highlight: Highlight, position: { x: number; y: number }) => void;
  onScroll?: (scrollY: number, contentHeight: number, viewHeight: number) => void;
  onContentReady?: () => void;
  initialScrollPosition?: number;
}

const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: 'rgba(196, 169, 81, 0.4)',
  green: 'rgba(74, 124, 89, 0.4)',
  blue: 'rgba(90, 143, 168, 0.4)',
  red: 'rgba(184, 74, 74, 0.4)',
};

function getThemeColors(theme: string) {
  switch (theme) {
    case 'sepia':
      return {
        bg: '#2A2318',
        text: '#E8DFC9',
        muted: '#A09080',
        border: '#4A4038',
      };
    case 'light':
      return {
        bg: '#F5F3ED',
        text: '#1A1A18',
        muted: '#6A6A5A',
        border: '#D5D5C8',
      };
    default:
      return {
        bg: colors.base,
        text: colors.textPrimary,
        muted: colors.textSecondary,
        border: colors.border,
      };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Apply highlight to a specific position in text
function applyHighlightAtOffset(
  text: string,
  highlight: Highlight,
  startOffset: number,
  endOffset: number
): string {
  // Validate offsets
  if (startOffset < 0 || endOffset > text.length || startOffset >= endOffset) {
    return text;
  }

  const highlightData = JSON.stringify({
    id: highlight.id,
    text: highlight.text,
    color: highlight.color,
    note: highlight.note,
    flashcard_id: highlight.flashcard_id,
  }).replace(/"/g, '&quot;');

  const hasNote = !!highlight.note;
  const borderStyle = hasNote ? 'border-bottom: 2px dotted currentColor;' : '';

  const before = text.slice(0, startOffset);
  const highlightedText = text.slice(startOffset, endOffset);
  const after = text.slice(endOffset);

  return `${before}<span class="highlight-${highlight.color} highlight-clickable" data-highlight='${highlightData}' style="${borderStyle}" onclick="handleHighlightClick(event, this)">${escapeHtml(highlightedText)}</span>${after}`;
}

// Group highlights by paragraph index
function groupHighlightsByParagraph(highlights: Highlight[]): Map<number, Highlight[]> {
  const grouped = new Map<number, Highlight[]>();

  for (const highlight of highlights) {
    const pIndex = highlight.paragraph_index ?? -1;
    if (pIndex < 0) continue;

    const existing = grouped.get(pIndex) || [];
    existing.push(highlight);
    grouped.set(pIndex, existing);
  }

  // Sort highlights within each paragraph by start_offset (descending)
  // so we can apply them from end to start without offset shifting
  for (const [key, value] of grouped) {
    value.sort((a, b) => (b.start_offset ?? 0) - (a.start_offset ?? 0));
    grouped.set(key, value);
  }

  return grouped;
}

function markdownToHtmlWithHighlights(markdown: string, highlights: Highlight[]): string {
  const highlightsByParagraph = groupHighlightsByParagraph(highlights);

  const lines = markdown.split('\n');
  let paragraphIndex = 0;
  const processedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      processedLines.push('');
      continue;
    }

    // Check if this line will become a paragraph-like element
    const isParagraphLike =
      trimmed.startsWith('# ') ||
      trimmed.startsWith('## ') ||
      trimmed.startsWith('### ') ||
      trimmed.startsWith('> ') ||
      trimmed.startsWith('- ') ||
      /^\d+\. /.test(trimmed) ||
      (!trimmed.startsWith('---') && !trimmed.startsWith('***'));

    if (!isParagraphLike) {
      // Non-paragraph elements (hr, etc.) - just escape and pass through
      processedLines.push(escapeHtml(trimmed));
      continue;
    }

    // Get highlights for this paragraph
    const paragraphHighlights = highlightsByParagraph.get(paragraphIndex) || [];

    // Extract content based on line type
    let content = trimmed;
    let prefix = '';
    let suffix = '';

    if (trimmed.startsWith('### ')) {
      prefix = '<h3>';
      suffix = '</h3>';
      content = trimmed.slice(4);
    } else if (trimmed.startsWith('## ')) {
      prefix = '<h2>';
      suffix = '</h2>';
      content = trimmed.slice(3);
    } else if (trimmed.startsWith('# ')) {
      prefix = '<h1>';
      suffix = '</h1>';
      content = trimmed.slice(2);
    } else if (trimmed.startsWith('> ')) {
      prefix = '<blockquote>';
      suffix = '</blockquote>';
      content = trimmed.slice(2);
    } else if (trimmed.startsWith('- ')) {
      prefix = '<li>';
      suffix = '</li>';
      content = trimmed.slice(2);
    } else if (/^\d+\. /.test(trimmed)) {
      prefix = '<li>';
      suffix = '</li>';
      content = trimmed.replace(/^\d+\. /, '');
    } else {
      prefix = '<p>';
      suffix = '</p>';
    }

    // Apply highlights to content (from end to start to preserve offsets)
    let processedContent = content;
    for (const highlight of paragraphHighlights) {
      const start = highlight.start_offset ?? 0;
      const end = highlight.end_offset ?? (start + highlight.text.length);
      processedContent = applyHighlightAtOffset(processedContent, highlight, start, end);
    }

    // If no highlights were applied, escape the content
    if (paragraphHighlights.length === 0) {
      processedContent = escapeHtml(processedContent);
    }

    // Apply inline markdown formatting to the content
    processedContent = processedContent
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

    processedLines.push(`${prefix}${processedContent}${suffix}`);
    paragraphIndex++;
  }

  // Post-process: wrap consecutive li elements in ul
  let result = processedLines.join('\n');
  result = result.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Handle horizontal rules
  result = result.replace(/^---$/gm, '<hr>');
  result = result.replace(/^\*\*\*$/gm, '<hr>');

  return result;
}

function generateHtml(
  content: string,
  settings: ReaderSettings,
  highlights: Highlight[] = []
): string {
  const themeColors = getThemeColors(settings.theme);

  // Use the new function that applies highlights at specific positions
  const htmlContent = markdownToHtmlWithHighlights(content, highlights);

  const highlightStyles = Object.entries(HIGHLIGHT_COLORS)
    .map(([color, bg]) => `.highlight-${color} { background-color: ${bg}; }`)
    .join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Space+Mono:wght@400;700&display=swap');

    * {
      -webkit-touch-callout: default;
      -webkit-user-select: text;
      user-select: text;
    }

    body {
      background-color: ${themeColors.bg};
      color: ${themeColors.text};
      font-family: 'Lora', serif;
      font-size: ${settings.fontSize}px;
      line-height: ${settings.lineHeight};
      padding: 24px 16px;
      margin: 0;
      -webkit-text-size-adjust: 100%;
    }

    h1, h2, h3 {
      font-family: 'Space Mono', monospace;
      font-weight: 700;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }

    h1 { font-size: 1.6em; }
    h2 { font-size: 1.4em; }
    h3 { font-size: 1.2em; }

    p {
      margin: 0.8em 0;
    }

    strong {
      font-weight: 700;
    }

    em {
      font-style: italic;
    }

    code {
      background-color: ${colors.surfaceRaised};
      color: ${colors.accentTertiary};
      font-family: 'Space Mono', monospace;
      padding: 2px 4px;
      font-size: 0.9em;
    }

    blockquote {
      border-left: 3px solid ${colors.accentTertiary};
      padding-left: 16px;
      margin: 1em 0;
      color: ${themeColors.muted};
      font-style: italic;
    }

    hr {
      border: none;
      height: 1px;
      background-color: ${themeColors.border};
      margin: 1.5em 0;
    }

    ul, ol {
      padding-left: 24px;
      margin: 0.8em 0;
    }

    li {
      margin: 0.3em 0;
    }

    ${highlightStyles}

    .highlight-clickable {
      cursor: pointer;
      border-radius: 2px;
      padding: 0 2px;
    }

    ::selection {
      background-color: ${colors.accentPrimary};
      color: white;
    }

    .highlight-popup {
      display: none;
      position: fixed;
      z-index: 1000;
      flex-direction: column;
      align-items: center;
    }

    .highlight-popup.visible {
      display: flex;
    }

    .popup-main {
      display: flex;
      align-items: center;
      background: ${colors.surface};
      border: 2px solid ${colors.borderStrong};
      box-shadow: 4px 4px 0px ${colors.borderStrong};
      padding: 8px 10px;
      gap: 6px;
    }

    .color-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.1s;
    }

    .color-btn:active {
      transform: scale(1.15);
    }

    .divider {
      width: 1px;
      height: 24px;
      background: ${colors.border};
      margin: 0 4px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: ${colors.textSecondary};
    }

    .action-btn svg {
      width: 18px;
      height: 18px;
    }

    .action-btn.loading {
      opacity: 0.6;
      pointer-events: none;
    }

    .text-preview {
      margin-top: 4px;
      max-width: 200px;
      padding: 4px 8px;
      background: ${colors.surfaceRaised};
      border: 1px solid ${colors.border};
      font-size: 11px;
      color: ${colors.textSecondary};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dictionary-panel {
      display: none;
      width: min(300px, calc(100vw - 24px));
      margin-top: 8px;
      background: ${colors.surface};
      border: 2px solid ${colors.borderStrong};
      box-shadow: 4px 4px 0px ${colors.borderStrong};
      color: ${colors.textPrimary};
    }

    .dictionary-panel.visible {
      display: block;
    }

    .dictionary-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 12px;
      border-bottom: 2px solid ${colors.border};
    }

    .dictionary-label {
      margin: 0 0 4px;
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: ${colors.textSecondary};
    }

    .dictionary-word-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .dictionary-word {
      margin: 0;
      font-family: 'Space Mono', monospace;
      font-size: 18px;
      font-weight: 700;
      line-height: 1.1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dictionary-pos {
      flex-shrink: 0;
      padding: 2px 6px;
      border: 1px solid ${colors.border};
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: ${colors.textSecondary};
    }

    .dictionary-close {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      background: transparent;
      border: none;
      color: ${colors.textSecondary};
      font-size: 20px;
      line-height: 1;
    }

    .dictionary-body {
      padding: 10px 12px 12px;
      font-size: 13px;
      line-height: 1.45;
    }

    .dictionary-body.loading,
    .dictionary-body.error {
      color: ${colors.textSecondary};
    }

    .dictionary-body.error {
      color: ${colors.danger};
    }

    .dictionary-example {
      margin: 10px 0 0;
      padding-left: 10px;
      border-left: 2px solid ${colors.accentPrimary};
      color: ${colors.textSecondary};
      font-style: italic;
    }

    .dictionary-phonetic {
      margin: 4px 0 0;
      font-size: 11px;
      color: ${colors.textSecondary};
    }
  </style>
</head>
<body>
  <div id="content">${htmlContent}</div>

  <div id="highlight-popup" class="highlight-popup">
    <div class="popup-main">
      <div class="color-btn" style="background: #C4A951; border-color: #A89040;" onclick="selectColor('yellow')"></div>
      <div class="color-btn" style="background: #4A7C59; border-color: #3A6249;" onclick="selectColor('green')"></div>
      <div class="color-btn" style="background: #5A8FA8; border-color: #4A7F98;" onclick="selectColor('blue')"></div>
      <div class="color-btn" style="background: #B84A4A; border-color: #A83A3A;" onclick="selectColor('red')"></div>
      <div class="divider"></div>
      <button id="dictionary-btn" class="action-btn" onclick="lookupDictionary()" title="Dictionary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"></path>
        </svg>
      </button>
      <button class="action-btn" onclick="openMore()" title="More options">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>
      </button>
      <button class="action-btn" onclick="closePopup()" title="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div id="text-preview" class="text-preview"></div>
    <div id="dictionary-panel" class="dictionary-panel">
      <div class="dictionary-header">
        <div>
          <p class="dictionary-label">Dictionary</p>
          <div class="dictionary-word-row">
            <h3 id="dictionary-word" class="dictionary-word"></h3>
            <span id="dictionary-pos" class="dictionary-pos"></span>
          </div>
          <p id="dictionary-phonetic" class="dictionary-phonetic"></p>
        </div>
        <button class="dictionary-close" onclick="closeDictionary()" title="Close dictionary">x</button>
      </div>
      <div id="dictionary-body" class="dictionary-body"></div>
    </div>
  </div>

  <script>
    let selectedText = '';
    let selectionStart = 0;
    let selectionEnd = 0;

    function handleHighlightClick(event, element) {
      event.stopPropagation();
      event.preventDefault();

      // Clear any text selection
      window.getSelection().removeAllRanges();
      document.getElementById('highlight-popup').classList.remove('visible');

      const highlightData = JSON.parse(element.getAttribute('data-highlight'));
      const rect = element.getBoundingClientRect();

      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'highlightClick',
        highlight: highlightData,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.bottom + 8
        }
      }));
    }

    let paragraphIndex = -1;

    function findParagraphElement(node) {
      while (node && node.id !== 'content') {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.tagName;
          if (tag === 'P' || tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'LI' || tag === 'BLOCKQUOTE') {
            return node;
          }
        }
        node = node.parentNode;
      }
      return null;
    }

    function getParagraphIndex(paragraphEl) {
      const allParagraphs = document.getElementById('content').querySelectorAll('p, h1, h2, h3, li, blockquote');
      let index = -1;
      allParagraphs.forEach((p, i) => {
        if (p === paragraphEl) index = i;
      });
      return index;
    }

    function getOffsetInParagraph(paragraphEl, node, offset) {
      const range = document.createRange();
      range.setStart(paragraphEl, 0);
      range.setEnd(node, offset);
      return range.toString().length;
    }

    function handleSelection() {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      const popup = document.getElementById('highlight-popup');
      const preview = document.getElementById('text-preview');

      if (text.length > 0) {
        closeDictionary();
        const range = selection.getRangeAt(0);
        const paragraphEl = findParagraphElement(range.startContainer);

        if (!paragraphEl) {
          popup.classList.remove('visible');
          return;
        }

        paragraphIndex = getParagraphIndex(paragraphEl);
        if (paragraphIndex === -1) {
          popup.classList.remove('visible');
          return;
        }

        selectedText = text;
        selectionStart = getOffsetInParagraph(paragraphEl, range.startContainer, range.startOffset);
        selectionEnd = selectionStart + text.length;

        const rect = range.getBoundingClientRect();
        const popupWidth = 220;
        const left = Math.max(8, Math.min(rect.left + rect.width/2 - popupWidth/2, window.innerWidth - popupWidth - 8));
        popup.style.left = left + 'px';
        popup.style.top = Math.max(10, rect.top - 70) + 'px';

        const previewText = text.length > 50 ? text.slice(0, 50) + '...' : text;
        preview.textContent = '"' + previewText + '"';

        popup.classList.add('visible');
      } else {
        popup.classList.remove('visible');
      }
    }

    function closePopup() {
      window.getSelection().removeAllRanges();
      document.getElementById('highlight-popup').classList.remove('visible');
      selectedText = '';
      paragraphIndex = -1;
      closeDictionary();
    }

    function openMore() {
      if (selectedText && paragraphIndex >= 0) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'openMore',
          text: selectedText,
          paragraphIndex: paragraphIndex,
          startOffset: selectionStart,
          endOffset: selectionEnd
        }));
        closePopup();
      }
    }

    function selectColor(color) {
      if (selectedText && paragraphIndex >= 0) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'textSelected',
          text: selectedText,
          color: color,
          paragraphIndex: paragraphIndex,
          startOffset: selectionStart,
          endOffset: selectionEnd
        }));

        window.getSelection().removeAllRanges();
        document.getElementById('highlight-popup').classList.remove('visible');
        selectedText = '';
        paragraphIndex = -1;
      }
    }

    function getLookupWord(text) {
      return text.trim().replace(/^[^a-zA-Z]+|[^a-zA-Z-]+$/g, '');
    }

    function escapeText(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function closeDictionary() {
      const panel = document.getElementById('dictionary-panel');
      panel.classList.remove('visible');
    }

    async function lookupDictionary() {
      const word = getLookupWord(selectedText);
      const panel = document.getElementById('dictionary-panel');
      const body = document.getElementById('dictionary-body');
      const wordEl = document.getElementById('dictionary-word');
      const posEl = document.getElementById('dictionary-pos');
      const phoneticEl = document.getElementById('dictionary-phonetic');
      const button = document.getElementById('dictionary-btn');

      if (!word) return;

      panel.classList.add('visible');
      button.classList.add('loading');
      wordEl.textContent = word;
      posEl.textContent = '';
      phoneticEl.textContent = '';
      body.className = 'dictionary-body loading';
      body.textContent = 'Looking up definition...';

      try {
        const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word.toLowerCase()));

        if (response.status === 404) {
          throw new Error('Word not found.');
        }

        if (!response.ok) {
          throw new Error('Dictionary is unavailable right now.');
        }

        const entries = await response.json();
        const entry = entries && entries[0];
        const meaning = entry && entry.meanings && entry.meanings[0];
        const definition = meaning && meaning.definitions && meaning.definitions[0];

        if (!entry || !meaning || !definition || !definition.definition) {
          throw new Error('No definition available.');
        }

        wordEl.textContent = entry.word || word;
        posEl.textContent = meaning.partOfSpeech || '';
        phoneticEl.textContent = entry.phonetic || '';
        body.className = 'dictionary-body';
        body.innerHTML =
          '<div>' + escapeText(definition.definition) + '</div>' +
          (definition.example
            ? '<p class="dictionary-example">"' + escapeText(definition.example) + '"</p>'
            : '');
      } catch (error) {
        body.className = 'dictionary-body error';
        body.textContent = error && error.message ? error.message : 'Failed to look up this word.';
      } finally {
        button.classList.remove('loading');
      }
    }

    document.addEventListener('selectionchange', function() {
      clearTimeout(window.selectionTimeout);
      window.selectionTimeout = setTimeout(handleSelection, 300);
    });

    document.addEventListener('touchend', function() {
      setTimeout(handleSelection, 100);
    });

    window.addEventListener('scroll', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'scroll',
        scrollY: window.scrollY,
        contentHeight: document.body.scrollHeight,
        viewHeight: window.innerHeight
      }));
    });

    document.addEventListener('click', function(e) {
      const popup = document.getElementById('highlight-popup');
      if (!popup.contains(e.target)) {
        popup.classList.remove('visible');
      }
    });

    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
  </script>
</body>
</html>
`;
}

export function WebViewReader({
  content,
  settings,
  highlights = [],
  onTextSelected,
  onOpenMoreOptions,
  onHighlightClick,
  onScroll,
  onContentReady,
  initialScrollPosition = 0,
}: WebViewReaderProps) {
  const webViewRef = useRef<WebView>(null);
  const webViewReadyRef = useRef(false);
  const hasRestoredScrollRef = useRef(false);

  const html = useMemo(
    () => generateHtml(content, settings, highlights),
    [content, settings, highlights]
  );

  const restoreScrollPosition = useCallback(() => {
    const y = Math.max(0, Math.round(initialScrollPosition));
    if (!webViewReadyRef.current || hasRestoredScrollRef.current || y <= 0) {
      return;
    }

    hasRestoredScrollRef.current = true;
    webViewRef.current?.injectJavaScript(`
      requestAnimationFrame(function() {
        window.scrollTo(0, ${y});
        setTimeout(function() {
          window.scrollTo(0, ${y});
        }, 100);
      });
      true;
    `);
  }, [initialScrollPosition]);

  useEffect(() => {
    webViewReadyRef.current = false;
    hasRestoredScrollRef.current = false;
  }, [html]);

  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          case 'textSelected':
            onTextSelected?.(data.text, data.color, data.paragraphIndex, data.startOffset, data.endOffset);
            break;
          case 'openMore':
            onOpenMoreOptions?.(data.text, data.paragraphIndex, data.startOffset, data.endOffset);
            break;
          case 'highlightClick':
            onHighlightClick?.(data.highlight, data.position);
            break;
          case 'scroll':
            onScroll?.(data.scrollY, data.contentHeight, data.viewHeight);
            break;
          case 'ready':
            webViewReadyRef.current = true;
            restoreScrollPosition();
            onContentReady?.();
            break;
        }
      } catch (error) {
        console.error('WebView message error:', error);
      }
    },
    [onTextSelected, onOpenMoreOptions, onHighlightClick, onScroll, onContentReady, restoreScrollPosition]
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        originWhitelist={['*']}
        onMessage={handleMessage}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        bounces={true}
        overScrollMode="always"
        textInteractionEnabled={true}
        allowsLinkPreview={false}
        contentMode="mobile"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
