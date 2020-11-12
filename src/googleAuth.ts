// import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import readline from 'readline-promise';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';
const GMAIL_API_URL = 'https://developers.google.com/gmail/api/quickstart/nodejs';
interface Credentials {
	installed: {
		client_secret?: string;
		client_id?: string;
		redirect_uris: string | '';
	};
}

/**
 * Create an OAuth2 client with the given credentials, and then store the
 * result in token.json.
 * @param {Object} credentials  Path to the authorization client credentials.
 * @returns {google.auth.OAuth2} Authorized OAuth 2 client
 */

export const getGmailCredentials = async (credentialsPath: string) => {
	var clientSecrets: string;

	try {
		clientSecrets = await readFile(credentialsPath, { encoding: 'utf-8' });
		const authorizedClient = await authorize(JSON.parse(clientSecrets));
		return authorizedClient;
	} catch (e) {
		console.log(`Error loading credentials.json file: \n`, e);
		return;
	}
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 */

// returns an oAuth2Client
const authorize = async (credentials: Credentials) => {
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

	// check for a previously stored token:
	let token: string;
	try {
		token = await readFile(TOKEN_PATH, { encoding: 'utf-8' });
	} catch (e) {
		await getNewToken(oAuth2Client);
		token = await readFile(TOKEN_PATH, { encoding: 'utf-8' });
	}
	oAuth2Client.setCredentials(JSON.parse(token.toString()));
	return oAuth2Client;
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @returns {google.auth.OAuth2} Authorized oAuth2Client and
 */

const getNewToken = async (oAuth2Client: any) => {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const code = await rl.question('Enter the code from that page here: ');
	rl.close();
	let token: object;
	try {
		let res = await oAuth2Client.getToken(code);
		token = res['tokens'];
	} catch (err) {
		return console.error(`Failed to get token for OAuth2 Client. Error: ${err}`);
	}
	try {
		oAuth2Client.setCredentials(token);
		await writeFile(TOKEN_PATH, JSON.stringify(token));
		console.log('Token successfully stored to', TOKEN_PATH);
	} catch (err) {
		return console.error(`Error storing access token. Error: ${err}`);
	}
	return oAuth2Client;
};
