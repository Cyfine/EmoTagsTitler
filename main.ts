import {Plugin, TFile} from 'obsidian';
import {join} from 'path';


const emojiDetectRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu
const emojiReplaceRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)+\s*/gu

function addTagsEmojiToTitle(file: TFile) {
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
			if (emojiDetectRegex.test(tagName)) {
				// Get the emoji from the tag name	
				let tagEmojis: string[] = Array.from(tagName.match(emojiDetectRegex) ?? []);
				tagEmojis = tagEmojis.filter(element => !emojis.includes(element))

				emojis = [...emojis, ...tagEmojis]

			}
		}

		const noteTitleWithoutEmoji = noteTitle.replace(emojiReplaceRegex, "")
		if (emojis.length > 0) {
			const emojiHeader = emojis?.join('') ?? ''
			const newNoteTitle = emojiHeader + ' ' + noteTitleWithoutEmoji;
			this.app.fileManager.renameFile(file, join(dir, newNoteTitle + '.md'));
		}

	} else {
		// If there are no tags, remove all emojis from the note title
		// Replace all emojis with an empty string
		let newNoteTitle = noteTitle.replace(emojiDetectRegex, '');
		// Trim any extra spaces
		newNoteTitle = newNoteTitle.trim();
		// Rename the note file with the new title
		this.app.fileManager.renameFile(file, join(dir, newNoteTitle + '.md'));
	}
}


function addEmojisToAllNotes() {
	// Get all the markdown files in the vault
	const files = this.app.vault.getMarkdownFiles();
	// Loop through the files
	for (const file of files) {
		// Call the addTagsEmojiToTitle function on each file
		addTagsEmojiToTitle(file);
	}
}

function removeTagsEmojiFromTitle(note: TFile) {

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
			if (emojiDetectRegex.test(tagName)) {
				// Get the emoji from the tag name
				const tagEmojis: string[] = Array.from(tagName.match(emojiDetectRegex) ?? []);
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
		this.app.fileManager.renameFile(note, join(dir, noteTitle + '.md'))
	}
}


function removeEmojisFromAllNotes() {
	// Get all the markdown files in the vault
	const files = this.app.vault.getMarkdownFiles();
	// Loop through the files
	for (const file of files) {
		// Call the removeTagsEmojiFromTitle function on each file
		removeTagsEmojiFromTitle(file);
	}
}


export default class EmoTagsTitler extends Plugin {
	// Define a method to run when your plugin is loaded
	async onload() {
		// Register a hook to listen for changes in the metadata of notes
		this.registerEvent(
			this.app.metadataCache.on('changed', addTagsEmojiToTitle.bind(this))
		);

		// Wait until the metadata cache is resolved, add a tags to all notes
		// await this.app.metadataCache.on('resolved', () => {
		// 	// Call the addEmojisToAllNotes function
		// 	addEmojisToAllNotes();
		// });

		// Add a command to the plugin
		this.addCommand({
			id: 'add-emojis-to-all-notes',
			name: 'Add emojis to the titles of all notes that have emoji tags',
			callback: () => {
				// Call the addEmojisToAllNotes function
				addEmojisToAllNotes();
			},
		});


		this.addCommand({
			id: 'remove-emojis-from-all-notes',
			name: 'Remove emojis from the titles of all notes',
			callback: () => {
				// Call the removeEmojisFromAllNotes function
				removeEmojisFromAllNotes();
			},rr
		});
	}


}

