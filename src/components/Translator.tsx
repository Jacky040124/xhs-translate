"use client";

import { useState, useEffect, useRef } from "react";
import { Selector } from "./Selector";
import { TextArea } from "./TextArea";
import { CopyButton } from "./CopyButton";
import { IconButton } from "./IconButton";
import { styles, inputTypes } from "@/lib/prompts";

function SkeletonLoader() {
  return (
    <div className="space-y-4 pt-2">
      <div className="h-5 skeleton rounded w-full"></div>
      <div className="h-5 skeleton rounded w-full"></div>
      <div className="h-5 skeleton rounded w-5/6"></div>
      <div className="h-5 skeleton rounded w-4/6"></div>
      <div className="h-5 skeleton rounded w-3/4"></div>
    </div>
  );
}

function ClearIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );
}

export function Translator() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [inputType, setInputType] = useState("normal");
  const [style, setStyle] = useState("standard");
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText("");
      return;
    }

    const timer = setTimeout(() => {
      handleTranslate();
    }, 500);

    return () => clearTimeout(timer);
  }, [inputText, style]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, style }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();

      if (data.error) {
        setOutputText(`错误: ${data.error}`);
      } else {
        setOutputText(data.result);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      setOutputText("翻译失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
  };

  const handleSwap = () => {
    if (outputText && !outputText.startsWith("错误")) {
      setInputText(outputText);
      setOutputText("");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="relative flex flex-col lg:flex-row bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-2xl shadow-black/20">
        {/* Input Panel */}
        <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-[500px]">
          {/* Input Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-1">
              <Selector
                options={inputTypes}
                value={inputType}
                onChange={setInputType}
              />
            </div>
            <div className="flex items-center gap-1">
              <IconButton onClick={handleClear} disabled={!inputText} title="清空">
                <ClearIcon />
              </IconButton>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 px-5 py-4 overflow-auto">
            <TextArea
              value={inputText}
              onChange={setInputText}
              placeholder="输入要翻译的文字..."
            />
          </div>

          {/* Input Footer */}
          <div className="px-5 py-3 border-t border-[var(--border-color)]">
            <span className="text-xs text-[var(--text-muted)]">
              {inputText.length} 字符
            </span>
          </div>
        </div>

        {/* Center Divider with Swap Button */}
        <div className="relative flex lg:flex-col items-center justify-center px-2 py-2 lg:py-0 border-t lg:border-t-0 lg:border-l lg:border-r border-[var(--border-color)] bg-[var(--bg-primary)]">
          <button
            onClick={handleSwap}
            disabled={!outputText || outputText.startsWith("错误")}
            className="p-3 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            title="交换"
          >
            <SwapIcon />
          </button>
        </div>

        {/* Output Panel */}
        <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-[500px] bg-[var(--bg-tertiary)]/30">
          {/* Output Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-1">
              <Selector
                options={styles}
                value={style}
                onChange={setStyle}
              />
            </div>
            <div className="flex items-center gap-1">
              <CopyButton text={outputText} />
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-1 px-5 py-4 overflow-auto">
            {loading ? (
              <SkeletonLoader />
            ) : (
              <TextArea
                value={outputText}
                placeholder="输入文字后自动翻译..."
                readOnly
              />
            )}
          </div>

          {/* Output Footer */}
          <div className="px-5 py-3 border-t border-[var(--border-color)]">
            <span className="text-xs text-[var(--text-muted)]">
              {outputText.length} 字符
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
