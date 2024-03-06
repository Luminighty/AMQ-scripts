# AMQ-scripts
Just to store the scripts I've made (in case I make more)

## Character Card Align
[Add this script](https://raw.githubusercontent.com/Luminighty/AMQ-scripts/main/amqCharCardAlign.user.js)

Change the character cards to where they used to be (a bit higher up)
```js
// You can use this value to change how high up the character card is
// 40 is really close to what it used to be
const moveAmount = 40;
```


# EMQ-scripts

## Avatar Switcher
[Add this script](https://raw.githubusercontent.com/Luminighty/AMQ-scripts/main/emq-avatar-switcher.js)

To set the avatar, just type this command in chat:
```
!avatar {avatar_url}
```

Note that this command will then be sent to every lobby automatically once you set an avatar. This is to ensure that other people who have this script will see your avatar.

People who don't have the script will just see the !avatar command in chat with the link.

Upcoming features: 
- Settings 
  - disable sending the avatar command
  - clearing the avatar
  - manually setting the avatar
- Create a separate framework script for chat commands/custom script settings

