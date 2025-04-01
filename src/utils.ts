import { Document, Language } from "@codeium/react-code-editor";

let lastGeneration = 0; // should debounce the whole fn instead
export async function generateHash(editorContents: EditorContents) {
  if (lastGeneration > +Date.now() - 5_000) {
    return;
  }

  lastGeneration = +Date.now();
  const json = JSON.stringify(editorContents);
  const hash = btoa(json);

  if (window.location.hash === hash) {
    return;
  }

  window.location.hash = hash;

  return hash
}

export function parseFromHash(hash: string): Partial<EditorContents> {
  if (!hash) {
    return {};
  }

  const decodedDataURI = atob(hash);
  const editorContents = JSON.parse(decodedDataURI) as EditorContents;

  return editorContents;
}

export const DEFAULT_EDITOR_CONTENTS: EditorContents = {
  html: localStorage.getItem(`stck-html`) ?? `<h1>Heading</h1>
<p>This is a paragraph.</p>

<div class="block">Text in a div</div>
<div class="block2">- and another.</div>
`,
  css: localStorage.getItem(`stck-css`) ?? `:root {
  background-color: rgb(61, 59, 59);
  color: whitesmoke;
}

.block, .block2 {
  display: inline;
}
.block {
  color: red;
}
.block2 {
  color: skyblue;
}
`,
  js: localStorage.getItem(`stck-javascript`) ?? `// write a comment to describe a function
// then let the vibe coding gods take the wheel i guess

console.log("stck. init");
// check the dev console with F12
`,
};

export function assertIsValidEditorContents(editorContent: unknown): asserts editorContent is EditorContents {
  if (Object.keys(editorContent as EditorContents).length === 3) {
    return;
  }

  throw new Error('Invalid EditorContents (safe to ignore)');
}

/**
 * https://github.com/Exafunction/codeium-react-code-editor
 */
export function getNeighbourDocuments(type: Omit<EditorLanguage, 'preview'>, editorContents: Partial<EditorContents>): Document[] {
  const documents: Document[] = [];

  if (type !== 'html') {
    documents.push(
      new Document({
        text: editorContents.html,
        editorLanguage: "html",
        language: Language.HTML,
      }),
    )
  }
  if (type !== 'css') {
    documents.push(
      new Document({
        text: editorContents.css,
        editorLanguage: "css",
        language: Language.CSS,
      }),
    )
  }
  if (type !== 'html') {
    documents.push(
      new Document({
        text: editorContents.js,
        editorLanguage: "javascript",
        language: Language.JAVASCRIPT,
      }),
    )
  }

  return documents;
}

export function getIframeSource(editorContents: Partial<EditorContents>) {
  const src = 'data:text/html;charset=utf-8,' + encodeURI([
    `<!doctype html>`,
    `<html lang="en">`,
    `<body height="100%" width="100%">${editorContents.html || ''}</body>`,
    `<style>${editorContents.css || ''}</style>`,
    `<script>${editorContents.js || ''}</script>`,
    `</html>`,
  ].join('\n'));

  try {
    assertIsValidEditorContents(editorContents);
    generateHash(editorContents);
  } catch (e) {
    console.debug(e);
  }

  return src;
}

export const debounce = (fn: (...args: unknown[]) => void, ms = 500) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: unknown[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};
