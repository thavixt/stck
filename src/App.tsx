import { Button, Splitter, Typography } from '@thavixt/uikit';
import { CodeiumEditor } from "@codeium/react-code-editor";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_EDITOR_CONTENTS,
  assertIsValidEditorContents,
  debounce,
  getIframeSource,
  getNeighbourDocuments,
  parseFromHash,
} from './utils';

const EDITOR_CONTENTS: Partial<EditorContents> = {};

export default function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [counter, setCounter] = useState(0);

  const incrementCounter = useCallback(() => {
    setCounter(prev => prev + 1);
  }, []);

  const debounceIncrementCounter = useMemo(() => {
    return debounce(incrementCounter);
  }, [incrementCounter]);

  const onChange = (lang: EditorLanguage) => (value: string | undefined) => {
    if (!value || !EDITOR_CONTENTS) {
      return;
    }
    EDITOR_CONTENTS[lang] = value;
    localStorage.setItem(`stck-${lang}`, value);
    debounceIncrementCounter();
  };
  const onBlur = () => {
    debounceIncrementCounter();
  }

  useEffect(() => {
    const editorContents = parseFromHash(window.location.hash.split('#')[1]);

    try {
      assertIsValidEditorContents(editorContents);
      if (editorContents && iframeRef.current) {
        EDITOR_CONTENTS.css = editorContents.css;
        EDITOR_CONTENTS.html = editorContents.html;
        EDITOR_CONTENTS.js = editorContents.js;
      }
    } catch (e) {
      console.debug(e as Error);
      EDITOR_CONTENTS.css = DEFAULT_EDITOR_CONTENTS.css;
      EDITOR_CONTENTS.html = DEFAULT_EDITOR_CONTENTS.html;
      EDITOR_CONTENTS.js = DEFAULT_EDITOR_CONTENTS.js;
    } finally {
      incrementCounter();
    }
  }, [incrementCounter]);

  const iframeSrc = getIframeSource(EDITOR_CONTENTS);

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
                otherDocuments={getNeighbourDocuments('html', EDITOR_CONTENTS)}
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
                defaultValue={EDITOR_CONTENTS.js}
                language="javascript"
                onChange={onChange('js')}
                otherDocuments={getNeighbourDocuments('js', EDITOR_CONTENTS)}
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
                otherDocuments={getNeighbourDocuments('css', EDITOR_CONTENTS)}
              />
            </div>
          </div>
          <div className="p-2 size-full bg-slate-600 flex flex-col space-y-1">
            <div className="flex space-x-2 justify-between">
              <Typography.Code>
                Preview
              </Typography.Code>
              <Button onClick={incrementCounter}>Refresh</Button>
            </div>
            <div className='size-full border-2 border-black rounded-sm'>
              <iframe ref={iframeRef} key={counter} height="100%" width="100%" src={iframeSrc} />
            </div>
          </div>
        </Splitter>
      </Splitter>
    </div>
  )
}
