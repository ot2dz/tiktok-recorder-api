# Google Drive API Setup Guide

To use the direct Google Drive upload feature, you need to set up a Google Cloud Project and obtain the necessary credentials.

## 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "TikTok Recorder").
3. Enable the **Google Drive API** for this project.

## 2. Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Choose **External** (unless you have a Google Workspace organization).
3. Fill in the required fields (App name, User support email, etc.).
4. Add your email as a **Test User**.

## 3. Create Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Application type: **Desktop app** (or Web application if you have a redirect URI, but Desktop is easier for this bot).
4. Name it (e.g., "Bot Client").
5. Click **Create**.
6. Copy the **Client ID** and **Client Secret**.

## 4. Get the Folder ID
1. Create a folder in your Google Drive where you want to save the videos.
2. Open the folder in your browser.
3. The URL will look like `https://drive.google.com/drive/folders/12345abcde...`
4. The part after `folders/` is your **Folder ID**.

## 5. Configure `.env`
Add the following to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
# For Automatic Flow (Recommended for Local/Server):
OAUTH_REDIRECT_URI=http://localhost:3000/oauth/callback
# For Manual Flow (Copy-Paste Code):
# OAUTH_REDIRECT_URI=urn:ietf:wg:oauth:2.0:oob
```

## 6. Configure Redirect URI in Google Cloud
1. Go to **APIs & Services > Credentials**.
2. Click the pencil icon (Edit) next to your OAuth Client.
3. Under **Authorized redirect URIs**, click **Add URI**.
4. Enter: `http://localhost:3000/oauth/callback`
5. Click **Save**.

## 7. Authorize the Bot
1. Start the bot: `npm run dev`
2. Send `/update_token` to the bot.
3. Click the link. It should redirect you to Google, then back to your local server, and automatically link the account.


✅ You are now ready to upload directly to Google Drive!
