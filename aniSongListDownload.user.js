// ==UserScript==
// @name         AniSong List Download
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  God I love Anime
// @author       Luminight
// @match        https://anisongdb.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=anisongdb.com
// @updateURL    https://raw.githubusercontent.com/Luminighty/AMQ-scripts/main/aniSongListDownload.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    setTimeout(setup, 500);
})();

let isDownloading = false;
function setup() {
    const parent = document.body.querySelector("app-search-bar div .mainFilter").lastElementChild
    console.log(parent)
    if (!parent) {
        return setTimeout(setup, 500)
    }
    const link = document.createElement("a")
    link.innerHTML = `Download Song List as MP3`
    link.style.cursor = "pointer"
    link.style.float = "right"
    link.style.color = "var(--textOnBackground)"
    link.style.paddingLeft = "15px"
    link.style.textDecoration = "underline"
    link.addEventListener("click", (e) => {
        if (isDownloading)
            return
        e.preventDefault();
        const data = getData();
        navigator.clipboard.writeText(data).then(() => window.open("https://ladist1.catbox.video/", "_blank"));
    })
    parent.insertBefore(link, parent.children[1])
}


function getData() {
    return document.body
        .querySelector("app-song-table")
        .__ngContext__[51]
        .filter((song) => song.audio)
        .map((song) => `${song.audio} ${song.animeENName} - ${song.songType} - ${song.songName}.mp3`)
        .join("\n")
}

function GM_addStyle(css) {
  const style = document.getElementById("GM_addStyleBy8626") || (function() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = "GM_addStyleBy8626";
    document.head.appendChild(style);
    return style;
  })();
  const sheet = style.sheet;
  sheet.insertRule(css, (sheet.rules || sheet.cssRules || []).length);
}
