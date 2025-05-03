import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './HaskellEditor.css';

export default function HaskellEditor() {
  const [code, setCode] = useState(`-- Your Haskell code here`);
  const [output] = useState("> Output will appear here");

  return (
    <>
    <div className="editor-container">
      <div className="editor-section">
        
        <Editor
          height="100%"
          language="haskell"
          theme="vs-dark"
          value={code}
          onChange={setCode}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            padding: {
              top: 10 
            },
            renderLineHighlight: 'none',
            lineDecorationsWidth: 10, 
          }}
        />
      </div>

      <div className="output-section">
        <h3>Output</h3>
        <pre>{output}</pre>
      </div>
    </div>
    </>
  );
}