import * as vscode from 'vscode'
import express from 'express'
import fetch from 'node-fetch'
import { stringify } from 'querystring'

const app = express()
const server = app.listen(3000, () => {
	console.log("Server is running on port 3000")
})

let lastSet = new Set()
let isBlock = false
const url = "http://127.0.0.1:3000"
const name = "Noah"
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "unicorntrack" is now active!')

	console.log('Ping the server to annonce our presence...')
	fetch(url, {
		method: "POST",
		body: JSON.stringify({ name: name }),
	}).then((res) => console.log("Ping success !")).catch((err) => console.log("Ping failed : " + err))


	// Set lastContent to the current content of the active document when we open it for the first time
	if (vscode.window.activeTextEditor) {
		const lines = vscode.window.activeTextEditor.document.getText().split('\n')
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i].trim()
			lastSet.add(line)
		}
		vscode.window.showInformationMessage("You start with " + lastSet.size + " lines!")
	}

	// Ignore duplicate line for now
	let count = vscode.workspace.onDidSaveTextDocument(() => {
		if (vscode.window.activeTextEditor) {
			let currentSet = new Set()
			const lines = vscode.window.activeTextEditor.document.getText().split("\n")
			let counter = 0
			for (let i = 0; i < lines.length; i++) {
				let line = lines[i].trim()
				currentSet.add(line)
				if (!lastSet.has(line)) {
					counter++
				}
				lastSet.add(line)
			}

			fetch(url, {
				method: "POST",
				body: JSON.stringify({ name: name, count: counter })
			}).then((res) => console.log("Count sent successfully !")).catch((err) => console.log("Count not sent : " + err))
			vscode.window.showInformationMessage('You have written ' + counter + ' new lines since last time!')

		}
	})

	let block = vscode.workspace.onDidChangeTextDocument(() => {
		if (isBlock) {
			vscode.window.showInputBox()
		}
	})

	let disposable = vscode.commands.registerCommand('unicorntrack.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from unicornTrack!')
	})

	let move = vscode.commands.registerCommand('unicorntrack.move', async () => {
		const waitTime = 500
		const durationTime = 5
		for (let i = 0; i < durationTime * 1000 / waitTime; i++) {
			const direction = ['down', 'up'][Math.floor(Math.random() * 2)]
			const size = Math.floor(Math.random() * 50)
			vscode.commands.executeCommand("cursorMove", {
				to: direction,
				by: "wrappedLine",
				value: size
			})
			await sleep(waitTime)
			console.log("Move once from " + size + " in direction " + direction)
		}
	})

	let shell = vscode.commands.registerCommand('unicorntrack.shell', () => {
		const doc = vscode.window.activeTextEditor?.document
		if (doc == undefined) {
			return
		}
		let path = doc.uri.path
		const paths = path.split('/')
		paths.pop()
		path = paths.join('/')
		
		const echo = new vscode.ShellExecution('cd ' + path + '; git add -A; git commit -m "yooooooo"')
		const task = new vscode.Task(
			{ type: 'shell' },
			vscode.TaskScope.Workspace,
			"Run Shell Command",
			"Shell",
			echo
		)
		vscode.tasks.executeTask(task)
	})

	context.subscriptions.push(count)
	context.subscriptions.push(disposable)
	context.subscriptions.push(move)
	context.subscriptions.push(block)
	context.subscriptions.push(shell)
}

// This method is called when your extension is deactivated
export function deactivate() { server.close() }
