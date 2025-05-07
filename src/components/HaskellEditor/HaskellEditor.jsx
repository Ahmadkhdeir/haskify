import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { loadPyodide } from 'pyodide';
import './HaskellEditor.css';
import runButtonIcon from '/Users/ahmad/Desktop/Haskify/src/assets/run.png'; 

export default function HaskellEditor() {
  const [code, setCode] = useState(`# Your Python code here\nprint("Hello World")`);
  const [output, setOutput] = useState("> Loading Python runtime...");
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState(null);

  // Initialize Pyodide when component mounts
  useEffect(() => {
    loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
    }).then((py) => {
      setPyodide(py);
      setOutput("> Ready to run Python code");
    });
  }, []);

  const handleRunCode = async () => {
    if (!pyodide) {
      setOutput("> Python runtime not loaded yet");
      return;
    }
    
    setIsRunning(true);
    setOutput("> Running Python code...");
    
    try {
      // Capture all print output
      let consoleOutput = "";
      pyodide.setStdout({ batched: (text) => consoleOutput += text });
      
      await pyodide.runPythonAsync(code);
      setOutput(consoleOutput || "> Code executed (no output)");
    } catch (error) {
      setOutput(`> Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-section">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={setCode}
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
          }}
        />
      </div>

      <div className="output-section">
        <div className="output-header">
          <h3 className='output-title'>Output</h3>
          <button 
            className="run-button"
            onClick={handleRunCode}
            disabled={isRunning || !pyodide}
          >
            <img src={runButtonIcon} alt="Run" />
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
        <pre>{output}</pre>
      </div>
    </div>
  );
}