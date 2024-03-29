// ==UserScript==
// @name         AMQ Song Guesser
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  try to take over the world, one nexus at a time!
// @author       Luminight
// @match        https://animemusicquiz.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @updateURL    https://raw.githubusercontent.com/Luminighty/AMQ-scripts/main/amqSongGuesser.user.js
// ==/UserScript==


const TYPE_SPEED_MIN = 50;
const TYPE_SPEED_VARIANCE = 100;
const FAST_TYPE_SPEED = 50;
const ENABLE_CONFIG = true;	// 	true | false

const GUESS_RATE = 0.65;


let is_setup_finished = false;
function setup() {
	if (is_setup_finished)
		return;
	is_setup_finished = true
  window["saveSongsFromQuery"] = saveSongsFromQuery
	loadConfig();
	if (ENABLE_CONFIG)
		setupConfig();
	document.addEventListener("keyup", (e) => {
		if (window["amq-guesser"].config.autoGuess && e.key === "F2") answer();
	})
	listenToNextVideo()
	LumiBot()
}

let loadInterval = setInterval(() => {
    if (!document.getElementById("loadingScreen").classList.contains("hidden"))
        return
    setup()
    clearInterval(loadInterval)
}, 500);

//	=============================
//	=========== SETUP ===========
//	=============================

function setupConfig() {
	AMQ_addScriptData({
		name: "Song Guesser ඞ",
		author: "Luminight",
		description: `
			<span>Paste JSON here:</span>
			<textarea rows="10" id="amq-song-finder-add-json-textarea"></textarea>
			<button style="background: none" id="amq-song-finder-add-json-button">Save</button>
			<button style="background: none" id="amq-song-finder-export-button">Export</button>
			<button style="background: none" id="amq-song-finder-clear-button">Clear Data</button>
			${configCheckboxHtml("enableChat", "Chat")}
			${configCheckboxHtml("autoGuess", "F2 Autoguess")}
			${configCheckboxHtml("console", "Console Logging")}
			${configCheckboxHtml("consoleGuessing", "Console Guessing")}
			`
	})
	document.body.querySelector("#amq-song-finder-add-json-button").addEventListener("click", (e) => {
		e.target.disabled = true
		e.target.innerText = "Saving..."
		saveJsonPressed()
		setTimeout(() => { e.target.disabled = false; e.target.innerText = "Save"; }, 500)
	})
	document.body.querySelector("#amq-song-finder-export-button").addEventListener("click", (e) => {
		e.target.disabled = true
		window["exportLearnedSongs"]();
		setTimeout(() => { e.target.disabled = false; }, 500)
	})
    let doubleClickClear = 0;
	document.body.querySelector("#amq-song-finder-clear-button").addEventListener("click", (e) => {
        if (!doubleClickClear) {
            e.target.disabled = true
            e.target.innerText = "Are you sure?"
            setTimeout(() => {e.target.disabled = false}, 1000)
            doubleClickClear = setTimeout(() => {
                doubleClickClear = 0;
                e.target.innerText = "Clear Data"
            }, 5000)
            return;
        }
        clearTimeout(doubleClickClear)
        doubleClickClear = 0;
        e.target.innnerText = "Clear Data"
		e.target.disabled = true
		window["deleteLearnedSongs"]();
	})
	configCheckbox("enableChat")
	configCheckbox("autoGuess")
	configCheckbox("console")
	configCheckbox("consoleGuessing")
}

function loadConfig() {
	window["amq-guesser"] = {}
	const DEFAULT_CONFIG = {
		enableChat: true,
		autoguess: false,
		console: false,
	}
	let config = localStorage.getItem("config") ?? DEFAULT_CONFIG
	if (typeof(config) === "string")
		config = JSON.parse(config)
	window["amq-guesser"].config = config
}

function configCheckboxHtml(key, label) {
	return `<div><input type="checkbox" id="amq-song-finder-enable-${key}"><label for="amq-song-finder-enable-${key}">${label}</label></input></div>`
}

function configCheckbox(key) {
	const checkbox = document.body.querySelector(`#amq-song-finder-enable-${key}`)
	checkbox.checked = window["amq-guesser"].config[key]
	checkbox.addEventListener("change", (e) => {
		window["amq-guesser"].config[key] = e.target.checked
		log(`${key}: ${e.target.checked}`);
		localStorage.setItem("config", JSON.stringify(window["amq-guesser"].config))
	})
}

async function answer(openIfNotFound = true, timeLeft = 2000) {
	if (!window["amq-guesser"].foundInJson) {
		if (openIfNotFound)
			window.open(window["amq-guesser"].answer, "_blank")
		return
	}
	let answer = window["amq-guesser"].answer ?? ""
	answer = answer.toLowerCase().replace(/[^a-zA-Z0-9 \-!:&]/g, ' ').trim()
	while (answer.includes("  "))
		answer = answer.replaceAll("  ", " ")
	const score = Math.random()
	if (score > GUESS_RATE) {
		if (score > GUESS_RATE + (1 - GUESS_RATE) / 2) {
			log("I forgot")
			return
		}
		log("Almost...")
		answer = answer.slice(0, Math.random() * (answer.length / 3))
	}
	const input = document.querySelector("#qpAnswerInput")
	typeText(input, answer, timeLeft)
}

function typeText(element, text, timeLeft, offset = 1) {
	if (offset > text.length) {
		setTimeout(
			() => {
				jQuery(element).trigger({ type: 'keydown', which: 40, code: "ArrowDown", key: "ArrowDown", keyCode: 40 })
				jQuery(element).trigger({ type: 'keypress', which: 13 })
			},
			Math.random() * timeLeft / 3
		)
		return
	}
	element.value = text.slice(0, offset)
	element.dispatchEvent(new Event('input', {
		'bubbles': true,
		'cancelable': true
	}));
	element.dispatchEvent(new Event('keypress', {
		'bubbles': true,
		'cancelable': true
	}));
	const remainingLetters = text.length - offset;
	const timeoutUnit = timeLeft / remainingLetters;
	const timeout = Math.min(TYPE_SPEED_MIN + (Math.random() * TYPE_SPEED_VARIANCE), timeoutUnit - (Math.random() * FAST_TYPE_SPEED))
	setTimeout(
		() => typeText(element, text, timeLeft - timeout, offset + 1),
	 	Math.max(timeout, 30)
	)
}


function listenToNextVideo() {
	const amogus = MoeVideoPlayer.prototype.getNextVideoId
	MoeVideoPlayer.prototype.getNextVideoId = function(...params) {
		const original = amogus.apply(this, ...params)
		const songLink = this.videoMap["catbox"]?.["0"]
		const answer = localStorage.getItem(songKey(songLink))
		if (answer) {
			setAnswer(answer, true)
			return original
		}

		let video = this.videoMap["openingsmoe"]?.["480"] ??
						this.videoMap["openingsmoe"]?.["720"] ??
						this.videoMap["catbox"]?.["480"] ??
						this.videoMap["catbox"]?.["720"] ??
						this.videoMap["catbox"]?.["0"] ?? ""
		setAnswer(video)
		return original
	}
}

function setAnswer(answer, foundInJson = false) {
	log(answer)
	window["amq-guesser"].answer = answer;
	window["amq-guesser"].foundInJson = foundInJson;
	if (window["amq-guesser"].config.enableChat)
		socialTab.chatBar.handleMessage("Jessica", answer, {customEmojis: [], emotes: []}, false)
	if (window["amq-guesser"].config.consoleGuessing)
        console.log("Next song: ", answer)
}


//	=============================
//	=========== SETUP ===========
//	=============================

function songKey(url) {
	return `sus-${url.slice("https://ladist1.catbox.video/".length).split(".mp3")[0]}`
}

function saveJsonPressed() {
	const input = document.body.querySelector("#amq-song-finder-add-json-textarea")
	const songs = JSON.parse(input.value)
	console.log(songs)
	saveSongs(songs);
	input.value = ""
}

function saveSongs(songs, source) {
	const learned = songs
		.filter((song) => song.audio)
		.map((song) => [song.susSource ? song.audio : songKey(song.audio), song.animeENName])
        .map(([url, name]) =>
			localStorage.setItem(url, name)
		).length
	log(`Learned ${learned} songs!${source && ` (${source})`}`);
}

window["exportLearnedSongs"] = function exportJsonData() {
	const entries = [];
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i)
		if (!key.startsWith("sus-"))
			continue;
		entries.push({ audio: key, animeENName: localStorage.getItem(key), susSource: true })
	}

	const data = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(entries))}`;
	const link = document.createElement("a");
	link.href = data;
	const date = new Date(Date.now())
	link.download = `songs-${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}.json`
	link.click()
	link.remove()
	return entries
}

window["deleteLearnedSongs"] = function () {
	const entries = [];
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i)
		if (!key.startsWith("sus-"))
			continue;
        localStorage.removeItem(key);
	}
    console.log("songs deleted ;-;")
}

async function saveSongsFromQuery(query) {
	const method = "POST"
	const headers = [
		["Content-Type", "application/json"]
	]
	const body = JSON.stringify({
		"anime_search_filter": {
			"search": query,
		},
		"song_name_search_filter": {
			"search": query,
		},
		"artist_search_filter": {
			"search": query,
			"group_granularity": 0,
			"max_other_artist": 99
		},
		"composer_search_filter": {
			"search": query,
		},
		"and_logic": false,
	})
	const response = await fetch("https://anisongdb.com/api/search_request", {headers, body, method});
	const songs = await response.json();
	saveSongs(songs, query);
}


let LUMIBOT_ENABLED = false
let LUMIBOT_ISLEARNING = true
function LumiBot() {
	const playNextSongListener = new Listener("lumi play next song", OnPlayNextSong)
	const answerResultsListener = new Listener("lumi answer results", OnAnswerResults)
	document.body.addEventListener("keyup", (e) => {
		if (e.key === "F9") {
			LUMIBOT_ISLEARNING = !LUMIBOT_ISLEARNING
			console.log(LUMIBOT_ISLEARNING ? "learn" : "!learn");
		}
		if (e.key !== "F10")
			return
		if (!socket.listners["play next song"] || !socket.listners["answer results"])
			return
		if (!socket.listners["play next song"].includes(playNextSongListener)) {
			socket.listners["play next song"].push(playNextSongListener)
			socket.listners["answer results"].push(answerResultsListener)
			console.log("enabled");
		} else {
			socket.listners["play next song"].splice(socket.listners["play next song"].indexOf(playNextSongListener), 1)
			socket.listners["answer results"].splice(socket.listners["answer results"].indexOf(answerResultsListener), 1)
			console.log("disabled");
		}
	})
}

function OnPlayNextSong({ time }) {
	const MIN_GUESSING = (Math.min(time, 10) / 5) * 1000
	const GUESS_VARIANCE = (Math.min(time, 10) / 2) * 1000 - MIN_GUESSING
	const timeout = MIN_GUESSING + Math.random() * GUESS_VARIANCE;
	log(`Timeout: ${timeout}`);
	setTimeout(
		() => answer(false, time * 1000 - timeout ),
		timeout
	)
}

function OnAnswerResults({ songInfo }) {
	if (!LUMIBOT_ISLEARNING)
		return;
	const animeName = songInfo.animeNames.english;
	const catbox = songInfo.videoTargetMap.catbox["0"];
	if (localStorage.getItem(songKey(catbox)))
		return;
	log(`Learning: ${animeName}`);
	const arr = animeName.split(" ")
	const query = `${arr[0]} ${arr[1] ?? ""} ${arr[2] ?? ""}`.trimEnd();
	saveSongsFromQuery(query)
}

function delay(ms) {
	return new Promise((res, rej) => {
		setTimeout(() => res(), ms)
	})
}

function log(...message) {
	if (window["amq-guesser"].config.console)
		console.log(...message);
}

window["LearnSongs"] = async function LearnSongs(skipLearnedSongs, animeNames) {
	const learned = {}
	if (skipLearnedSongs) {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			learned[localStorage.getItem(key)] = true;
		}
	}
	for (let anime of animeNames) {
		if (learned[anime])
			continue;
		const arr = anime.split(" ")
		const query = `${arr[0]} ${arr[1] ?? ""} ${arr[2] ?? ""}`.trimEnd();
		await saveSongsFromQuery(query)
		await delay(100)
	}
	console.log("I've learned so much!");
}
