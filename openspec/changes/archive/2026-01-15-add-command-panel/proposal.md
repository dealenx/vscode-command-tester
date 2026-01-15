# Change: Add Command Panel

**Change ID**: `add-command-panel`  
**Status**: Draft  
**Created**: 2026-01-15  
**Author**: AI Assistant

## Why

Currently, the extension uses sequential dialogs (QuickPick → InputBox → Information Message) for command testing. Results disappear after dismissal, there is no execution history, and complex outputs are truncated. Users need a persistent, interactive UI for efficient command testing and result inspection.

## What Changes

- Add webview panel with command input, autocomplete, and argument fields
- Implement command execution with persistent output history display
- Support keyboard shortcuts (Ctrl+Enter to execute)
- Display formatted results with success/error indicators
- Provide JSON validation for arguments input
- Add theme integration for consistent VS Code styling
- Include accessibility features (keyboard navigation, screen reader support)

## Impact

- Affected specs: New `command-panel` capability
- Affected code: [src/extension.ts](src/extension.ts) (new provider and webview code), [package.json](package.json) (new commands and views contribution)
- Breaking: None - existing QuickPick command can remain as alternative

## Summary

Add a dedicated webview panel UI for testing VS Code commands with an interactive interface that includes command selection with autocomplete, argument input, and persistent output display.

## Motivation

Currently, the extension uses sequential dialogs (QuickPick → InputBox → Information Message) for command testing, which has limitations:

- **Poor visibility**: Results disappear after the information message is dismissed
- **No history**: Previous executions and their results are not accessible
- **Limited output**: Complex results are truncated in notification messages
- **Inefficient workflow**: Users must restart the entire flow for each test
- **No comparison**: Cannot compare results from multiple command executions

A dedicated panel UI will provide:

- Persistent command execution history
- Better visibility of complex outputs (JSON, objects, errors)
- Faster iteration when testing multiple commands
- Command suggestions with autocomplete for discoverability
- Side-by-side argument input and result viewing

## Goals

1. Create a webview panel that displays command input and output
2. Implement command autocomplete/suggestions from available VS Code commands
3. Support JSON argument input with validation
4. Display execution results with proper formatting (success/error states)
5. Maintain execution history within the panel session
6. Provide clear visual feedback for command execution states (idle, running, success, error)

## Non-Goals

- Saving command history across VS Code sessions (future enhancement)
- Command execution scheduling or automation
- Integration with VS Code testing framework
- Custom command macros or command chaining

## User Experience

### Primary Flow

1. User opens Command Panel via command palette or activity bar icon
2. Panel displays with command input field showing autocomplete suggestions
3. User types/selects a command from suggestions
4. User enters arguments in JSON format (with validation feedback)
5. User clicks "Execute" button
6. Panel shows loading state while command executes
7. Panel displays result in output area with proper formatting
8. Previous executions remain visible in history section

### Example Interactions

**Simple Command (no arguments)**

```
Command: workbench.action.files.save
Arguments: []
Result: ✅ Command executed successfully
```

**Command with Arguments**

```
Command: vscode.open
Arguments: [{"uri": "file:///path/to/file.txt"}]
Result: ✅ Opened file:///path/to/file.txt
```

**Error Handling**

```
Command: invalid.command
Arguments: []
Result: ❌ Error: Command 'invalid.command' not found
```

## Technical Approach

### Architecture

- **Webview Panel**: Main UI container using VS Code Webview API
- **Message Protocol**: Bidirectional communication between extension host and webview
- **Command Provider**: Service to fetch and filter available commands
- **Execution Service**: Handler for command execution with error handling
- **State Management**: Track command history and execution state

### Key Components

1. **CommandPanelProvider**: Manages webview lifecycle and message handling
2. **Webview UI**: HTML/CSS/JS for panel interface with autocomplete
3. **Message Handlers**: Process execute requests and send results
4. **Command Catalog**: Cache and filter available commands for autocomplete

### UI Layout

```
┌─────────────────────────────────────────┐
│ Command Panel                      [x]  │
├─────────────────────────────────────────┤
│ Command: [workbench.action.files.s▼]   │
│          ↓ suggestions dropdown          │
│ Arguments: [  {"uri": "..."}  ]         │
│                           [Execute]     │
├─────────────────────────────────────────┤
│ Output:                                 │
│ ┌─────────────────────────────────────┐ │
│ │ ✅ workbench.action.files.save      │ │
│ │    Result: true                     │ │
│ │    Duration: 23ms                   │ │
│ ├─────────────────────────────────────┤ │
│ │ ✅ vscode.open                      │ │
│ │    Arguments: [{"uri":"..."}]       │ │
│ │    Result: {...}                    │ │
│ │    Duration: 145ms                  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Implementation Plan

See [tasks.md](./tasks.md) for detailed implementation checklist.

## Success Criteria

- [ ] Panel opens via command palette
- [ ] Command autocomplete shows available commands
- [ ] Arguments can be entered in JSON format
- [ ] Execute button triggers command execution
- [ ] Success results are displayed with formatting
- [ ] Error messages are displayed clearly
- [ ] Multiple executions are visible in history
- [ ] Panel state persists during VS Code session

## Open Questions

1. Should we add keyboard shortcuts for execute (e.g., Ctrl+Enter)?
2. Should we support copying results to clipboard?
3. Should we add a "Clear History" button?
4. Should we syntax-highlight JSON arguments and results?

## Related Specs

- `command-panel`: New capability for panel UI and command execution interface
