// ==UserScript==
// @name         Catbox download all
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Gro42
// @author       Luminight
// @match        https://ladist1.catbox.video/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=catbox.video
// @updateURL    https://raw.githubusercontent.com/Luminighty/AMQ-scripts/main/catboxDownload.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if (window.location.pathname !== "/")
        return

    const links = document.createElement("textarea")
    const button = document.createElement("button")
    button.innerText = "Download"
    button.style.display = "block"
    links.style.width = "300px"
    links.style.height = "300px"
    links.placeholder = "Paste here..."

    button.addEventListener("click", () => {
        const pairs = links.value
           .split("\n")
           .map((line) => line.split(" "))
           .map(([link, ...name]) => [link, name.join(" ")])
        downloadAll(pairs)
    })

    document.body.appendChild(links)
    document.body.appendChild(button)

})();

function downloadAll(links) {
    return Promise.all(links.map(([url, song]) => download(url, song)))
}


async function download(url, filename) {
    const data = await fetch(url, {mode: "no-cors"})
    const blob = await data.blob()
    const objectUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.setAttribute('href', objectUrl)
    link.setAttribute('download', filename)
    link.style.display = 'none'

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
}

function downloadLink() {
    return Promise.all(
        document.body.querySelector("app-song-table").__ngContext__[51].map((song) => {
            download(song.audio, `${song.animeENName} - ${song.songType} - ${song.songName}.mp3`)
        })
    )
}