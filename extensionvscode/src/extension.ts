import * as vscode from 'vscode'
import express from 'express'
import fetch from 'node-fetch'

const app = express()
const server = app.listen(3000, () => {
	console.log("Server is running on port 3000")
})


let cameraInstalled = false
let lastSet = new Set()
let isBlocked = false
const url = "http://127.0.0.1:3000" // TODO : must be the url of the server
const name = "Noah"
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "extensionvscode" is now active!')

	console.log('Ping the server to annonce our presence...')
	fetch(url, {
		method: "POST",
		body: JSON.stringify({ name: name }),
	}).then((res) => console.log("Ping success !")).catch((err) => console.log("Ping failed : " + err))

	// Listen for post request from python on '/drowsy'
	app.post('/drowsy', (req, res) => {
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	})


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
		if (isBlocked) {
			vscode.window.showInputBox()
		}
	})

	let camera = vscode.commands.registerCommand('extensionvscode.camera', () => {
		const path = vscode.extension.getPath()
		if (!cameraInstalled) {
			const build = new vscode.ShellExecution('echo $PWD')
			vscode.tasks.executeTask(
				new vscode.Task(
					{ type: 'shell' },
					vscode.TaskScope.Workspace,
					"Run Shell Command",
					"Shell",
					build
				)
			)
			cameraInstalled = true
		}
		const run = new vscode.ShellExecution('cd ' + path + '/detect; make run;')
		vscode.tasks.executeTask(
			new vscode.Task(
				{ type: 'shell' },
				vscode.TaskScope.Workspace,
				"Run Shell Command",
				"Shell",
				run
			)
		)

	})

	let move = vscode.commands.registerCommand('extensionvscode.move', async () => {
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

	let git = vscode.commands.registerCommand('extensionvscode.git', () => {
		const doc = vscode.window.activeTextEditor?.document
		if (doc == undefined) {
			return
		}
		let path = doc.uri.path
		const paths = path.split('/')
		paths.pop()
		path = paths.join('/')
		console.log("Will commit and push on " + path)
		const commit = new vscode.ShellExecution('cd ' + path + '; git add -A; git commit -m "yooooooo"; git push')
		const task = new vscode.Task(
			{ type: 'shell' },
			vscode.TaskScope.Workspace,
			"Run Shell Command",
			"Shell",
			commit
		)
		vscode.tasks.executeTask(task)
	})

	let disposable = vscode.commands.registerCommand('extensionvscode.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from unicornTrack!')
	})

	context.subscriptions.push(count)
	context.subscriptions.push(block)
	context.subscriptions.push(camera)
	context.subscriptions.push(move)
	context.subscriptions.push(git)
	context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() { server.close() }
