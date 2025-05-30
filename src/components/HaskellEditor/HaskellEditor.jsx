import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './HaskellEditor.css';
import haskellMonarch from '../../monaco-haskell'; 

let editorInstance = null;

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
  const [changedLines, setChangedLines] = useState([]);

  useEffect(() => {
    if (editorInstance && changedLines.length > 0) {
      // Create decorations for changed lines
      const decorations = changedLines.map(line => ({
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1
        },
        options: {
          isWholeLine: true,
          className: 'highlight-line',
          stickiness: 1
        }
      }));

      const decorationIds = editorInstance.deltaDecorations([], decorations);

      const timer = setTimeout(() => {
        editorInstance.deltaDecorations(decorationIds, []);
        setChangedLines([]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [changedLines]);

  const handleEditorDidMount = (editor) => {
    editorInstance = editor;
  };

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
      console.log('Sending code to backend:', sharedState.code);
      const response = await fetch('http://localhost:5001/run-haskell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: sharedState.code })
      });

      console.log('Received response:', response.status);
      let result;
      try {
        result = await response.json();
        console.log('Parsed result:', result);
      } catch (e) {
        console.error('Error parsing response:', e);
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
      console.error('Error executing code:', error);
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
          onMount={handleEditorDidMount}
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