# Design Document: Command Panel

**Change ID**: `add-command-panel`

## Overview

This document outlines the technical design for adding an interactive webview panel to the VS Code Command Tester extension. The panel will provide a persistent UI for testing commands with autocomplete suggestions, argument input, and formatted result display.

## Architecture

### Component Structure

```
┌─────────────────────────────────────────────────┐
│          VS Code Extension Host                 │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │      CommandPanelProvider                │  │
│  │  - manages webview lifecycle             │  │
│  │  - handles message routing               │  │
│  │  - owns CommandExecutionService          │  │
│  └──────────────┬───────────────────────────┘  │
│                 │ messages                      │
│  ┌──────────────▼───────────────────────────┐  │
│  │    CommandExecutionService               │  │
│  │  - executes vscode.commands              │  │
│  │  - formats results                       │  │
│  │  - tracks execution timing               │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │ postMessage/onDidReceiveMessage
┌────────────────▼────────────────────────────────┐
│              Webview Panel                      │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         UI Components                    │  │
│  │  - CommandInput (autocomplete)           │  │
│  │  - ArgumentsInput (JSON validation)      │  │
│  │  - ExecuteButton                         │  │
│  │  - OutputHistory (results list)          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         State Management                 │  │
│  │  - commandList: Command[]                │  │
│  │  - executionHistory: Execution[]         │  │
│  │  - isExecuting: boolean                  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Message Protocol

### Messages: Extension → Webview

```typescript
// Initialize webview with available commands
{
  type: 'init',
  commands: string[]  // all available command IDs
}

// Send execution result
{
  type: 'executionResult',
  execution: {
    id: string,
    commandId: string,
    arguments: any[],
    result?: any,
    error?: string,
    duration: number,
    timestamp: number
  }
}
```

### Messages: Webview → Extension

```typescript
// Request command execution
{
  type: 'execute',
  commandId: string,
  arguments: any[]
}

// Request command list refresh
{
  type: 'refreshCommands'
}

// Copy result to clipboard
{
  type: 'copyResult',
  executionId: string
}
```

## Key Design Decisions

### 1. Webview vs. TreeView vs. Custom Editor

**Decision**: Use Webview Panel (via `WebviewViewProvider`)

**Rationale**:

- Full control over UI layout and styling
- Support for complex interactions (autocomplete, JSON editing)
- Can render formatted JSON and provide rich output display
- Easy to implement custom components

**Alternatives considered**:

- TreeView: Too limited for input fields and formatted output
- Custom Editor: Overkill; we don't need file integration

### 2. Command Autocomplete Implementation

**Decision**: Client-side filtering of pre-fetched command list

**Rationale**:

- Fast, responsive autocomplete without round-trips
- Command list is relatively static during session
- Reduces extension host message overhead

**Implementation**:

- Fetch all commands on panel initialization
- Send full list to webview
- Use JavaScript filter/search on user input
- Consider fuzzy matching for better UX

### 3. State Management

**Decision**: Stateless extension, stateful webview

**Rationale**:

- Execution history only needs to persist during panel session
- Webview retains state even when hidden (unless disposed)
- Simplifies extension code - no need to track history

**State stored in webview**:

- Command execution history
- Current input values
- UI state (expanded/collapsed results)

**State stored in extension**:

- None (purely reactive to webview requests)

### 4. Result Formatting

**Decision**: Format results in webview, not extension

**Rationale**:

- Webview can use HTML/CSS for rich formatting
- Easier to implement JSON syntax highlighting
- Extension just passes raw result data

**Format logic**:

- Detect result type (primitive, object, array, null, undefined)
- Apply appropriate formatting (JSON.stringify with indentation)
- Truncate very large results with "Show more" option
- Differentiate success (green) vs error (red) styling

### 5. Error Handling

**Decision**: Graceful error handling at all levels

**Error scenarios**:

1. Command not found → Display friendly error message
2. Invalid arguments → Display parse error before execution
3. Command throws → Catch and display error with stack trace (optional)
4. Webview message failure → Log and show notification

**User feedback**:

- Inline validation errors (red border, message below input)
- Execution errors shown in output with ❌ indicator
- Preserve partial state on error (don't clear inputs)

### 6. Panel Persistence

**Decision**: Retain webview when hidden, refresh commands on show

**Rationale**:

- Users don't lose history when switching views
- Quick toggle back to panel preserves context
- Commands might change if extensions are installed/disabled

**Implementation**:

- Set `retainContextWhenHidden: true` in webview options
- Listen to `onDidChangeVisibility` event
- Refresh command list when panel becomes visible

## Data Models

### Command

```typescript
interface Command {
  id: string; // e.g., "workbench.action.files.save"
  title?: string; // Optional display name (if available)
}
```

### Execution

```typescript
interface Execution {
  id: string; // Unique ID (timestamp-based or UUID)
  commandId: string; // Command that was executed
  arguments: any[]; // Arguments passed to command
  result?: any; // Return value (if successful)
  error?: string; // Error message (if failed)
  duration: number; // Execution time in milliseconds
  timestamp: number; // Unix timestamp
}
```

## UI Components

### CommandInput (with Autocomplete)

```html
<div class="command-input-container">
  <label for="command-input">Command</label>
  <input
    id="command-input"
    type="text"
    placeholder="Type command name..."
    autocomplete="off"
  />
  <div class="autocomplete-dropdown" hidden>
    <!-- Dynamically populated with filtered commands -->
  </div>
</div>
```

**Behavior**:

- Show dropdown on focus or when typing
- Filter commands by substring match
- Navigate with arrow keys
- Select with Enter or click
- Close dropdown on Esc or blur

### ArgumentsInput (JSON)

```html
<div class="arguments-input-container">
  <label for="args-input">Arguments (JSON)</label>
  <textarea id="args-input" rows="3" placeholder='[] or [{"key": "value"}]'>
[]</textarea
  >
  <div class="validation-error" hidden></div>
</div>
```

**Behavior**:

- Validate JSON on blur or before execution
- Show error message if invalid
- Highlight input with red border on error
- Prevent execution if invalid

### ExecuteButton

```html
<button id="execute-btn" class="execute-button" disabled>Execute</button>
```

**States**:

- Disabled: When command is empty or arguments invalid
- Idle: Ready to execute
- Loading: Shows spinner, text "Executing..."

### OutputHistory

```html
<div class="output-history">
  <div class="output-header">
    <h3>Output</h3>
    <button id="clear-history-btn">Clear</button>
  </div>
  <div class="executions-list">
    <!-- Execution items rendered here -->
  </div>
</div>
```

**Execution Item**:

```html
<div class="execution-item success">
  <div class="execution-header">
    <span class="status-icon">✅</span>
    <span class="command-id">workbench.action.files.save</span>
    <span class="timestamp">14:23:45</span>
  </div>
  <div class="execution-body">
    <div class="arguments-section" collapsed>
      <strong>Arguments:</strong>
      <pre>[]</pre>
    </div>
    <div class="result-section">
      <strong>Result:</strong>
      <pre>true</pre>
    </div>
    <div class="meta">Duration: 23ms</div>
  </div>
  <button class="copy-result-btn">Copy</button>
</div>
```

## Styling Approach

### Theme Integration

Use VS Code CSS variables for theme compatibility:

```css
:root {
  --vscode-editor-background: var(--vscode-editor-background);
  --vscode-editor-foreground: var(--vscode-editor-foreground);
  --vscode-input-background: var(--vscode-input-background);
  --vscode-input-border: var(--vscode-input-border);
  --vscode-button-background: var(--vscode-button-background);
  --vscode-button-foreground: var(--vscode-button-foreground);
  /* etc. */
}
```

### Layout

- Fixed header with inputs and execute button
- Scrollable output history section
- Responsive to panel width (minimum 300px)

## Performance Considerations

1. **Command List Size**: ~3000-5000 commands typical

   - Solution: Client-side filtering is fast enough (<5ms)
   - Future: Consider virtual scrolling if dropdown becomes slow

2. **Large Results**: Some commands return large objects

   - Solution: Truncate JSON display to 1000 characters with "Expand" option
   - Provide "Copy full result" for clipboard access

3. **Execution History**: Unbounded growth

   - Solution: Limit to 50 most recent executions
   - Provide "Clear History" button

4. **Message Payload**: Sending full command list to webview
   - Solution: Acceptable (~100-200KB), sent once on init
   - Commands are just strings (IDs)

## Security Considerations

1. **Webview Security**: Enable strict CSP (Content Security Policy)

   - No inline scripts
   - No external resources
   - Use nonces for script tags

2. **Command Execution**: No additional risks

   - Already exposing VS Code command API
   - User controls what commands are executed
   - Same security model as existing QuickPick approach

3. **Input Validation**: Validate all webview messages
   - Check message types
   - Validate command IDs exist before execution
   - Sanitize any HTML output (use `textContent`, not `innerHTML`)

## Testing Strategy

### Unit Tests

- CommandExecutionService result formatting
- Message serialization/deserialization
- JSON validation logic

### Integration Tests

- Panel opens and closes correctly
- Messages flow between extension and webview
- Commands execute and results appear

### Manual Testing Scenarios

- Execute command with no arguments
- Execute command with simple arguments
- Execute command with complex nested objects
- Execute invalid command
- Execute command with malformed JSON
- Rapid succession of executions
- Hide/show panel (state retention)
- Clear history
- Copy result to clipboard

## Future Enhancements (Out of Scope)

- Persist history across VS Code sessions (use workspace state)
- Export execution history to file
- Command favorites/bookmarks
- Execution templates for common commands
- Diff view for comparing results
- Command scheduler/automation
- Integration with VS Code test runner
