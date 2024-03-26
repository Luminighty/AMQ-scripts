// ==UserScript==
// @name         EMQ Mass Download
// @namespace    http://tampermonkey.net/
// @version      2024-03-25
// @description  Download the search results from the library
// @author       Luminight
// @match        https://erogemusicquiz.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erogemusicquiz.com
// @grant        none
// ==/UserScript==

(function() {
	'use strict';
window.navigation.addEventListener("navigate", () => setup())
	setup()
})();

async function setup() {
	await delay(100)
	console.log("setup", location.pathname)
	if (!location.pathname.startsWith("/LibraryPage"))
			return

	const nav = await find(() => document.querySelector("article .nav.nav-tabs"))
	if (!nav)
		return;
	if (nav.querySelector(".lumi-download"))
		return;
	const item = document.createElement("li")
	item.classList.add("nav-item")
	item.classList.add("lumi-download")
	item.innerHTML = `<a class="nav-link" tabindex="${nav.childElementCount}">Download</a>`
	let disabled = false
	item.addEventListener("click", () => {
			if (disabled)
					return
			disabled = true
			item.firstChild.classList.add("disabled")
			downloadAll()
					.finally(() => {
							disabled = false
							item.firstChild.classList.remove("disabled")
					})
	})
	nav.appendChild(item)
}

async function downloadAll() {
	const data = await Promise.all(
			Array.from(document.querySelector(".songs").querySelectorAll(".song.card"))
			.map(async (card) => [await getSongName(card), getVnDownloadUrl(card)])
	)
	await Promise.all(data.map(([{series, title, artist}, url]) => download(url, `${series} - ${title}`)))
}


async function getSongName(card) {
	const songSource = card.querySelector(".songSourceVNID")
	songSource.dispatchEvent(new MouseEvent('mouseenter', {
		'view': window,
		'bubbles': true,
		'cancelable': true
	}))
	const describedBy = await find(() => songSource.parentElement.getAttribute("aria-describedby"), 10)
	const popup = await find(() => document.querySelector(`#${describedBy}`), 10)

	const series = popup.innerText
	const title = card.querySelector(".songLatinTitle.card-title").innerText
	const artist = card.querySelector(".songArtistsTitle").parentElement.innerText

	songSource.dispatchEvent(new MouseEvent('mouseleave', {
		'view': window,
		'bubbles': true,
		'cancelable': true
	}))

	return { series, title, artist }
}

function getVnDownloadUrl(card) {
	const li = Array.from(card.querySelectorAll(".songInfoCardSongLinksSoundLink"))
			 .filter((link) => link.innerText.includes("✓"))
			 .filter((link) => link.querySelector("a").href.includes("erogemusicquiz"))?.[0]
	return li.querySelector("a").href
}

function getExtension(url) {
	const s = url.split(".")
	return s[s.length - 1] ?? "weba"
}


// Utils

async function download(url, filename) {
	const ext = getExtension(url)
	console.log({url, filename, ext })
	const data = await fetch(url, {mode: "no-cors"})
	const blob = await data.blob()
	const objectUrl = URL.createObjectURL(blob)

	const link = document.createElement('a')

	link.setAttribute('href', objectUrl)
	link.setAttribute('download', `${filename}.${ext}`)
	link.style.display = 'none'

	document.body.appendChild(link)

	link.click()

	document.body.removeChild(link)
}

async function delay(ms) {
	return new Promise((res) => setTimeout(() => res(), ms))
}

async function find(cb, timeout=100) {
	let maxIter = 100
	while (maxIter > 0) {
			maxIter--
			const result = cb();
			if (result) {
					if (!Array.isArray(result) || result.length > 0)
							return result;
			}
			await delay(timeout)
	}
}

async function delay(ms) {
	return new Promise((res) => setTimeout(() => res(), ms))
}

async function find(cb, timeout=100) {
	let maxIter = 100
	while (maxIter > 0) {
			maxIter--
			const result = cb();
			if (result) {
					if (!Array.isArray(result) || result.length > 0)
							return result;
			}
			await delay(timeout)
	}
}