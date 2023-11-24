// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let writtenLines = 0;


export function activate(context: vscode.ExtensionContext) {

	let counter = vscode.workspace.onDidChangeTextDocument((event) => {
		console.log("Something happen")
		const document = event.document
		const lines = document.getText().split('\n').length;
		writtenLines += lines;
		vscode.window.setStatusBarMessage(`Lines Written : ${writtenLines}`)

	})
	console.log('Congratulations, your extension "unicorntrack" is now active!');

	let disposable = vscode.commands.registerCommand('unicorntrack.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from unicornTrack!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(counter);
}

// This method is called when your extension is deactivated
export function deactivate() { }
