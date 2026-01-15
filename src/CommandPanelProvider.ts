import * as vscode from "vscode";

/**
 * Provides the Command Panel webview for interactive command testing
 */
export class CommandPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "commandTester.panel";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "execute": {
          await this._executeCommand(data.commandId, data.arguments);
          break;
        }
        case "refreshCommands": {
          await this._sendCommandList();
          break;
        }
        case "copyResult": {
          if (data.result !== undefined) {
            await vscode.env.clipboard.writeText(
              JSON.stringify(data.result, null, 2)
            );
            vscode.window.showInformationMessage("Result copied to clipboard");
          }
          break;
        }
      }
    });

    // Send initial command list when panel opens
    this._sendCommandList();
  }

  /**
   * Execute a VS Code command and send the result back to the webview
   */
  private async _executeCommand(commandId: string, args: any[]) {
    const startTime = Date.now();
    try {
      const result = await vscode.commands.executeCommand(commandId, ...args);
      const duration = Date.now() - startTime;

      this._view?.webview.postMessage({
        type: "executionResult",
        execution: {
          id: `exec-${Date.now()}`,
          commandId,
          arguments: args,
          result,
          duration,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this._view?.webview.postMessage({
        type: "executionResult",
        execution: {
          id: `exec-${Date.now()}`,
          commandId,
          arguments: args,
          error: error instanceof Error ? error.message : String(error),
          duration,
          timestamp: Date.now(),
        },
      });
    }
  }

  /**
   * Fetch all available commands and send to webview
   */
  private async _sendCommandList() {
    const commands = await vscode.commands.getCommands(true);
    this._view?.webview.postMessage({
      type: "init",
      commands,
    });
  }

  /**
   * Generate HTML content for the webview
   */
  private _getHtmlForWebview(webview: vscode.Webview) {
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <title>Command Panel</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 10px;
        }

        .input-section {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 4px;
            font-weight: 600;
        }

        .command-input-container {
            position: relative;
        }

        input[type="text"], textarea {
            width: 100%;
            padding: 6px 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            outline: none;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
        }

        input[type="text"]:focus, textarea:focus {
            border-color: var(--vscode-focusBorder);
        }

        textarea {
            resize: vertical;
            min-height: 60px;
            font-family: var(--vscode-editor-font-family);
        }

        .autocomplete-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            max-height: 200px;
            overflow-y: auto;
            background-color: var(--vscode-dropdown-background);
            border: 1px solid var(--vscode-dropdown-border);
            z-index: 1000;
            margin-top: 2px;
        }

        .autocomplete-item {
            padding: 6px 8px;
            cursor: pointer;
            color: var(--vscode-dropdown-foreground);
        }

        .autocomplete-item:hover,
        .autocomplete-item.selected {
            background-color: var(--vscode-list-hoverBackground);
        }

        .validation-error {
            color: var(--vscode-errorForeground);
            font-size: 0.9em;
            margin-top: 4px;
        }

        input.error, textarea.error {
            border-color: var(--vscode-inputValidation-errorBorder);
        }

        button {
            padding: 6px 14px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            cursor: pointer;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
        }

        button:hover:not(:disabled) {
            background-color: var(--vscode-button-hoverBackground);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .execute-button {
            width: 100%;
            margin-bottom: 15px;
        }

        .output-section {
            border-top: 1px solid var(--vscode-panel-border);
            padding-top: 15px;
        }

        .output-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .output-header h3 {
            font-size: 1.1em;
            font-weight: 600;
        }

        .clear-btn {
            padding: 4px 10px;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .clear-btn:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .executions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .execution-item {
            border: 1px solid var(--vscode-panel-border);
            padding: 10px;
            background-color: var(--vscode-editor-background);
        }

        .execution-item.success {
            border-left: 3px solid var(--vscode-testing-iconPassed);
        }

        .execution-item.error {
            border-left: 3px solid var(--vscode-testing-iconFailed);
        }

        .execution-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            flex-wrap: wrap;
        }

        .status-icon {
            font-size: 1.2em;
        }

        .command-id {
            font-family: var(--vscode-editor-font-family);
            font-weight: 600;
            flex: 1;
            word-break: break-all;
        }

        .timestamp {
            font-size: 0.85em;
            color: var(--vscode-descriptionForeground);
        }

        .execution-body {
            font-size: 0.9em;
        }

        .execution-body strong {
            display: block;
            margin-top: 6px;
            margin-bottom: 2px;
        }

        .execution-body pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 6px 8px;
            overflow-x: auto;
            font-family: var(--vscode-editor-font-family);
            font-size: 0.95em;
            margin-top: 4px;
            border: 1px solid var(--vscode-panel-border);
        }

        .meta {
            margin-top: 6px;
            font-size: 0.85em;
            color: var(--vscode-descriptionForeground);
        }

        .copy-btn {
            margin-top: 8px;
            padding: 4px 10px;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .copy-btn:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .empty-state {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }

        .spinner {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 2px solid var(--vscode-button-foreground);
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-right: 6px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="input-section">
        <label for="command-input">Command</label>
        <div class="command-input-container">
            <input 
                type="text" 
                id="command-input" 
                placeholder="Type command name..."
                autocomplete="off"
            />
            <div class="autocomplete-dropdown hidden" id="autocomplete-dropdown"></div>
        </div>
    </div>

    <div class="input-section">
        <label for="args-input">Arguments (JSON)</label>
        <textarea 
            id="args-input" 
            placeholder='[] or [{"key": "value"}]'
        >[]</textarea>
        <div class="validation-error hidden" id="validation-error"></div>
    </div>

    <button class="execute-button" id="execute-btn" disabled>Execute</button>

    <div class="output-section">
        <div class="output-header">
            <h3>Output</h3>
            <button class="clear-btn" id="clear-btn">Clear</button>
        </div>
        <div class="executions-list" id="executions-list">
            <div class="empty-state">No executions yet. Enter a command and click Execute.</div>
        </div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        
        let commandList = [];
        let executionHistory = [];
        let isExecuting = false;
        let selectedIndex = -1;

        const commandInput = document.getElementById('command-input');
        const argsInput = document.getElementById('args-input');
        const executeBtn = document.getElementById('execute-btn');
        const clearBtn = document.getElementById('clear-btn');
        const autocompleteDropdown = document.getElementById('autocomplete-dropdown');
        const validationError = document.getElementById('validation-error');
        const executionsList = document.getElementById('executions-list');

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'init':
                    commandList = message.commands || [];
                    break;
                case 'executionResult':
                    addExecutionResult(message.execution);
                    isExecuting = false;
                    updateExecuteButton();
                    break;
            }
        });

        // Command input handling
        commandInput.addEventListener('input', () => {
            filterCommands();
            validateInputs();
        });

        commandInput.addEventListener('focus', () => {
            if (commandList.length > 0) {
                filterCommands();
            }
        });

        commandInput.addEventListener('blur', () => {
            // Delay to allow click on dropdown
            setTimeout(() => {
                autocompleteDropdown.classList.add('hidden');
            }, 200);
        });

        commandInput.addEventListener('keydown', (e) => {
            const items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelection(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(items);
            } else if (e.key === 'Enter') {
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    e.preventDefault();
                    selectCommand(items[selectedIndex].textContent);
                } else if (!autocompleteDropdown.classList.contains('hidden')) {
                    e.preventDefault();
                } else {
                    executeCommand();
                }
            } else if (e.key === 'Escape') {
                autocompleteDropdown.classList.add('hidden');
                selectedIndex = -1;
            }
        });

        // Arguments input handling
        argsInput.addEventListener('input', validateInputs);
        argsInput.addEventListener('blur', validateInputs);

        // Keyboard shortcut for execution (Ctrl+Enter or Cmd+Enter)
        argsInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                executeCommand();
            }
        });

        commandInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && autocompleteDropdown.classList.contains('hidden')) {
                e.preventDefault();
                executeCommand();
            }
        });

        // Execute button
        executeBtn.addEventListener('click', executeCommand);

        // Clear button
        clearBtn.addEventListener('click', () => {
            executionHistory = [];
            executionsList.innerHTML = '<div class="empty-state">No executions yet. Enter a command and click Execute.</div>';
        });

        function filterCommands() {
            const query = commandInput.value.toLowerCase();
            
            if (!query) {
                autocompleteDropdown.classList.add('hidden');
                return;
            }

            const filtered = commandList.filter(cmd => 
                cmd.toLowerCase().includes(query)
            ).slice(0, 50); // Limit to 50 results

            if (filtered.length === 0) {
                autocompleteDropdown.classList.add('hidden');
                return;
            }

            autocompleteDropdown.innerHTML = filtered
                .map(cmd => \`<div class="autocomplete-item">\${escapeHtml(cmd)}</div>\`)
                .join('');

            autocompleteDropdown.classList.remove('hidden');
            selectedIndex = -1;

            // Add click handlers
            autocompleteDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', () => {
                    selectCommand(item.textContent);
                });
            });
        }

        function updateSelection(items) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    item.classList.add('selected');
                    item.scrollIntoView({ block: 'nearest' });
                } else {
                    item.classList.remove('selected');
                }
            });
        }

        function selectCommand(command) {
            commandInput.value = command;
            autocompleteDropdown.classList.add('hidden');
            selectedIndex = -1;
            validateInputs();
            argsInput.focus();
        }

        function validateInputs() {
            const command = commandInput.value.trim();
            const argsText = argsInput.value.trim();

            let isValid = true;

            // Validate command
            if (!command) {
                isValid = false;
            }

            // Validate JSON
            try {
                if (argsText) {
                    JSON.parse(argsText);
                }
                argsInput.classList.remove('error');
                validationError.classList.add('hidden');
            } catch (e) {
                argsInput.classList.add('error');
                validationError.textContent = \`Invalid JSON: \${e.message}\`;
                validationError.classList.remove('hidden');
                isValid = false;
            }

            executeBtn.disabled = !isValid || isExecuting;
        }

        function updateExecuteButton() {
            if (isExecuting) {
                executeBtn.innerHTML = '<span class="spinner"></span>Executing...';
                executeBtn.disabled = true;
            } else {
                executeBtn.textContent = 'Execute';
                validateInputs();
            }
        }

        function executeCommand() {
            const command = commandInput.value.trim();
            const argsText = argsInput.value.trim();

            if (!command || isExecuting) {
                return;
            }

            let args = [];
            try {
                args = argsText ? JSON.parse(argsText) : [];
                if (!Array.isArray(args)) {
                    args = [args];
                }
            } catch (e) {
                return;
            }

            isExecuting = true;
            updateExecuteButton();

            vscode.postMessage({
                type: 'execute',
                commandId: command,
                arguments: args
            });
        }

        function addExecutionResult(execution) {
            executionHistory.unshift(execution);

            // Limit history to 50 items
            if (executionHistory.length > 50) {
                executionHistory = executionHistory.slice(0, 50);
            }

            renderExecutions();
        }

        function renderExecutions() {
            if (executionHistory.length === 0) {
                executionsList.innerHTML = '<div class="empty-state">No executions yet. Enter a command and click Execute.</div>';
                return;
            }

            executionsList.innerHTML = executionHistory.map(exec => {
                const isError = !!exec.error;
                const statusClass = isError ? 'error' : 'success';
                const statusIcon = isError ? '❌' : '✅';
                const time = new Date(exec.timestamp).toLocaleTimeString();

                let resultHtml = '';
                if (isError) {
                    resultHtml = \`<strong>Error:</strong><pre>\${escapeHtml(exec.error)}</pre>\`;
                } else {
                    const resultStr = exec.result === undefined 
                        ? 'undefined' 
                        : JSON.stringify(exec.result, null, 2);
                    resultHtml = \`<strong>Result:</strong><pre>\${escapeHtml(resultStr)}</pre>\`;
                }

                const argsStr = JSON.stringify(exec.arguments, null, 2);

                return \`
                    <div class="execution-item \${statusClass}">
                        <div class="execution-header">
                            <span class="status-icon">\${statusIcon}</span>
                            <span class="command-id">\${escapeHtml(exec.commandId)}</span>
                            <span class="timestamp">\${time}</span>
                        </div>
                        <div class="execution-body">
                            <strong>Arguments:</strong>
                            <pre>\${escapeHtml(argsStr)}</pre>
                            \${resultHtml}
                            <div class="meta">Duration: \${exec.duration}ms</div>
                            <button class="copy-btn" onclick="copyResult('\${exec.id}')">Copy Result</button>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        window.copyResult = function(execId) {
            const exec = executionHistory.find(e => e.id === execId);
            if (exec) {
                const result = exec.error || exec.result;
                vscode.postMessage({
                    type: 'copyResult',
                    result: result
                });
            }
        };

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Initial validation
        validateInputs();
    </script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
