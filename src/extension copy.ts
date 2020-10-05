/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	const tucKeywordProvider = vscode.languages.registerCompletionItemProvider('tuc', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			//console.log({
			//	position,
			//	token,
			//	context,
			//});

			const tucParts =
				[
					// tuc name
					{ label: 'tuc', snippet: 'tuc', detail: 'Tuc name', documentation: 'Tuc name is a start of a tuc definition.' },
					{ label: 'tuc', snippet: 'tuc ${1:name}', detail: 'Tuc name', documentation: 'Tuc name is a start of a tuc definition.' },

					// participants
					{ label: 'participants', snippet: 'participants', detail: 'Participants' },
					{ label: 'participants', snippet: 'participants\n  ${0}', detail: 'Participants' },
					{ label: 'participant-component', snippet: '${1:ComponentType} ${2:Domain}\n\t', detail: 'Component Participant' },
					{ label: 'participant-component-participant', snippet: '${1:ParticipantType}', detail: 'Participant of a Component' },
					{ label: 'participant-component-participant-alias', snippet: '${1:ParticipantType} as "${2:Alias}"', detail: 'Participant of a Component with Alias' },
					{ label: 'participant-active', snippet: '${1:ParticipantType} ${2:Domain}', detail: 'Active Participant' },
					{ label: 'participant-active-alias', snippet: '${1:ParticipantType} ${2:Domain} as "${3:Alias}"', detail: 'Active Participant with Alias' },

					// parts
					{ label: 'section', snippet: 'section', detail: 'Section name' },
					{ label: 'section', snippet: 'section ${1:section name}', detail: 'Section name' },
					{ label: 'read-data', snippet: '[${1:dataObject}] -> ${2:data}', detail: 'Read data from data object' },
					{ label: 'post-data', snippet: '${1:data} -> [${2:dataObject}]', detail: 'Post data to data object' },
					{ label: 'post-event', snippet: '${1:event} -> [${2:streamName}Stream]', detail: 'Read event from stream' },
					{ label: 'read-event', snippet: '[${1:streamName}Stream] -> ${2:event}', detail: 'Post event to stream' },
					{ label: 'group', snippet: 'group', detail: 'Group name' },
					{ label: 'group', snippet: 'group ${1:group name}', detail: 'Group name' },
					{ label: 'if', snippet: 'if', detail: 'If' },
					{ label: 'if', snippet: 'if ${1:condition}', detail: 'If condition' },
					{ label: 'if-else', snippet: 'if ${1:condition}\n\t${0}\nelse\n\t', detail: 'If condition Else' },
					{ label: 'else', snippet: 'else', detail: 'Else' },
					{ label: 'loop', snippet: 'loop', detail: 'Loop' },
					{ label: 'loop', snippet: 'loop ${1:condition}', detail: 'Loop condition' },
					{ label: 'do', snippet: 'do', detail: 'Do action(s)' },
					{ label: 'do', snippet: 'do ${1:action}', detail: 'Do action' },
					{ label: 'left-note', snippet: '"< ${1:note}"', detail: 'Left Note' },
					{ label: 'note', snippet: '"${1:note}"', detail: 'Note' },
					{ label: 'right-note', snippet: '"> ${1:note}"', detail: 'Right Note' },
				]
				.map(({ label, snippet = null, detail = null, documentation = null }) => {
					const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Keyword);

					if (snippet !== null) {
						item.insertText = new vscode.SnippetString(snippet);
					}
					if (detail !== null) {
						item.detail = detail;
					}
					if (documentation !== null) {
						item.documentation = new vscode.MarkdownString(documentation);
					}

					return item;
				});

			// a completion item that can be accepted by a commit character,
			// the `commitCharacters`-property is set which means that the completion will
			// be inserted and then the character will be typed.
			const interactionEvent = new vscode.CompletionItem('InteractionEvent', vscode.CompletionItemKind.Class);
			interactionEvent.commitCharacters = ['.'];
			interactionEvent.documentation = new vscode.MarkdownString('Press `.` to get `InteractionEvent.`');

			// a completion item that retriggers IntelliSense when being accepted,
			// the `command`-property is set which the editor will execute after
			// completion has been inserted. Also, the `insertText` is set so that
			// a space is inserted after `new`
			//const commandCompletion = new vscode.CompletionItem('new');
			//commandCompletion.kind = vscode.CompletionItemKind.Keyword;
			//commandCompletion.insertText = 'new ';
			//commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

			// return all completion items as array
			return [
				...tucParts,
				interactionEvent
			];
		}
	});

	const tucEventProvider = vscode.languages.registerCompletionItemProvider(
		'tuc',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				const linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (linePrefix.endsWith('InteractionEvent.')) {
					return [
						new vscode.CompletionItem('Confirmed', vscode.CompletionItemKind.Field),
						new vscode.CompletionItem('Rejected', vscode.CompletionItemKind.Field),
					];
				}
				if (linePrefix.endsWith('InteractionEvent.Rejected.')) {
					return [
						new vscode.CompletionItem('ByUser', vscode.CompletionItemKind.Field),
						new vscode.CompletionItem('ByTime', vscode.CompletionItemKind.Field),
					];
				}

				return undefined;
			}
		},
		'.' // triggered whenever a '.' is being typed
	);

	const provider1 = vscode.languages.registerCompletionItemProvider('plaintext', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			console.log({
				position,
				token,
				context,
			});

			// a simple completion item which inserts `Hello World!`
			const simpleCompletion = new vscode.CompletionItem('Hello World!');

			// a completion item that inserts its text as snippet,
			// the `insertText`-property is a `SnippetString` which will be
			// honored by the editor.
			const snippetCompletion = new vscode.CompletionItem('Good part of the day');
			snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
			snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");

			// a completion item that can be accepted by a commit character,
			// the `commitCharacters`-property is set which means that the completion will
			// be inserted and then the character will be typed.
			const commitCharacterCompletion = new vscode.CompletionItem('console');
			commitCharacterCompletion.commitCharacters = ['.'];
			commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');

			// a completion item that retriggers IntelliSense when being accepted,
			// the `command`-property is set which the editor will execute after
			// completion has been inserted. Also, the `insertText` is set so that
			// a space is inserted after `new`
			const commandCompletion = new vscode.CompletionItem('new');
			commandCompletion.kind = vscode.CompletionItemKind.Keyword;
			commandCompletion.insertText = 'new ';
			commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

			// return all completion items as array
			return [
				simpleCompletion,
				snippetCompletion,
				commitCharacterCompletion,
				commandCompletion
			];
		}
	});

	const provider2 = vscode.languages.registerCompletionItemProvider(
		'plaintext',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				const linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (!linePrefix.endsWith('console.')) {
					return undefined;
				}

				return [
					new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
				];
			}
		},
		'.' // triggered whenever a '.' is being typed
	);

	context.subscriptions.push(provider1, provider2, tucKeywordProvider, tucEventProvider);
}
