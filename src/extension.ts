import * as vscode from "vscode";
import { CommandPanelProvider } from "./CommandPanelProvider";

export function activate(context: vscode.ExtensionContext) {
  // Register the Command Panel webview provider
  const provider = new CommandPanelProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      CommandPanelProvider.viewType,
      provider
    )
  );

  // Register command to show panel
  context.subscriptions.push(
    vscode.commands.registerCommand("command-tester.showPanel", () => {
      vscode.commands.executeCommand(
        "workbench.view.extension.commandTesterView"
      );
    })
  );

  // Keep the existing quick command
  const disposable = vscode.commands.registerCommand(
    "command-tester.quick",
    async () => {
      // 1. QuickPick: command selection
      const commands = await vscode.commands.getCommands(true); // filter built-in
      const commandId = await vscode.window.showQuickPick(commands, {
        placeHolder: "Select command to execute",
        matchOnDetail: true,
      });

      if (!commandId) return;

      // 2. InputBox: JSON arguments
      const argsJson = await vscode.window.showInputBox({
        prompt: `Execute: ${commandId}`,
        value: "[]",
        placeHolder: '[] or {"key": "value"}',
      });

      if (!argsJson) return;

      // 3. Execution!
      try {
        let args: any[] = [];
        if (argsJson !== "[]") {
          args = JSON.parse(argsJson);
        }

        const result = await vscode.commands.executeCommand(commandId, ...args);

        vscode.window.showInformationMessage(
          `✅ ${commandId} executed! Result: ${JSON.stringify(
            result ?? "OK",
            null,
            2
          )}`
        );
      } catch (error) {
        vscode.window.showErrorMessage(`❌ ${commandId}: ${error}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}
