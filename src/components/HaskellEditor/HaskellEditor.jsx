import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './HaskellEditor.css';

export default function HaskellEditor() {
  const [code, setCode] = useState(`-- Your Haskell code here`);
  const [output] = useState("> Output will appear here");

  return (
    <>
    <h2 className="editor-title">Code Editor</h2>
    <div className="editor-container">
      <div className="editor-section">
        
        <Editor
          height="400px"
          language="haskell"
          theme="vs-dark"
          value={code}
          onChange={setCode}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            lineNumbers: 'on'
          }}
        />
      </div>

      <div className="output-section">
        <h3>Output</h3>
        <pre className="output-content">{output}</pre>
      </div>
    </div>
    </>
  );
}