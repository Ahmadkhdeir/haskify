import React, { useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-haskell';
import 'ace-builds/src-noconflict/theme-chrome';
import './HaskellEditor.css';

export default function HaskellEditor() {
  const [code, setCode] = useState(`-- Your Haskell code here`);
  const [output] = useState("> Output will appear here");

  return (
    <div className="editor-container">
      <div className="editor-section">
        <AceEditor
          mode="haskell"
          theme="chrome"
          value={code}
          onChange={setCode}
          fontSize={14}
          width="100%"
          height="100%"
          showPrintMargin={false}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </div>

      <div className="output-section">
        <h3 className="output-title">Output</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
}