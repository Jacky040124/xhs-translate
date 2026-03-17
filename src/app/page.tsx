import { Translator } from "@/components/Translator";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          📕 RedNote Translate
        </h1>
        <p className="text-gray-500 text-lg">把普通文字翻译成小红书体文案</p>
      </div>

      <Translator />

      <footer className="text-center mt-16 text-sm text-gray-400">
        <p>© 2026 RedNote Translate</p>
        <p className="mt-1">
          Inspired by{" "}
          <a
            href="https://translate.kagi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Kagi Translate
          </a>
        </p>
      </footer>
    </main>
  );
}
