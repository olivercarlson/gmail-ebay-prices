// import express from 'express';
import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import { promisify } from 'util';

readline.Interface.prototype.question[promisify.custom] = function (prompt) {
	return new Promise((resolve) => readline.Interface.prototype.question.call(this, prompt, resolve));
};
readline.Interface.prototype.questionAsync = promisify(readline.Interface.prototype.question);

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

interface Credentials {
	installed: {
		client_secret?: string;
		client_id?: string;
		redirect_uris: string | '';
	};
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials  Path to the authorization client credentials.
 * @returns {google.auth.OAuth2} Authorized OAuth 2 client
 */

export const getAuthorizedClient = async (credentialsPath: string) => {
	let clientSecrets: string;
	try {
		clientSecrets = await readFile(credentialsPath, { encoding: 'utf-8' });
	} catch (e) {
		return console.log('Error loading client secret file:', e);
	}
	const authorizedClient = await authorize(JSON.parse(clientSecrets));
	return authorizedClient;
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 */

// return an oAuth2Client
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
// const getNewToken = async (oAuth2Client) => {
// 	const authUrl = oAuth2Client.generateAuthUrl({
// 		access_type: 'offline',
// 		scope: SCOPES,
// 	});
// 	console.log('Authorize this app by visiting this url:', authUrl);
// 	const rl = readline.createInterface({
// 		input: process.stdin,
// 		output: process.stdout,
// 	});
// 	const code = await rl.questionAsync('Enter the code from that page here: ');
// 	rl.close();
// 	return oAuth2Client.getToken(code, (err, token) => {
// 		console.log(`token in here:`);
// 		if (err) return console.error('Error retrieving access token', err);
// 		oAuth2Client.setCredentials(token);
// 		// Store the token to disk for later program executions
// 		fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
// 			if (err) return console.error(err);
// 			console.log('Token stored to', TOKEN_PATH);
// 		});
// 		return oAuth2Client;
// 	});
// };

const getNewToken = async (oAuth2Client) => {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const code = await rl.questionAsync('Enter the code from that page here: ');
	// console.log(`code is ${code}`);
	rl.close();
	let token: object;
	try {
		let res = await oAuth2Client.getToken(code);
		token = res['tokens'];
		oAuth2Client.setCredentials(token);
		await writeFile(TOKEN_PATH, JSON.stringify(token));
		console.log('Token stored to', TOKEN_PATH);
		// return oAuth2Client;
	} catch (err) {
		return console.error(`Error retrieving access token ${err}`);
	}
	return oAuth2Client;

	// Store the token to disk for later program executions
	try {
	} catch (err) {
		return console.error(err);
	}
};
