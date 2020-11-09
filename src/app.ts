import { google } from 'googleapis';
import { getAuthorizedClient } from './googleAuth';
import _ from 'underscore.string';
import { readFile, writeFile } from 'fs/promises';

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

// we want to call "getAuth" > return an auth client. and then proceed to everything else here
const listMessages = async (auth) => {
	const gmail = google.gmail({ version: 'v1', auth });
	let data: string | undefined;
	const mails: string[] = [];
	// #TODO: fetch query info from fs.
	let query = 'from: eBay ORDER CONFIRMED:';
	gmail.users.messages?.list(
		{
			userId: 'me',
			q: query,
			maxResults: 1,
		},
		(err, res) => {
			if (!res || !res.data) {
				console.log('Failed to generate a response from the gmail service');
				return;
			}
			if (!res.data.messages) {
				console.log(`Failed to find any emails matching the specific input ${query}`);
				return;
			}
			res.data.messages.forEach((message) => {
				console.log(`first api call: ${message}`);
				mails.push(message.id ?? '');
			});
			mails.forEach((id) => {
				const req = gmail.users.messages.get(
					{
						userId: 'me',
						id,
						format: 'raw',
					},
					(err, res) => {
						data = res?.data.raw!;
						let buff = Buffer.from(data, 'base64').toString();
						// let temp = _.stripTags(buff);
						writeFile('./temp.txt', buff, 'utf-8');
					}
				);
			});
		}
	);
};

const auth = getAuthorizedClient('credentials.json').then((credentials) => {
	listMessages(credentials);
	// console.log(credentials);
});
