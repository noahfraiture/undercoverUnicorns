import * as vscode from 'vscode'
import express from 'express'
import fetch from 'node-fetch'

const app = express()
const server = app.listen(3000, () => {
	console.log("Server is running on port 3000")
})


let lastSet = new Set()
let isBlocked = false
let blockEnd: Date;
const proxy_url = "http://192.168.60.205:3000/getMessages/vscode"
const server_url = "http://192.168.60.205:5000/score"
const user = "Noah"
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


export function activate(context: vscode.ExtensionContext) {
	let cameraInstalled = false

	console.log('Congratulations, your extension "extensionvscode" is now active!')

	function pollServer() {
		console.log("Enter pollServer")
		fetch(`${proxy_url}?user=${user}`)
			.then(response => response.json())
			.then(data => {
				console.log(data)
				if (data.message) {
					const message_parts = data.message.split(' ')
					switch (message_parts[0]) {
						case "block":
							// Set isBlocked to true and set it back to false after 5 minutes
							isBlocked = true
							blockEnd = new Date()
							blockEnd.setMinutes(blockEnd.getMinutes() + 1)
							break
						case "camera":
							setTimeout(() => {
								camera()
							}, +message_parts[1] * 1000)
							break
						case "move":
							setTimeout(() => {
								move()
							}, +message_parts[1] * 1000)
							break;
						case "git":
							git()
							break;
						default:
							break;
					}
					console.log('Received message from server:', data.message)
				}
				pollServer()
			})
			.catch(async err => {
				console.log('Error polling server. ', err)
				await sleep(2000)
				pollServer()
			})
	}

	pollServer()


	// Listen for post request from python on '/drowsy'
	app.post('/drowsy', (req, res) => {
		vscode.window.showInformationMessage("WAKE UP")
		vscode.commands.executeCommand('workbench.action.files.save');
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		res.json({ message: 'Successfully received the POST request' })
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

			fetch(server_url, {
				method: "POST",
				body: JSON.stringify({ name: user, score: counter })
			}).then((res) => console.log("Count sent successfully !")).catch((err) => console.log("Count not sent : " + err))
			vscode.window.showInformationMessage('You have written ' + counter + ' new lines since last time!')
		}
	})

	let block = vscode.workspace.onDidChangeTextDocument(() => {
		if (isBlocked) {
			if (new Date() > blockEnd) {
				isBlocked = false
			}
			vscode.window.showInputBox()
		}
	})

	function camera() {
		const path = context.extensionPath
		if (!cameraInstalled) {
			vscode.window.showInformationMessage("Not installed")
			const build = new vscode.ShellExecution('cd ' + path + '/../detect/ && make install && export QT_QPA_PLATFORM=xcb && make run')
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
		} else {
			const run = new vscode.ShellExecution('cd ' + path + '/../detect && export QT_QPA_PLATFORM=xcb && make run')
			vscode.tasks.executeTask(
				new vscode.Task(
					{ type: 'shell' },
					vscode.TaskScope.Workspace,
					"Run Shell Command",
					"Shell",
					run
				)
			)
		}
	}

	async function move() {
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
	}

	function git() {
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
	}

	let disposable = vscode.commands.registerCommand('extensionvscode.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from unicornTrack!')
	})

	context.subscriptions.push(count)
	context.subscriptions.push(block)
	context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() { server.close() }
