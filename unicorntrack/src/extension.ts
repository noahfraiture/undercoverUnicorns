import * as vscode from 'vscode';

let lastSet = new Set();

function createSet(text: string) {
	let lines = text.split('\n');
	let set = new Set();
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i].trim();
		set.add(line);
	}
	return set;
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "unicorntrack" is now active!');

	// Set lastContent to the current content of the active document when we open it for the first time
	if (vscode.window.activeTextEditor) {
		const startText = vscode.window.activeTextEditor.document.getText();
		lastSet = createSet(startText);
		vscode.window.showInformationMessage("You start with " + lastSet.size + " lines!");
		console.log(lastSet);
	}

	// Ignore duplicate line for now
	// TODO : make on save. Works if the plugins has been load once
	let count = vscode.commands.registerCommand('unicorntrack.track', () => {
		if (vscode.window.activeTextEditor) {
			const currentContent = vscode.window.activeTextEditor.document.getText();
			let currentSet = createSet(currentContent)
			let counter = 0;

			// Two way algo
			for (let item of currentSet) {
				if (!lastSet.has(item)) {
					counter++;
				}
			}
			
			lastSet = currentSet;
			vscode.window.showInformationMessage('You have written ' + counter + ' new lines since last time!');

		}
	});

	let disposable = vscode.commands.registerCommand('unicorntrack.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from unicornTrack!');
	});

	let input = vscode.commands.registerCommand('unicorntrack.block', () => {
		vscode.window.showInputBox()
		console.log("Box created")
	});

	let move = vscode.commands.registerCommand('unicorntrack.move', () => {
		vscode.commands.executeCommand("cursorMove", {
			to: "down",
			by: "wrappedLine",
			value: 10
		});
	});

	context.subscriptions.push(count);
	context.subscriptions.push(disposable);
	context.subscriptions.push(input);
	context.subscriptions.push(move);
}

// This method is called when your extension is deactivated
export function deactivate() { }
