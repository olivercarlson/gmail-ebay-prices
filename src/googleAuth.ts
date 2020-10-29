// import express from 'express';
import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import { promisify } from 'util';
import { getAllJSDocTagsOfKind } from 'typescript';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

const readFile = promisify(fs.readFile);
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

// const  = await readFile('credentials.json');

export const getAuthorizedClient = async (credentialsPath) => {
	let clientSecrets: Buffer;
	try {
		clientSecrets = await readFile(credentialsPath);
	} catch (e) {
		return console.log('Error loading client secret file:', e);
	}
	const authorizedClient = await authorize(JSON.parse(clientSecrets.toString()));
	return authorizedClient;
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

// return an oAuth2Client
const authorize = async (credentials: Credentials) => {
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

	// check for a previously stored token:
	let token;
	try {
		token = await readFile(TOKEN_PATH);
	} catch (e) {
		token = await getNewToken(oAuth2Client);
	}
	oAuth2Client.setCredentials(JSON.parse(token.toString()));
	return oAuth2Client;
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
const getNewToken = async (oAuth2Client) => {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	return rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		return oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error('Error retrieving access token', err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) return console.error(err);
				console.log('Token stored to', TOKEN_PATH);
			});
			return oAuth2Client;
		});
	});
};
