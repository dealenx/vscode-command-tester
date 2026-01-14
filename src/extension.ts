import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "command-tester.quick",
    async () => {
      // 1. QuickPick: выбор команды
      const commands = await vscode.commands.getCommands(true); // filter built-in
      const commandId = await vscode.window.showQuickPick(commands, {
        placeHolder: "Выберите команду для executeCommand",
        matchOnDetail: true,
      });

      if (!commandId) return;

      // 2. InputBox: аргументы JSON
      const argsJson = await vscode.window.showInputBox({
        prompt: `Выполнить: ${commandId}`,
        value: "[]",
        placeHolder: '[] или {"key": "value"}',
      });

      if (!argsJson) return;

      // 3. Выполнение!
      try {
        let args: any[] = [];
        if (argsJson !== "[]") {
          args = JSON.parse(argsJson);
        }

        const result = await vscode.commands.executeCommand(commandId, ...args);

        vscode.window.showInformationMessage(
          `✅ ${commandId} выполнен! Результат: ${JSON.stringify(
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
