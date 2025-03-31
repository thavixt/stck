import { Splitter, Typography } from '@thavixt/uikit';
import { CodeiumEditor, Document, Language } from "@codeium/react-code-editor";
import { useCallback, useMemo, useState } from 'react';

type EditorLanguage = "html" | "css" | "javascript";

const EDITOR_CONTENTS: Record<EditorLanguage, string> = {
  html: localStorage.getItem(`stck-html`) ?? `<h1>This is a Heading</h1>
<p>This is a paragraph.</p>

<div class="block">This is inside a div</div>
<div class="block2">- or another.</div>
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
  javascript: localStorage.getItem(`stck-javascript`) ?? `console.log("stck. init");
  
  // write a comment to describe something
  // then let the vibe coding gods take the wheel
`,
}

const debounce = (fn: (...args: unknown[]) => void, ms = 500) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: unknown[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

function getIframeSource() {
  const src = 'data:text/html;charset=utf-8,' + encodeURI([
    `<body height="100%" width="100%">${EDITOR_CONTENTS.html}</body>`,
    `<style>${EDITOR_CONTENTS.css}</style>`,
    `<script>${EDITOR_CONTENTS.javascript}</script>`,
  ].join('\n'));
  return src;
}

function App() {
  const [counter, setCounter] = useState(0);

  const incrementCounter = useCallback(() => {
    setCounter(prev => prev + 1);
  }, []);
  const debounceIncrementCounter = useMemo(() => {
    return debounce(incrementCounter);
  }, [incrementCounter]);

  const onChange = (lang: EditorLanguage) => (value: string | undefined) => {
    if (!value) {
      return;
    }
    EDITOR_CONTENTS[lang] = value;
    localStorage.setItem(`stck-${lang}`, value);
    debounceIncrementCounter();
  };
  const onBlur = () => {
    debounceIncrementCounter();
  }

  return (
    <div className="size-full flex-col space-y-2">
      <Splitter
        className="border-none"
        collapse={10}
        split={45}
      >
        <Splitter
          className="border-none"
          collapse={10}
          split={40}
          vertical
        >
          <div className="p-2 size-full bg-slate-600 flex flex-col space-y-1">
            <Typography.Code>
              HTML
            </Typography.Code>
            <div className='h-full' onBlur={onBlur}>
              <CodeiumEditor
                width="100%"
                height="100%"
                theme="vs-dark"
                defaultValue={EDITOR_CONTENTS.html}
                language="html"
                onChange={onChange('html')}
                otherDocuments={getNeighbourDocuments('html')}
              />
            </div>
          </div>
          <div className="p-2 size-full bg-slate-600 flex flex-col space-y-1">
            <Typography.Code>
              Javascript
            </Typography.Code>
            <div className='h-full' onBlur={onBlur}>
              <CodeiumEditor
                width="100%"
                height="100%"
                theme="vs-dark"
                defaultValue={EDITOR_CONTENTS.javascript}
                language="javascript"
                onChange={onChange('javascript')}
                otherDocuments={getNeighbourDocuments('javascript')}
              />
            </div>
          </div>
        </Splitter>
        <Splitter
          className="border-none"
          collapse={10}
          split={45}
          vertical
        >
          <div className="p-2 size-full bg-slate-600 flex flex-col space-y-1">
            <Typography.Code>
              CSS
            </Typography.Code>
            <div className='h-full' onBlur={onBlur}>
              <CodeiumEditor
                width="100%"
                height="100%"
                theme="vs-dark"
                defaultValue={EDITOR_CONTENTS.css}
                language="css"
                onChange={onChange('css')}
                otherDocuments={getNeighbourDocuments('css')}
              />
            </div>
          </div>
          <div className="p-2 size-full bg-slate-600 flex flex-col space-y-1">
            <Typography.Code>
              Preview
            </Typography.Code>
            <div className='size-full border-2 border-black rounded-sm'>
              <iframe key={counter} height="100%" width="100%" src={getIframeSource()} />
            </div>
          </div>
        </Splitter>
      </Splitter>
    </div>
  )
}

/**
 * https://github.com/Exafunction/codeium-react-code-editor
 */
function getNeighbourDocuments(type: Omit<EditorLanguage, 'preview'>): Document[] {
  const documents: Document[] = [];

  if (type !== 'html') {
    documents.push(
      new Document({
        text: EDITOR_CONTENTS.html,
        editorLanguage: "html",
        language: Language.HTML,
      }),
    )
  }
  if (type !== 'css') {
    documents.push(
      new Document({
        text: EDITOR_CONTENTS.css,
        editorLanguage: "css",
        language: Language.CSS,
      }),
    )
  }
  if (type !== 'html') {
    documents.push(
      new Document({
        text: EDITOR_CONTENTS.javascript,
        editorLanguage: "javascript",
        language: Language.JAVASCRIPT,
      }),
    )
  }

  return documents;
}

export default App
