# AutoCheckinBot

AutoCheckinBot works on Discord and helps you check in daily on Hoyolab using Slash commands.


## Table of Contents
- [How to Use](https://github.com/pduc1234/AutoCheckinBot?tab=readme-ov-file#how-to-use)
- [Announcement](https://github.com/pduc1234/AutoCheckinBot?tab=readme-ov-file#announcement)
- [FAQ](https://github.com/pduc1234/AutoCheckinBot?tab=readme-ov-file#faq)
- [Invite Bot](https://discord.com/oauth2/authorize?client_id=1343529159925829693)

## How to Use

1. Open the [Discord Developer Portal](https://discord.com/developers/).
2. Create a bot.
3. Set the bot's permissions to Admin.
4. Invite your bot to your Discord server.
5. Set your `token` and `uid`:
    - Open **Google Chrome** and launch Developer Tools (F12 or **Ctrl + Shift + I**).
    - Go to the **Application** tab.
    - Navigate to **Cookies** (double-click to expand).
    - Click on `"https://act.hoyolab.com"`.
    - From the list, find `ltoken_v2` and `ltuid_v2` (double-click to copy-paste).
    - Set them up using the following commands:
      - `/settoken` to set your token.
      - `/setuid` to set your UID.
6. That's it!  
   Now, simply use `/checkin`, and the bot will check in for you.

## Announcement
**New Version Released**

In the latest version, I have fixed some minor errors and made the code easier to understand.

## FAQ

### 1. Is it bannable?  
**No, I've been using this for years without any issues.**

### 2. It doesn't work anymore?  
If you've changed your password, your `ltoken` has changed as well. Retrieve a new one and update it.

### 3. This setup seems complicated?  
It's easy! You can invite my bot and start using it right away. [Invite here](https://discord.com/oauth2/authorize?client_id=1343529159925829693)
