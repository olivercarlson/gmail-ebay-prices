import { google } from 'googleapis';
import { getGmailCredentials } from './googleAuth';
import _ from 'underscore.string';
import { readFile, writeFile } from 'fs/promises';
import { CREDENTIALS_PATH } from './res/strings';
import { appConfig } from '../appConfig';
// #TODO: separate out files by purpose (gmail auth vs store specific)
// settings.json:
// date range (default: all)
// # of emails per res (default=max=100)
//

/**
 *
 * Batch fetch, process, and export all email's in user's inbox matching on  the  in the user's account.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

const getEmails = async (auth: any) => {
	const gmail = google.gmail({ version: 'v1', auth });
	let data: string | undefined;
	const mails: string[] = [];
	// #TODO: fetch query info from fs.
	let query = '';
	gmail.users.messages?.list(
		{
			userId: 'me',
			q: appConfig.ebay.query,
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
						let temp = _.stripTags(buff);
						writeFile('./temp.stripped.txt', temp, 'utf-8');
						// writeFile('./temp.txt', buff, 'utf-8');
						console.log('stored information to file');
					}
				);
			});
		}
	);
};

const main = async () => {
	let credentials;
	try {
		credentials = await getGmailCredentials(CREDENTIALS_PATH);
	} catch (e) {
		console.error(e);
		return;
	}
	getEmails(credentials);
};

main();
