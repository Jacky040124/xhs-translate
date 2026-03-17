"use client";

import { useState } from "react";
import { Selector } from "./Selector";
import { TextArea } from "./TextArea";
import { CopyButton } from "./CopyButton";
import { styles, inputTypes } from "@/lib/prompts";

export function Translator() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [inputType, setInputType] = useState("normal");
  const [style, setStyle] = useState("standard");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutputText("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, style }),
      });

      const data = await response.json();

      if (data.error) {
        setOutputText(`错误: ${data.error}`);
      } else {
        setOutputText(data.result);
      }
    } catch {
      setOutputText("翻译失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleTranslate();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <div className="space-y-4">
          <Selector
            label="输入语言"
            options={inputTypes}
            value={inputType}
            onChange={setInputType}
          />
          <TextArea
            value={inputText}
            onChange={setInputText}
            placeholder="输入要翻译的文字..."
          />
          <button
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
            className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                翻译中...
              </span>
            ) : (
              "翻译成小红书体 →"
            )}
          </button>
          <p className="text-xs text-gray-400 text-center">
            提示：按 ⌘/Ctrl + Enter 快速翻译
          </p>
        </div>

        {/* 输出区域 */}
        <div className="space-y-4">
          <Selector
            label="输出风格"
            options={styles}
            value={style}
            onChange={setStyle}
          />
          <div className="relative">
            <TextArea
              value={outputText}
              placeholder="翻译结果将在这里显示..."
              readOnly
            />
            {outputText && !outputText.startsWith("错误") && (
              <div className="absolute bottom-4 right-4">
                <CopyButton text={outputText} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
