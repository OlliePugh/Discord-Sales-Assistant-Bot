Hello!

This is a very simple bot that needs a few steps to be setup.

1. Go into config.json, use notepad if you are unsure what software to use
2. Add your discord API token to the part inbetween the two "" next to token. Now it should look something like: "token" : "nNA1S34IOsm9OAisM4a5snIu12Ash", 
3. Add the symbol you would like to use before commands (usually !), once again, place this inbetween the speech marks next to the word prefix.
4. Make sure your discord is in developer mode, if you are unsure, then it most likely isnt, this page should help with that: (https://discordia.me/en/developer-mode)
5. Create a channel in discord where you want to post the things you have for sale
6. Right click the name of the channel and press copy id, then once again add this to the config.json file in the speechmarks next to channel_id
7. Create a role that you will give to all users that you want to be able to sort the transaction, essentially your staff. Right click this role and copy the ID, then paste this ID into the config.json file next to staff_role.

Now post what you have for sale in the chat that you made and now whenever someone reacts to the post using the built in reacts, they will be asked if they would like to talk to a member of staff to buy it, if they say yes, all online staff will be messaged asking if they can help, if one can then a room will be made that only the customer and staff member will see. They can sort the transaction in there, then simply type your prefix that you set and the word done e.g. !done in the chat and it will delete the chat for you.
