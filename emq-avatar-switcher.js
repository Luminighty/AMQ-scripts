// ==UserScript==
// @name         Avatar Selector
// @namespace    http://tampermonkey.net/
// @version      2024-03-05
// @description  Allows the users to change their avatars
// @author       You
// @match        https://erogemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erogemusicquiz.com
// @updateURL    https://raw.githubusercontent.com/Luminighty/AMQ-scripts/main/emq-avatar-switcher.user.js
// @grant        none
// ==/UserScript==

const CUSTOM_AVATAR_KEY = "custom-avatar"

const onMessage = Observer();

/*
!avatar https://www.coindesk.com/resizer/muOz_vrKCwvbN1RRuf6OE0PvulY=/1056x594/filters:quality(80):format(jpg)/cloudfront-us-east-1.images.arcpublishing.com/coindesk/73X6DACWJZC4HMKXKLYS2RTWPA.jpg
!avatar https://i.imgflip.com/5wv4wa.png
*/

function Observer() {
	const listeners = []
	const addListener = (cb) => listeners.push(cb)
	addListener.emit = (...args) => listeners.forEach((cb) => cb(...args))
	return addListener
}

function observeChat() {
	const chatHistory = document.querySelector("#chatHistory")
	if (!chatHistory)
		return setTimeout(observeChat, 300)
	const messages = []

	function onMutation() {
		Array.from(chatHistory.querySelectorAll(".chatMessage"))
			.filter((_, index) => index >= messages.length)
			.map((element) => {
				const text = element.innerText
				const sender = element.querySelector(".chatMessageSenderName")?.innerText
				const content = element.querySelector(".chatMessageContents")?.innerText
				return {
					sender: sender?.slice(0, sender.length - 2)?.trim(),
					content
				}
			})
			.forEach((msg) => {
				const index = messages.push(msg)
				onMessage.emit(msg, index - 1)
			})
	}

	const observer = new MutationObserver(onMutation)
	observer.observe(chatHistory, {
		childList: true,
		subtree: true
	})
	setTimeout(() => {
		onMutation()
		checkChatHistory()
	}, 100)
}

let currentAvatar
async function setAvatarCommand({sender, content}, index) {
	if (!content.startsWith("!avatar"))
		return
	let avatar = content.slice("!avatar".length).trim()
	if (!URL.canParse(avatar))
		return
	const message = Array.from(document.body.querySelector("#chatHistory").querySelectorAll(".chatMessage"))[index]
	message.style.display = "none"
	applyAvatar(sender, avatar)
	if (sender == getPlayer()?.Username) {
		localStorage.setItem(CUSTOM_AVATAR_KEY, avatar)
		currentAvatar = avatar
	}
	return true
}

let avatars = {}
function applyAvatar(username, src) {
	if (!src)
		return
	setTimeout(() => {
		Array.from(document.querySelectorAll(".playerDiv"))
			.filter((div) => div.querySelector("img").parentElement.querySelector("span").innerText === username)
			.forEach((div) => {
				const img = div.querySelector("img")
				img.src = src;
				img.style["object-fit"] = "cover"
				const contains = Boolean(avatars[username])
				avatars[username] = src
				if (contains)
					return
				new MutationObserver(() => {
					if (img.src != avatars[username])
						img.src = avatars[username]
				}).observe(img, {attributes: true, childList: true, subtree: true})
			})
	}, 500)
}
window.applyAvatar = applyAvatar

function getPlayer() {
	const session = JSON.parse(localStorage.getItem("session"))
	return session.Player
}

function getCurrentAvatarSrc() {
	return Array.from(document.querySelectorAll(".playerDiv"))
		.filter((div) => {
			const parentElement = div.querySelector("img").parentElement
			const span = parentElement.querySelector("span")
			return span.innerText === getPlayer()?.Username
		})[0]?.querySelector("img")?.src
}

function sendMessage(message) {
	const token = JSON.parse(localStorage.getItem("session")).Token
	const headers = { 
		"Authorization": token,
		"Content-Type": "application/json; charset=utf-8"
	}
	const body = JSON.stringify({"playerToken": token, "contents": message})
	return fetch("https://erogemusicquiz.com/Quiz/SendChatMessage", {method: "POST", headers, body})
}

function updateAllAvatars() {
	for (const username in avatars) {
		const src = avatars[username]
		applyAvatar(username, src)
	}
}

function checkChatHistory() {
	const chatHistory = document.querySelector("#chatHistory")
	if (!chatHistory)
		return setTimeout(checkChatHistory, 100)
	const actualAvatar = localStorage.getItem(CUSTOM_AVATAR_KEY)
	const currentAvatar = getCurrentAvatarSrc()
	const isAvatarSet = Array.from(chatHistory.querySelectorAll(".chatMessage"))
		.some((element) => element.innerText.includes(`${getPlayer().Username}: !avatar ${actualAvatar}`))
	if (isAvatarSet)
		return
	if (!currentAvatar)
		return setTimeout(checkChatHistory, 100)
	if (!actualAvatar)
		return
	if (currentAvatar == actualAvatar)
		return
	console.log("checkChatHistory");
	sendMessage(`!avatar ${actualAvatar}`)
}


(function() {
	onMessage(setAvatarCommand)
	window.navigation.addEventListener("navigate", () => { avatars = {} })
	window.navigation.addEventListener("navigate", () => setTimeout(updateAllAvatars, 100))
	// window.navigation.addEventListener("navigate", () => setTimeout(checkChatHistory, 100))
	applyAvatar(getPlayer.Username, localStorage.getItem(CUSTOM_AVATAR_KEY))
	//checkChatHistory()
	setTimeout(updateAllAvatars, 1000)
	window.navigation.addEventListener("navigate", () => setTimeout(observeChat, 100))
	//observeChat()
})();
