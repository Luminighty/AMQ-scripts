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

let GUESS_RATE = 0.9;
let GUESS_RATE_ALMOST = 0.95


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
		const loadingScreen = document.getElementById("loadingScreen")
    if (!loadingScreen || !loadingScreen.classList.contains("hidden"))
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
			<button style="background: none" id="amq-song-finder-add-json-button">Save JSON</button>
			<button style="background: none" id="amq-song-finder-export-button">Export</button>
			<button style="background: none" id="amq-song-finder-clear-button">Clear Data</button>
			${configCheckboxHtml("enableChat", "Chat")}
			${configCheckboxHtml("autoGuess", "F2 Autoguess")}
			${configCheckboxHtml("console", "Console Logging")}
			${configCheckboxHtml("consoleGuessing", "Console Guessing")}
			`
	})
	const input = document.body.querySelector("#amq-song-finder-add-json-textarea")
	const addJsonButton = document.body.querySelector("#amq-song-finder-add-json-button")
	input.addEventListener("change", (_) => addJsonButton.disabled = input.value.length == 0)
	addJsonButton.addEventListener("click", (e) => {
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
        e.target.innerText = "Clear Data"
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

function getAutoComplete() {
	return quiz.answerInput.typingInput.autoCompleteController.awesomepleteInstance
}

async function answer(openIfNotFound = true, timeLeft = 2000) {
	if (!window["amq-guesser"].foundInJson) {
		if (openIfNotFound)
			window.open(window["amq-guesser"].answer, "_blank")
		return
	}
	let answer = window["amq-guesser"].answer
	answer = answer.toLowerCase().replace(/[^a-zA-Z0-9 '\-!:&]/g, '').trim()
	while (answer.includes("  "))
		answer = answer.replaceAll("  ", " ")
	answer = answer.trim()
	const score = Math.random()
	if (score >= GUESS_RATE) {
		if (score >= GUESS_RATE_ALMOST) {
			log(`I forgot (${score} > ${GUESS_RATE})`)
			return
		}
		log(`Almost... (${GUESS_RATE_ALMOST} > ${score} > ${GUESS_RATE})`)
		answer = answer.slice(0, Math.floor(Math.random() * (answer.length / 3)))
	}
	const input = document.querySelector("#qpAnswerInput")
	typeText(input, answer, timeLeft)
}

let autocompleteLastSuggestion = null
function typeText(element, text, timeLeft, offset = 1) {
	const autoComplete = getAutoComplete()
	const isAutocompleteUpdated = autocompleteLastSuggestion !== autoComplete?.suggestions?.[0]
	if (offset > 6 && autoComplete.opened && autoComplete?.suggestions.length === 1 && isAutocompleteUpdated) offset = text.length + 1
	if (offset > text.length) {
		if (autoComplete?.suggestions[0]?.value && isAutocompleteUpdated)
			element.value = autoComplete.suggestions[0].value
		autocompleteLastSuggestion = autoComplete?.suggestions[0]
		element.dispatchEvent(new Event('input', {
			'bubbles': true,
			'cancelable': true
		}));
		element.dispatchEvent(new Event('keypress', {
			'bubbles': true,
			'cancelable': true
		}));
		setTimeout(
			() => {
				jQuery(element).trigger({ type: 'keydown', which: 40, code: "ArrowDown", key: "ArrowDown", keyCode: 40 })
				jQuery(element).trigger({ type: 'keypress', which: 13 })
				setTimeout(() => autoComplete.close(), 100);
			},
			Math.random() * Math.min(timeLeft / 3, 5000)
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

function getVideoMapLink(videoMap) {
	return videoMap["catbox"]?.["0"] ??
		videoMap["catbox"]?.["480"] ??
		videoMap["catbox"]?.["720"] ?? null
}

function onNextVideoInfo(data) {
	const videoMap = data.videoInfo.videoMap
	const songLink = videoResolver.formatUrl(getVideoMapLink(videoMap))
	const answer = getSong(songKey(songLink))
	if (answer) {
		setAnswer(answer, true)
		return
	}

	let video = videoMap["openingsmoe"]?.["480"] ??
					videoMap["openingsmoe"]?.["720"] ??
					videoMap["catbox"]?.["480"] ??
					videoMap["catbox"]?.["720"] ??
					videoMap["catbox"]?.["0"] ?? ""
	setAnswer(videoResolver.formatUrl(video))
}

function listenToNextVideo() {
	socket._socket.on("command", function (payload) {
		if (payload.command !== "quiz next video info")
			return
		onNextVideoInfo(payload.data)
	})
}


function setAnswer(answer, foundInJson = false) {
	log(answer)
	window["amq-guesser"].answer = window["amq-guesser"].nextAnswer?.answer;
	window["amq-guesser"].foundInJson = window["amq-guesser"].nextAnswer?.foundInJson;
	window["amq-guesser"].nextAnswer = {answer, foundInJson};

	if (window["amq-guesser"].config.enableChat)
		socialTab.chatBar.handleMessage("Jessica", answer, {customEmojis: [], emotes: []}, false)
	if (window["amq-guesser"].config.consoleGuessing)
        console.log("Next song: ", answer)
}


//	=============================
//	=========== SETUP ===========
//	=============================

let hasUnsavedSongs = false
const songData = {}

function storageKey() {
	return `sus-data`
}
function storeSongData() {
	const data = compressSongs()
	localStorage.setItem(storageKey(), JSON.stringify(data));
}
function loadStorageSongData() {
	const data = localStorage.getItem(storageKey())
	if (!data) return;
	window["setSongData"](decompressSongs(JSON.parse(data)))
}
window["storeSongData"] = storeSongData
window["loadStorageSongData"] = loadStorageSongData

function songKey(url) { 
	if (url.includes("https://"))
		return new URL(url).pathname.slice(1).split(".mp3")[0]
	return url.split(".mp3")[0]
}

function getSong(key) { return songData[key] }
function setSong(key, answer) { songData[key] = answer; hasUnsavedSongs = true; }
function compressSongs() {
	const data = {};
	Object.entries(songData).forEach(([key, anime]) => {
		if (!data[anime]) data[anime] = []
		data[anime].push(key)
	})
	return data
}
function decompressSongs(data) {
	const decompressed = {}
	Object.entries(data).forEach(([anime, keys]) => {
		keys.forEach((key) => decompressed[key] = anime)
	})
	return decompressed
}

function saveJsonPressed() {
	const input = document.body.querySelector("#amq-song-finder-add-json-textarea")
	const songs = decompressSongs(JSON.parse(input.value))
	window["setSongData"](songs)
	console.log(songs)
	input.value = ""
	storeSongData()
}

function saveSongs(songs, source) {
	const learned = songs
		.filter((song) => song.audio)
		.map((song) => [song.susSource ? song.audio : songKey(song.audio), song.animeENName])
        .map(([url, name]) =>
			setSong(url, name)
		).length
	log(`Learned ${learned} songs!${source && ` (${source})`}`);
	storeSongData()
}

window["exportLearnedSongs"] = function exportJsonData() {
	const entries = localStorage.getItem(storageKey())

	const data = `data:text/json;charset=utf-8,${encodeURIComponent(entries)}`;
	const link = document.createElement("a");
	link.href = data;
	const date = new Date(Date.now())
	link.download = `songs-${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}.json`
	link.click()
	link.remove()
	return entries
}

window["deleteLearnedSongs"] = function () {
	localStorage.removeItem(storageKey())
	Object.keys(songData).forEach((key) => {
		delete songData[key]
	})
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
	loadStorageSongData()
	document.body.addEventListener("keyup", (e) => {
		if (e.key === "F9") {
			LUMIBOT_ISLEARNING = !LUMIBOT_ISLEARNING
			console.log(LUMIBOT_ISLEARNING ? "learn" : "!learn");
		}
		if (e.key !== "F10")
			return
		LUMIBOT_ENABLED = !LUMIBOT_ENABLED
		
		if (LUMIBOT_ENABLED) {
			console.log("enabled");
			socket.addListerner("play next song", playNextSongListener)
			socket.addListerner("answer results", answerResultsListener)
		} else {
			socket.removeListener("play next song", playNextSongListener)
			socket.removeListener("answer results", answerResultsListener)
			console.log("disabled");
		}
	})
}

function OnPlayNextSong({ time }) {
	const MIN_GUESSING = (Math.min(time, 10) / 5) * 1000
	const GUESS_VARIANCE = (Math.min(time, 10) / 2) * 1000 - MIN_GUESSING
	const timeout = MIN_GUESSING + Math.random() * GUESS_VARIANCE;
	log(`Timeout: ${Math.floor(timeout)}ms`);
	setTimeout(
		() => answer(false, time * 1000 - timeout - 500),
		timeout
	)
}

function OnAnswerResults({ songInfo }) {
	if (!LUMIBOT_ISLEARNING)
		return;
	const animeName = songInfo.animeNames.english;
	const catbox = videoResolver.formatUrl(getVideoMapLink(songInfo.videoTargetMap));
	const key = songKey(catbox)
	if (getSong(key)) {
		// Check if it's shorter
		const oldSong = getSong(key)
		if (animeName.length < oldSong.length) {
			log(`Found shorter name "${oldSong}" -> "${animeName}"`)
			setSong(key, animeName)
			storeSongData()
		}
		return;
	}
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
	let i = 0
	let lastSaved = i

	animeNames.sort()
	animeNames = animeNames.filter(Boolean)
	animeNames = animeNames.filter((anime) => !skipLearnedSongs || !Object.values(songData).includes(anime))
	animeNames = animeNames.map((anime) => {
		const arr = anime.split(" ")
		const query = `${arr[0]}`.trimEnd().toLowerCase();
		return query
	})
	animeNames = animeNames.filter((anime, index) => animeNames.lastIndexOf(anime) == index)

	for (let anime of animeNames) {
		i++
		await saveSongsFromQuery(anime)
		await delay(100)
		if (i % 10 === 0)
			log(`Learning status ${i}/${animeNames.length}`)
		if (i - lastSaved > 20) {
			lastSaved = i
			storeSongData()
		}
	}
	console.log("I've learned so much!");
	storeSongData()
}

window["getSongData"] = function getSongData() { return songData }
window["setSongData"] = function setSongData(data) { Object.entries(data).forEach(([key, value]) => songData[key] = value) }
window["setGuessRate"] = function (value) { GUESS_RATE = value; }
window["setGuessRateAlmost"] = function (value) { GUESS_RATE_ALMOST = value; }