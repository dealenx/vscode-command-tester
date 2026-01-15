# Spec: Command Panel

## Overview

The Command Panel capability provides an interactive webview-based UI for testing VS Code commands with autocomplete, argument input, and persistent output display.

## ADDED Requirements

### Requirement: Panel Display

The system SHALL provide a webview panel for command testing.

#### Scenario: Open panel via command

**Given** the extension is activated  
**When** user executes "Command Tester: Show Panel" command  
**Then** a webview panel appears in the editor area or sidebar  
**And** the panel displays command input interface

#### Scenario: Panel persists when hidden

**Given** the panel is open with execution history  
**When** user switches to another view  
**And** user returns to the panel  
**Then** the execution history is preserved  
**And** input fields retain their values

---

### Requirement: Command Autocomplete

The system SHALL provide autocomplete suggestions for command input.

#### Scenario: Display command suggestions

**Given** the panel is open  
**When** user focuses on the command input field  
**Then** a dropdown appears showing available VS Code commands

#### Scenario: Filter commands by input

**Given** the autocomplete dropdown is visible  
**When** user types "file"  
**Then** the dropdown shows only commands containing "file"  
**And** matches are highlighted or prioritized

#### Scenario: Select command from suggestions

**Given** the autocomplete dropdown shows filtered commands  
**When** user clicks a command from the list  
**Or** user navigates with arrow keys and presses Enter  
**Then** the command input field is populated with the selected command  
**And** the dropdown closes

---

### Requirement: Argument Input

The system SHALL accept command arguments in JSON format.

#### Scenario: Enter arguments

**Given** the panel is open  
**When** user enters `[{"uri": "file:///test.txt"}]` in the arguments field  
**Then** the input is accepted without errors

#### Scenario: Validate JSON format

**Given** the panel is open  
**When** user enters invalid JSON like `{invalid`  
**Then** a validation error message appears  
**And** the execute button is disabled

#### Scenario: Default empty arguments

**Given** the panel is open  
**When** user has not entered any arguments  
**Then** the arguments field shows default value `[]`  
**And** the execute button is enabled (if command is valid)

---

### Requirement: Command Execution

The system SHALL execute commands with provided arguments and display results.

#### Scenario: Execute command successfully

**Given** user has entered command "workbench.action.files.save"  
**And** arguments are `[]`  
**When** user clicks the Execute button  
**Then** the command is executed  
**And** the result appears in the output section  
**And** the result shows a success indicator (✅)

#### Scenario: Execute command with arguments

**Given** user has entered command "vscode.open"  
**And** arguments are `[{"uri": "file:///test.txt"}]`  
**When** user clicks the Execute button  
**Then** the command is executed with the parsed arguments  
**And** the result appears in the output section

#### Scenario: Handle execution error

**Given** user has entered an invalid command "invalid.command"  
**When** user clicks the Execute button  
**Then** an error message appears in the output section  
**And** the error shows a failure indicator (❌)  
**And** the error message includes diagnostic information

#### Scenario: Show loading state during execution

**Given** user has clicked the Execute button  
**When** the command is executing  
**Then** the execute button shows a loading spinner  
**And** the execute button is disabled  
**And** the button text changes to "Executing..."

---

### Requirement: Output Display

The system SHALL display command execution results in a formatted history view.

#### Scenario: Show execution result

**Given** a command has been executed successfully  
**Then** the output section displays an entry with:

- Status indicator (✅ for success, ❌ for error)
- Command ID
- Timestamp
- Arguments (collapsible)
- Result (formatted as JSON if object/array)
- Execution duration in milliseconds

#### Scenario: Display multiple executions

**Given** user has executed 3 commands  
**Then** the output section shows all 3 executions  
**And** executions are ordered chronologically (most recent first)

#### Scenario: Format result types

**Given** a command returns different result types  
**Then**:

- Primitive values are displayed as-is: `true`, `42`, `"hello"`
- Objects/arrays are formatted as indented JSON
- `undefined` is displayed as `undefined`
- `null` is displayed as `null`

#### Scenario: Copy result to clipboard

**Given** an execution result is displayed  
**When** user clicks the "Copy" button on the execution entry  
**Then** the result is copied to the clipboard in JSON format

#### Scenario: Clear execution history

**Given** the output section contains multiple executions  
**When** user clicks the "Clear History" button  
**Then** all execution entries are removed  
**And** the output section shows an empty state message

---

### Requirement: Keyboard Shortcuts

The system SHALL support keyboard shortcuts for common actions.

#### Scenario: Execute with keyboard

**Given** the command and arguments are valid  
**And** the command input or arguments input has focus  
**When** user presses Ctrl+Enter (or Cmd+Enter on macOS)  
**Then** the command is executed  
**And** results appear in the output section

#### Scenario: Navigate autocomplete with keyboard

**Given** the autocomplete dropdown is visible  
**When** user presses the down arrow key  
**Then** the next command in the list is highlighted  
**And** user can select it by pressing Enter

---

### Requirement: Theme Integration

The system SHALL adapt to VS Code theme colors.

#### Scenario: Match active theme

**Given** the panel is open  
**When** VS Code uses a dark theme  
**Then** the panel uses dark background and light text  
**And** all UI elements follow VS Code's color variables

#### Scenario: Respond to theme changes

**Given** the panel is open with a dark theme  
**When** user changes to a light theme  
**Then** the panel automatically updates its colors  
**And** all elements remain readable and properly styled

---

### Requirement: Input Validation Feedback

The system SHALL provide immediate feedback for input validation.

#### Scenario: Show JSON validation error

**Given** user is typing in the arguments field  
**When** user enters `{"key": "value"` (incomplete JSON)  
**And** user moves focus away from the field  
**Then** a red border appears around the arguments field  
**And** an error message appears below: "Invalid JSON: Unexpected end of JSON input"

#### Scenario: Clear validation error on fix

**Given** the arguments field shows a validation error  
**When** user corrects the JSON to `{"key": "value"}`  
**Then** the red border disappears  
**And** the error message is removed  
**And** the execute button becomes enabled

---

### Requirement: Accessibility

The system SHALL be accessible via keyboard and screen readers.

#### Scenario: Keyboard navigation

**Given** the panel is open  
**When** user presses Tab key repeatedly  
**Then** focus moves through: command input → arguments input → execute button → clear history button → execution results  
**And** all focused elements have visible focus indicators

#### Scenario: Screen reader support

**Given** the panel is open with a screen reader active  
**When** screen reader reads the panel  
**Then** all inputs have descriptive labels  
**And** all buttons have meaningful text or aria-labels  
**And** execution results are announced when added

---

### Requirement: Performance

The system SHALL handle large command lists and execution histories efficiently.

#### Scenario: Fast autocomplete filtering

**Given** VS Code has 3000+ commands available  
**When** user types in the command input  
**Then** autocomplete results appear within 100ms  
**And** filtering is responsive to each keystroke

#### Scenario: Limit execution history

**Given** user has executed 60 commands  
**Then** the output section displays only the 50 most recent executions  
**And** older executions are automatically removed

#### Scenario: Truncate large results

**Given** a command returns an object with 10,000 characters  
**When** the result is displayed  
**Then** only the first 1000 characters are shown  
**And** an "Expand" or "Show More" button is available  
**And** the full result can be copied to clipboard

---

## Dependencies

None (initial capability)

## Related Capabilities

None (future: may integrate with testing or command history capabilities)
