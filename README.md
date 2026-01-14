# VS Code Command Tester

> Quick tool to test VS Code commands with arguments programmatically

[![GitHub](https://img.shields.io/github/license/dealenx/vscode-command-tester?style=flat-square&color=blue)](https://github.com/dealenx/vscode-command-tester)

## 📝 Description

A lightweight VS Code extension that allows you to quickly test any VS Code command with custom arguments. Perfect for developers who want to experiment with VS Code's extensive command API or test extension commands interactively.

## 🎬 Demo

![Command Tester Demo](https://github.com/user-attachments/assets/41bb24f6-a0f8-48a6-ae0f-0b82b53220ff)

## 🚀 Features

- 🔍 **Browse All Commands**: Select from all available VS Code commands via QuickPick
- ⚙️ **Custom Arguments**: Input arguments in JSON format
- ✅ **Instant Feedback**: See command results immediately
- 🎯 **Simple Interface**: One command to rule them all

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

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Test VS Code Command" and press Enter
3. Select a command from the list
4. Enter arguments in JSON format (e.g., `[]` or `{"key": "value"}`)
5. View the result in a notification

### Example Commands to Test

- `workbench.action.openSettings` - Open settings
  - Args: `[]`
- `editor.action.insertSnippet` - Insert code snippet
  - Args: `[{"snippet": "console.log($1)"}]`
- `vscode.open` - Open a file
  - Args: `["file:///path/to/file"]`

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
