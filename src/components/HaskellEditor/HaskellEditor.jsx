import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './HaskellEditor.css';

export default function HaskellEditor() {
  const [code, setCode] = useState(
`-- Calculate the factorial of a number
factorial :: Integer -> Integer
factorial 0 = 1
factorial n = n * factorial (n - 1)

-- A function to check if a number is even
isEven :: Int -> Bool
isEven n
| n mod 2 == 0 = True
| otherwise = False

-- Main function to test the above
main = do
  putStrLn "Enter a number:"
  num <- getLine
  let number = read num :: Int
  print ("Factorial: " ++ show (factorial number))
  print ("Is even: " ++ show (isEven number))`
  );

  const [output] = useState("> Output will appear here");

  return (
    <div className="editor-split-container">
      <div className="editor-wrapper">
        <div className="editor-section">
          <div className="editor-header">
            <h3>Haskell Code Editor</h3>
            <div className="editor-actions">
              <button className="action-button" onClick={() => navigator.clipboard.writeText(code)}>
                Copy
              </button>
              <button className="action-button" onClick={() => setCode(defaultCode)}>
                Reset
              </button>
            </div>
          </div>
          
          <Editor
            height="calc(100vh - 200px)"
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
            }}
          />
        </div>

        <div className="output-section">
          <div className="output-header">
            <h3>Output</h3>
          </div>
          <pre className="output-content">
            {output}
          </pre>
        </div>
      </div>

      <div className="empty-right"></div>
    </div>
  );
}

const defaultCode = `-- Default Haskell code here
module Main where

main :: IO ()
main = putStrLn "Hello, Haskify!"`;