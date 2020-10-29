import { google } from 'googleapis';
import { getAuthorizedClient } from './googleAuth';

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
	gmail.users.messages?.list(
		{
			userId: 'me',
			q: 'from: eBay ORDER CONFIRMED:',
			maxResults: 1,
		},
		(err, res) => {
			if (!res || !res.data || !res.data.messages) {
				console.log('No Messages Found');
				return;
			}
			res.data.messages.forEach((message) => {
				console.log(message);
				mails.push(message.id ?? '');
			});
			mails.forEach((id) => {
				const req = gmail.users.messages.get(
					{
						userId: 'me',
						id,
					},
					(err, res) => {
						// data = res?.data.snippet!;
						console.log(res?.data);
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
