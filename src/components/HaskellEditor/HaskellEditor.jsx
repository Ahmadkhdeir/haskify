import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './HaskellEditor.css';
import runButtonIcon from '/Users/ahmad/Desktop/Haskify/src/assets/run.png';
import haskellMonarch from '../../monaco-haskell'; 

function handleEditorWillMount(monaco) {
  monaco.languages.register({ id: 'haskell' });
  monaco.languages.setMonarchTokensProvider('haskell', haskellMonarch);
  monaco.languages.setLanguageConfiguration('haskell', {
    comments: {
      lineComment: '--',
      blockComment: ['{-', '-}'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  });
}

export default function HaskellEditor({ sharedState, updateSharedState }) {
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5001/health')
      .then(() => setIsConnected(true))
      .catch(() => {
        setIsConnected(false);
        updateSharedState({ output: "> Error: Backend server not connected" });
      });
  }, []);

  const handleRunCode = async () => {
    if (!isConnected) {
      updateSharedState({ output: "> Error: Cannot connect to execution server" });
      return;
    }

    setIsRunning(true);
    updateSharedState({ output: "> Running Haskell code..." });

    try {
      const response = await fetch('http://localhost:5001/run-haskell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: sharedState.code })
      });

      let result;
      try {
        result = await response.json();
      } catch (e) {
        updateSharedState({ output: "> Error: Could not parse error output" });
        setIsRunning(false);
        return;
      }

      if (!response.ok) {
        updateSharedState({ output: result.output || `> Error: Execution failed!` });
      } else {
        updateSharedState({ output: result.output || "> Program executed (no output)" });
      }
    } catch (error) {
      updateSharedState({ output: `> Error: ${error.message || "Failed to execute code"}` });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-section">
        <Editor
          height="100%"
          language="haskell"
          theme="vs-dark"
          value={sharedState.code}
          onChange={(value) => updateSharedState({ code: value || '' })}
          beforeMount={handleEditorWillMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 20 },
            renderLineHighlight: 'none',
            lineDecorationsWidth: 10,
            glyphMargin: false,
            lineNumbersMinChars: 3,
            folding: false,
            autoClosingBrackets: 'always',
            formatOnType: true,
            suggestOnTriggerCharacters: true
          }}
        />
      </div>

      <div className="output-section">
        <div className="output-header">
          <h3 className='output-title'>Output</h3>
          <div className="status-indicator">
            <button 
              className="run-button"
              onClick={handleRunCode}
              disabled={isRunning || !isConnected}
            >
              <img src={runButtonIcon} alt="Run" />
              {isRunning ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>
        <pre className="output-content">
          {sharedState.output}
        </pre>
      </div>
    </div>
  );
}