// import express from 'express';
import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import { promisify } from 'util';
import { getAllJSDocTagsOfKind } from 'typescript';
import { oauth2 } from 'googleapis/build/src/apis/oauth2';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

// const readFile = promisify(fs.readFile);
// const writeFile = promisify(fs.writeFile);

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

interface Credentials {
	installed: {
		client_secret?: string;
		client_id?: string;
		redirect_uris: string | '';
	};
}

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
	if (err) return console.log('Error loading client secret file:', err);
	// Authorize a client with credentials, then call the Gmail API.
	authorize(JSON.parse(content.toString()), listMessages);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials: Credentials, callback) {
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getNewToken(oAuth2Client, callback);
		oAuth2Client.setCredentials(JSON.parse(token.toString()));
		callback(oAuth2Client);
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error('Error retrieving access token', err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) return console.error(err);
				console.log('Token stored to', TOKEN_PATH);
			});
			callback(oAuth2Client);
		});
	});
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

const listMessages = async (auth) => {
	const gmail = google.gmail({ version: 'v1', auth });
	let data: string | undefined;
	const mails: string[] = [];
	gmail.users.messages?.list(
		{
			userId: 'me',
			q: 'from: eBay ORDER CONFIRMED:',
			maxResults: 5,
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
