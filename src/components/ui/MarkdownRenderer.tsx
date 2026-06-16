import React, { useMemo } from 'react';
import { View, Text as RNText, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors, spacing, fonts } from '@/constants/theme';

interface MarkdownStyles {
  body?: TextStyle;
  heading1?: TextStyle;
  heading2?: TextStyle;
  heading3?: TextStyle;
  paragraph?: TextStyle;
  blockquote?: ViewStyle;
  blockquoteText?: TextStyle;
  listItem?: ViewStyle;
  listItemText?: TextStyle;
  bullet?: TextStyle;
  strong?: TextStyle;
  em?: TextStyle;
  code?: TextStyle;
  hr?: ViewStyle;
}

export interface ParagraphSelection {
  text: string;
  paragraphIndex: number;
}

interface MarkdownRendererProps {
  children: string;
  style?: MarkdownStyles;
  onParagraphLongPress?: (selection: ParagraphSelection) => void;
}

interface ParsedBlock {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'blockquote' | 'list' | 'hr' | 'empty';
  content: string;
  items?: string[];
  ordered?: boolean;
}

function parseInlineStyles(text: string, styles: MarkdownStyles): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let key = 0;

  // Combined regex to find bold, italic, or code anywhere in text
  // Order matters: check ** before * (bold before italic)
  const inlinePattern = /(\*\*|__)(.+?)\1|(\*|_)([^*_]+?)\3|`([^`]+)`/g;

  let lastIndex = 0;
  let match;

  while ((match = inlinePattern.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      elements.push(
        <RNText key={key++}>{text.slice(lastIndex, match.index)}</RNText>
      );
    }

    if (match[1] && match[2]) {
      // Bold: **text** or __text__
      elements.push(
        <RNText key={key++} style={styles.strong}>
          {match[2]}
        </RNText>
      );
    } else if (match[3] && match[4]) {
      // Italic: *text* or _text_
      elements.push(
        <RNText key={key++} style={styles.em}>
          {match[4]}
        </RNText>
      );
    } else if (match[5]) {
      // Inline code: `code`
      elements.push(
        <RNText key={key++} style={styles.code}>
          {match[5]}
        </RNText>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    elements.push(
      <RNText key={key++}>{text.slice(lastIndex)}</RNText>
    );
  }

  // If no matches found, return original text
  if (elements.length === 0) {
    return [text];
  }

  return elements;
}

function parseBlocks(content: string): ParsedBlock[] {
  const lines = content.split('\n');
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (trimmed === '') {
      blocks.push({ type: 'empty', content: '' });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr', content: '' });
      i++;
      continue;
    }

    // Heading 1
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'heading1', content: trimmed.slice(2) });
      i++;
      continue;
    }

    // Heading 2
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading2', content: trimmed.slice(3) });
      i++;
      continue;
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'heading3', content: trimmed.slice(4) });
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: 'blockquote', content: quoteLines.join('\n') });
      continue;
    }

    // Unordered list
    if (/^[-*+] /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+] /.test(lines[i].trim())) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: 'list', content: '', items, ordered: false });
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        const match = lines[i].trim().match(/^\d+\. (.*)$/);
        if (match) items.push(match[1]);
        i++;
      }
      blocks.push({ type: 'list', content: '', items, ordered: true });
      continue;
    }

    // Paragraph - collect consecutive non-special lines
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !/^[-*+] /.test(lines[i].trim()) &&
      !/^\d+\. /.test(lines[i].trim()) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i].trim());
      i++;
    }
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', content: paragraphLines.join(' ') });
    }
  }

  return blocks;
}

export function MarkdownRenderer({
  children,
  style = {},
  onParagraphLongPress,
}: MarkdownRendererProps) {
  const defaultStyles = useMemo<MarkdownStyles>(() => ({
    body: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 28,
    },
    heading1: {
      color: colors.textPrimary,
      fontSize: 28,
      fontFamily: fonts.headingBold,
      fontWeight: '700',
      marginTop: spacing[6],
      marginBottom: spacing[4],
      lineHeight: 36,
    },
    heading2: {
      color: colors.textPrimary,
      fontSize: 22,
      fontFamily: fonts.headingBold,
      fontWeight: '700',
      marginTop: spacing[5],
      marginBottom: spacing[3],
      lineHeight: 30,
    },
    heading3: {
      color: colors.textPrimary,
      fontSize: 18,
      fontFamily: fonts.headingBold,
      fontWeight: '600',
      marginTop: spacing[4],
      marginBottom: spacing[2],
      lineHeight: 26,
    },
    paragraph: {
      marginVertical: spacing[2],
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.accentTertiary,
      paddingLeft: spacing[4],
      marginVertical: spacing[3],
    },
    blockquoteText: {
      fontStyle: 'italic',
      color: colors.textSecondary,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: spacing[1],
    },
    listItemText: {
      flex: 1,
    },
    bullet: {
      width: 20,
      color: colors.textSecondary,
    },
    strong: {
      fontFamily: fonts.bodyBold,
      fontWeight: '700',
    },
    em: {
      fontStyle: 'italic',
    },
    code: {
      backgroundColor: colors.surfaceRaised,
      color: colors.accentTertiary,
      fontFamily: fonts.mono,
      paddingHorizontal: 4,
    },
    hr: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing[4],
    },
  }), []);

  const mergedStyles = useMemo<MarkdownStyles>(() => ({
    ...defaultStyles,
    ...style,
    body: { ...defaultStyles.body, ...style.body },
    heading1: { ...defaultStyles.heading1, ...style.heading1 },
    heading2: { ...defaultStyles.heading2, ...style.heading2 },
    heading3: { ...defaultStyles.heading3, ...style.heading3 },
    paragraph: { ...defaultStyles.paragraph, ...style.paragraph },
    blockquote: { ...defaultStyles.blockquote, ...style.blockquote },
    blockquoteText: { ...defaultStyles.blockquoteText, ...style.blockquoteText },
    listItem: { ...defaultStyles.listItem, ...style.listItem },
    listItemText: { ...defaultStyles.listItemText, ...style.listItemText },
    bullet: { ...defaultStyles.bullet, ...style.bullet },
    strong: { ...defaultStyles.strong, ...style.strong },
    em: { ...defaultStyles.em, ...style.em },
    code: { ...defaultStyles.code, ...style.code },
    hr: { ...defaultStyles.hr, ...style.hr },
  }), [defaultStyles, style]);

  const blocks = useMemo(() => parseBlocks(children), [children]);

  return (
    <View>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading1':
            return (
              <RNText key={index} style={mergedStyles.heading1}>
                {parseInlineStyles(block.content, mergedStyles)}
              </RNText>
            );

          case 'heading2':
            return (
              <RNText key={index} style={mergedStyles.heading2}>
                {parseInlineStyles(block.content, mergedStyles)}
              </RNText>
            );

          case 'heading3':
            return (
              <RNText key={index} style={mergedStyles.heading3}>
                {parseInlineStyles(block.content, mergedStyles)}
              </RNText>
            );

          case 'paragraph':
            return (
              <RNText
                key={index}
                style={[mergedStyles.body, mergedStyles.paragraph]}
                onLongPress={
                  onParagraphLongPress
                    ? () => onParagraphLongPress({ text: block.content, paragraphIndex: index })
                    : undefined
                }
              >
                {parseInlineStyles(block.content, mergedStyles)}
              </RNText>
            );

          case 'blockquote':
            return (
              <View key={index} style={mergedStyles.blockquote}>
                <RNText style={[mergedStyles.body, mergedStyles.blockquoteText]}>
                  {parseInlineStyles(block.content, mergedStyles)}
                </RNText>
              </View>
            );

          case 'list':
            return (
              <View key={index} style={{ marginVertical: spacing[2] }}>
                {block.items?.map((item, itemIndex) => (
                  <View key={itemIndex} style={mergedStyles.listItem as ViewStyle}>
                    <RNText style={[mergedStyles.body, mergedStyles.bullet]}>
                      {block.ordered ? `${itemIndex + 1}.` : '•'}
                    </RNText>
                    <RNText style={[mergedStyles.body, mergedStyles.listItemText]}>
                      {parseInlineStyles(item, mergedStyles)}
                    </RNText>
                  </View>
                ))}
              </View>
            );

          case 'hr':
            return <View key={index} style={mergedStyles.hr} />;

          case 'empty':
            return <View key={index} style={{ height: spacing[2] }} />;

          default:
            return null;
        }
      })}
    </View>
  );
}
