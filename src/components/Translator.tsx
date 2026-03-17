"use client";

import { useState, useEffect, useRef } from "react";
import { Selector } from "./Selector";
import { TextArea } from "./TextArea";
import { CopyButton } from "./CopyButton";
import { styles, inputTypes } from "@/lib/prompts";

function SkeletonLoader() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300 rounded w-4/6"></div>
    </div>
  );
}

export function Translator() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [inputType, setInputType] = useState("normal");
  const [style, setStyle] = useState("standard");
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 实时翻译：debounce 500ms
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

    // 取消之前的请求
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
        return; // 请求被取消，忽略
      }
      setOutputText("翻译失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {/* 输入区域 */}
        <div className="p-4 lg:border-r border-gray-200">
          <div className="mb-3">
            <Selector
              label=""
              options={inputTypes}
              value={inputType}
              onChange={setInputType}
            />
          </div>
          <TextArea
            value={inputText}
            onChange={setInputText}
            placeholder="输入要翻译的文字..."
          />
        </div>

        {/* 输出区域 */}
        <div className="p-4 bg-gray-50/50 border-t lg:border-t-0 border-gray-200">
          <div className="mb-3">
            <Selector
              label=""
              options={styles}
              value={style}
              onChange={setStyle}
            />
          </div>
          <div className="relative">
            {loading ? (
              <div className="h-72 p-4">
                <SkeletonLoader />
              </div>
            ) : (
              <TextArea
                value={outputText}
                placeholder="输入文字后自动翻译..."
                readOnly
              />
            )}
            {outputText && !loading && !outputText.startsWith("错误") && (
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
