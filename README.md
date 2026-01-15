# VS Code Command Tester

> Quick tool to test VS Code commands with arguments programmatically

[![GitHub](https://img.shields.io/github/license/dealenx/vscode-command-tester?style=flat-square&color=blue)](https://github.com/dealenx/vscode-command-tester)

## 📝 Description

A lightweight VS Code extension that allows you to quickly test any VS Code command with custom arguments. Perfect for developers who want to experiment with VS Code's extensive command API or test extension commands interactively.

## 🎬 Demo

![Command Tester Demo](https://github.com/user-attachments/assets/41bb24f6-a0f8-48a6-ae0f-0b82b53220ff)

## 🚀 Features

- 🎛️ **Interactive Panel**: Dedicated webview panel for testing commands
- 🔍 **Command Autocomplete**: Browse and filter from all available VS Code commands
- ⚙️ **JSON Arguments**: Input arguments in validated JSON format
- 📊 **Execution History**: View persistent history of command executions
- ✅ **Rich Results**: See formatted results with success/error indicators
- ⌨️ **Keyboard Shortcuts**: Use Ctrl+Enter (Cmd+Enter on macOS) to execute
- 📋 **Copy Results**: Easily copy execution results to clipboard
- 🎨 **Theme Integration**: Automatically adapts to your VS Code theme
- 🚀 **Quick Mode**: Classic QuickPick workflow for rapid command testing

## 📦 Installation

### Development Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/dealenx/vscode-command-tester.git
   cd vscode-command-tester
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Compile the extension**:

   ```bash
   npm run compile
   ```

4. **Test in development mode**:

   - Press `F5` in VS Code to launch Extension Development Host

5. **Install for regular use**:
   ```bash
   npm run package
   code --install-extension vscode-command-tester-0.0.1.vsix
   ```

## 🚀 Usage

### Command Panel (Recommended)

1. Open the Command Panel:
   - Click the Command Tester icon in the Activity Bar (left sidebar), or
   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run "Command Tester: Show Panel"
2. Type to search and select a command (autocomplete will show suggestions)
3. Enter arguments in JSON format in the Arguments field
4. Click "Execute" button or press `Ctrl+Enter` / `Cmd+Enter`
5. View results in the Output section below
6. Browse execution history and copy results as needed

**Features:**

- **Autocomplete**: Start typing to see filtered command suggestions
- **JSON Validation**: Real-time validation of argument syntax
- **Execution History**: All executions are preserved in the panel
- **Quick Execution**: Use `Ctrl+Enter` / `Cmd+Enter` keyboard shortcut
- **Copy Results**: Click "Copy Result" button on any execution
- **Clear History**: Click "Clear" button to remove all executions

### Quick Mode (Classic)

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Test VS Code Command" and press Enter
3. Select a command from the QuickPick list
4. Enter arguments in JSON format in the input box
5. View the result in a notification

### Example Commands to Test

**Simple Commands (no arguments):**

- `workbench.action.files.save` - Save current file
  - Args: `[]`
- `workbench.action.toggleSidebarVisibility` - Toggle sidebar
  - Args: `[]`

**Commands with Arguments:**

- `vscode.open` - Open a file
  - Args: `[{"uri": "file:///C:/path/to/file.txt"}]`
- `editor.action.insertSnippet` - Insert code snippet
  - Args: `[{"snippet": "console.log('$1')"}]`
- `workbench.action.openSettings` - Open specific setting
  - Args: `["editor.fontSize"]`

\*\*Te├── extension.ts # Main extension entry point
│ └── CommandPanelProvider.ts # Webview panel implementation
├── package.json # Extension manifest
├── tsconfig.json # TypeScript config
└── openspec/ # OpenSpec specifications
├── project.md
├── changes/
└── specs/

- View detailed error messages if commands fail

## 🛠️ Development

### Project Structure

```
vscode-command-tester/
├── src/
│   └── extension.ts      # Main extension logic
├── package.json          # Extension manifest
└── tsconfig.json         # TypeScript config
```

### Building from Source

```bash
git clone https://github.com/dealenx/vscode-command-tester.git
cd vscode-command-tester
npm install
npm run compile
npm run watch  # For development
```

## 🚀 Development & Releases

### Installing from VSIX

1. Download the latest `.vsix` file from [GitHub Releases](https://github.com/dealenx/vscode-command-tester/releases)
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X`)
4. Click "..." menu → "Install from VSIX..."
5. Select the downloaded `.vsix` file

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/dealenx/vscode-command-tester)
- [Issues & Bug Reports](https://github.com/dealenx/vscode-command-tester/issues)
- [VS Code Commands API](https://code.visualstudio.com/api/extension-guides/command)

## ⭐ Support

If you find this extension helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📢 Sharing with others
