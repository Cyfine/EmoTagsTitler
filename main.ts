import {Plugin, TFile} from 'obsidian';


export default class EmoTagsTitler extends Plugin {

	emojiDetectRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu

	emojiReplaceRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)+\s*/gu

	// Define a method to run when your plugin is loaded
	async onload() {
		// Register a hook to listen for changes in the metadata of notes
		this.registerEvent(
			this.app.metadataCache.on('changed', this.addTagsEmojiToTitle.bind(this))
		);

		// Add a command to the plugin
		this.addCommand({
			id: 'add-emojis-to-all-notes',
			name: 'Add emojis to the titles of all notes that have emoji tags',
			callback: () => {
				this.addEmojisToAllNotes();
			},
		});

		this.addCommand({
			id: 'remove-emojis-from-all-notes',
			name: 'Remove emojis from the titles of all notes',
			callback: () => {
				this.removeEmojisFromAllNotes();
			},
		});
	}

	private addTagsEmojiToTitle(file: TFile) {
		// Get the tags of the current note

		const tags = this.app.metadataCache.getFileCache(file).tags;
		if (file.parent == null) return;
		const dir = file.parent.path
		// Get the current note title
		const noteTitle = file.basename;
		// Check if there are any tags
		if (tags) {

			// Loop through the tags
			let emojis: string[] = []
			for (const tag of tags) {
				// Get the tag name
				const tagName = tag.tag;
				// Check if the tag name contains an emoji
				if (this.emojiDetectRegex.test(tagName)) {
					// Get the emoji from the tag name
					let tagEmojis: string[] = Array.from(tagName.match(this.emojiDetectRegex) ?? []);
					tagEmojis = tagEmojis.filter(element => !emojis.includes(element))

					emojis = [...emojis, ...tagEmojis]

				}
			}

			const noteTitleWithoutEmoji = noteTitle.replace(this.emojiReplaceRegex, "")
			if (emojis.length > 0) {
				const emojiHeader = emojis?.join('') ?? ''
				const newNoteTitle = emojiHeader + ' ' + noteTitleWithoutEmoji;
				const filePath = dir + '/' + newNoteTitle + '.md'
				this.app.fileManager.renameFile(file, filePath);
			}

		} else {
			// If there are no tags, remove all emojis from the note title
			// Replace all emojis with an empty string
			let newNoteTitle = noteTitle.replace(this.emojiDetectRegex, '');
			// Trim any extra spaces
			newNoteTitle = newNoteTitle.trim();
			// Rename the note file with the new title
			const filePath = dir + '/' + newNoteTitle + '.md'
			this.app.fileManager.renameFile(file, filePath);
		}
	}

	private addEmojisToAllNotes() {
		// Get all the markdown files in the vault
		const files = this.app.vault.getMarkdownFiles();
		// Loop through the files
		for (const file of files) {
			// Call the addTagsEmojiToTitle function on each file
			this.addTagsEmojiToTitle(file);
		}
	}

	private removeTagsEmojiFromTitle(note: TFile) {

		// Check if the changed file is the current note

		// Get the tags of the current note
		const tags = this.app.metadataCache.getFileCache(note).tags;
		if (note.parent == null) return;
		const dir = note.parent.path
		let noteTitle = note.basename;
		// Check if there are any tags
		if (tags) {
			// Loop through the tags
			for (const tag of tags) {
				// Get the tag name
				const tagName = tag.tag;
				// Check if the tag name contains an emoji
				if (this.emojiDetectRegex.test(tagName)) {
					// Get the emoji from the tag name
					const tagEmojis: string[] = Array.from(tagName.match(this.emojiDetectRegex) ?? []);
					// Loop through the tag emojis
					for (const emoji of tagEmojis) {
						// Replace the emoji in the note title with an empty string
						noteTitle = noteTitle.replace(emoji, '');
					}
				}
			}
			// Trim any extra spaces
			noteTitle = noteTitle.trim();
			// Rename the note file with the new title
			const filePath = dir + '/' + noteTitle + '.md'
			this.app.fileManager.renameFile(note, filePath);
		}
	}

	private removeEmojisFromAllNotes() {
		// Get all the markdown files in the vault
		const files = this.app.vault.getMarkdownFiles();
		// Loop through the files
		for (const file of files) {
			// Call the removeTagsEmojiFromTitle function on each file
			this.removeTagsEmojiFromTitle(file);
		}
	}

}

