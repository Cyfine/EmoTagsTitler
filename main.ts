import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}


function addTagsEmojiToTitle(file:TFile){
	let note = this.app.workspace.getActiveFile();
	// Check if the changed file is the current note
	if (file.path === note.path) {
		// Get the tags of the current note
		let tags = this.app.metadataCache.getFileCache(note).tags;
		// Get the current note title
		let noteTitle = note.basename;
		// Check if there are any tags
		if (tags) {

			// Loop through the tags
			let emojis: string[] = []
			for (let tag of tags) {
				// Get the tag name
				let tagName = tag.tag;
				// Check if the tag name contains an emoji
				if (/(?!#)(\p{Emoji})/gu.test(tagName)) {
					// Get the emoji from the tag name	
					let tagEmojis = Array.from(tagName.match(/(?!#)(\p{Emoji})/gu) ?? []);
					tagEmojis = tagEmojis.filter(element => !emojis.includes(element))
					
					emojis = [...emojis, ...tagEmojis]

				}
			}

			let noteTitleWithoutEmoji = noteTitle.replace(/^(\p{Emoji}(\p{Variation_Selector})?)+\s*/gu, '');
			
			if(emojis.length > 0){ 
				 let emojiHeader = emojis?.join('') ?? ''
				 let newNoteTitle =  emojiHeader + ' ' + noteTitleWithoutEmoji; 
				 this.app.fileManager.renameFile(note, newNoteTitle + '.md');
			}

		} else {
			// If there are no tags, remove all emojis from the note title
			// Replace all emojis with an empty string
			let newNoteTitle = noteTitle.replace(/\p{Emoji}/gu, '');
			// Trim any extra spaces
			newNoteTitle = newNoteTitle.trim();
			// Rename the note file with the new title
			this.app.fileManager.renameFile(note, newNoteTitle + '.md');
		}
	}
}


export default class EmojiPlugin extends Plugin {
	// Define a method to run when your plugin is loaded
	async onload() {
		// Register a hook to listen for changes in the metadata of notes
		this.registerEvent(
			this.app.metadataCache.on('changed', addTagsEmojiToTitle.bind(this))
		);
	}
}


class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
