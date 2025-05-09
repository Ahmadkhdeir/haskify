// src/monaco-haskell.js

const haskellMonarch = {
    // Regular expressions used throughout the tokenizer
    defaultToken: '',
    keywords: [
      'module', 'import', 'qualified', 'as', 'hiding', 'data', 'newtype',
      'type', 'class', 'instance', 'where', 'let', 'in', 'do', 'case', 'of',
      'if', 'then', 'else', 'deriving', 'infix', 'infixl', 'infixr'
    ],
    typeKeywords: [
      'Int', 'Integer', 'Float', 'Double', 'Bool', 'Char', 'String', 'IO', 'Maybe',
      'Either', 'List', 'Array', 'Map', 'Set', 'Text', 'ByteString'
    ],
  
    // Tokenizer rules
    tokenizer: {
      root: [
        // Modules and imports
        [/(module)(\s+)([A-Z][\w']*)/, ['keyword', 'white', 'namespace']],
        [/(import)(\s+)(qualified)?/, ['keyword', 'white', 'keyword']],
        
        // Type definitions
        [/(data|newtype|type)(\s+)([A-Z][\w']*)/, ['keyword', 'white', 'type']],
        
        // Class and instance
        [/(class|instance)(\s+)/, ['keyword', 'white']],
        
        // Control flow
        [/(if|then|else|case|of|do|let|in)\b/, 'keyword.control'],
        
        // Operators
        [/(::|->|=>|\||<-|@|~|!|\?)/, 'operator'],
        [/[=+\-*/<>^&%]+/, 'operator'],
        
        // Literals
        [/\d+/, 'number'],
        [/"/, 'string', '@string'],
        [/'/, 'string.char', '@char'],
        
        // Comments (put these before identifiers)
        [/--.*$/, 'comment'],
        [/{-/, 'comment', '@comment'],
        
        // Identifiers
        [/[A-Z][\w']*/, 'type.identifier'],
        [/[a-z_][\w']*/, 'identifier'],
        
        // Whitespace
        { include: '@whitespace' }
      ],
  
      // Sub-rules
      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/({-)/, 'comment', '@comment'],
        [/--.*$/, 'comment']
            ],
  
      comment: [
        [/[^-{}]+/, 'comment'],
        [/-}/, 'comment', '@pop'],
        [/./, 'comment']
      ],
  
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop']
      ],
  
      char: [
        [/[^\\']+/, 'string.char'],
        [/\\./, 'string.escape'],
        [/'/, 'string.char', '@pop']
      ]
    }
  };
  
  export default haskellMonarch;
  