"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Undo,
  Redo,
  Type
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = content;
      setIsInitialized(true);
    }
  }, [content, isInitialized]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const formatBlock = (tag: string) => {
    execCommand('formatBlock', tag);
  };

  const buttons = [
    {
      icon: Bold,
      command: 'bold',
      tooltip: 'Gras (Ctrl+B)',
      group: 'text'
    },
    {
      icon: Italic,
      command: 'italic',
      tooltip: 'Italique (Ctrl+I)',
      group: 'text'
    },
    {
      icon: Underline,
      command: 'underline',
      tooltip: 'Souligné (Ctrl+U)',
      group: 'text'
    },
    {
      icon: Heading1,
      command: () => formatBlock('h1'),
      tooltip: 'Titre 1',
      group: 'heading'
    },
    {
      icon: Heading2,
      command: () => formatBlock('h2'),
      tooltip: 'Titre 2',
      group: 'heading'
    },
    {
      icon: Heading3,
      command: () => formatBlock('h3'),
      tooltip: 'Titre 3',
      group: 'heading'
    },
    {
      icon: Type,
      command: () => formatBlock('p'),
      tooltip: 'Paragraphe',
      group: 'heading'
    },
    {
      icon: AlignLeft,
      command: 'justifyLeft',
      tooltip: 'Aligner à gauche',
      group: 'align'
    },
    {
      icon: AlignCenter,
      command: 'justifyCenter',
      tooltip: 'Centrer',
      group: 'align'
    },
    {
      icon: AlignRight,
      command: 'justifyRight',
      tooltip: 'Aligner à droite',
      group: 'align'
    },
    {
      icon: List,
      command: 'insertUnorderedList',
      tooltip: 'Liste à puces',
      group: 'list'
    },
    {
      icon: ListOrdered,
      command: 'insertOrderedList',
      tooltip: 'Liste numérotée',
      group: 'list'
    },
    {
      icon: Quote,
      command: () => formatBlock('blockquote'),
      tooltip: 'Citation',
      group: 'special'
    },
    {
      icon: Undo,
      command: 'undo',
      tooltip: 'Annuler',
      group: 'action'
    },
    {
      icon: Redo,
      command: 'redo',
      tooltip: 'Rétablir',
      group: 'action'
    }
  ];

  const groupedButtons: { [key: string]: typeof buttons } = {};
  buttons.forEach(btn => {
    if (!groupedButtons[btn.group]) {
      groupedButtons[btn.group] = [];
    }
    groupedButtons[btn.group].push(btn);
  });

  return (
    <div className="border-2 border-gray-300 rounded-xl overflow-hidden focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-brand-orange/20 transition-all">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b-2 border-gray-300 p-2 flex flex-wrap gap-2">
        {Object.entries(groupedButtons).map(([groupName, groupButtons], groupIndex) => (
          <div key={groupName} className="flex gap-1">
            {groupButtons.map((btn, index) => {
              const Icon = btn.icon;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (typeof btn.command === 'function') {
                      btn.command();
                    } else {
                      execCommand(btn.command);
                    }
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors group relative"
                  title={btn.tooltip}
                >
                  <Icon className="w-4 h-4 text-gray-700" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {btn.tooltip}
                  </span>
                </button>
              );
            })}
            {groupIndex < Object.keys(groupedButtons).length - 1 && (
              <div className="w-px bg-gray-300 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] max-h-[600px] overflow-y-auto p-6 focus:outline-none prose prose-sm max-w-none"
        style={{
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      />

      <style jsx global>{`
        .prose h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: #1f2937;
        }
        .prose h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: #1f2937;
        }
        .prose h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: #1f2937;
        }
        .prose p {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: #374151;
          line-height: 1.6;
        }
        .prose ul, .prose ol {
          margin-left: 1.5em;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: #374151;
        }
        .prose ul {
          list-style-type: disc;
        }
        .prose ol {
          list-style-type: decimal;
        }
        .prose li {
          margin-top: 0.25em;
          margin-bottom: 0.25em;
        }
        .prose blockquote {
          border-left: 4px solid #FD5904;
          padding-left: 1em;
          margin-left: 0;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: #6b7280;
          font-style: italic;
        }
        .prose strong {
          font-weight: bold;
          color: #111827;
        }
        .prose em {
          font-style: italic;
        }
        .prose u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
