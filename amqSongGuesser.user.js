// ==UserScript==
// @name         AMQ Song Guesser
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Zippybot
// @author       Luminight
// @match        https://animemusicquiz.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animemusicquiz.com
// @grant        none
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @updateURL    https://raw.githubusercontent.com/Luminighty/AMQ-scripts/main/amqSongGuesser.user.js
// ==/UserScript==

(async function() {
    AMQ_addScriptData({
        name: "Song Guesser ඞ",
        author: "Luminight",
        description: `
           <span>Paste JSON here:</span>
           <textarea rows="10" id="amq-song-finder-add-json-textarea"></textarea>
           <button style="background: none" id="amq-song-finder-add-json-button">Save</button>
           `
    })
    document.body.querySelector("#amq-song-finder-add-json-button").addEventListener("click", (e) => {
        saveJsonPressed()
        e.target.innerText = "Saved..."
        e.target.disabled = true
        setTimeout(() => {
            e.target.disabled = false
            e.target.innerText = "Save"
        }, 2000)
    })
    listenToNextVideo()
})();

function saveJsonPressed() {
    const input = document.body.querySelector("#amq-song-finder-add-json-textarea")
    const songs = JSON.parse(input.value)
    console.log(songs)
    songs.map((song) => [song.audio, song.animeENName])
       .map(([url, name]) => localStorage.setItem(`amogus-${url}`, name))
    input.value = ""
}

function listenToNextVideo() {
    const amogus = MoeVideoPlayer.prototype.getNextVideoId
    MoeVideoPlayer.prototype.getNextVideoId = function(...params) {
        const original = amogus.apply(this, ...params)
        const songLink = `https://files.catbox.moe/${this.videoMap["catbox"]?.["0"].slice(25)}`
        const answer = localStorage.getItem(`amogus-${songLink}`)
        if (answer) {
            console.log(answer)
            return original
        }

        let video = "";
        video = this.videoMap["openingsmoe"]?.["720"] ?? this.videoMap["openingsmoe"]?.["480"] ?? this.videoMap["catbox"]?.["720"] ?? this.videoMap["catbox"]?.["480"] ?? this.videoMap["catbox"]?.["0"]
        if (video.startsWith("https://amq.catbox.video/"))
            video = `https://files.catbox.moe/${video.slice(25)}`
        console.log(video)
        return original
    }
}

function applyStyles(element, styles) {
  for (const key in styles)
    element.style[key] = styles[key]
}


function openLoaderDialog() {

    const loaderHtml = `
  <h3 class="lm-dialog-title">Paste JSON here:</h3>
  <textarea></textarea>
  <button class="submitButton">Submit</button>
  <button class="cancelButton">Cancel</button>
`
    const textAreaStyles = {
        width: "100%",
        height: "calc(35vh - 90px)",
        minHeight: "unset",
        border: "2px solid white",
    }

    const buttonStyles = {
        backgroundColor: "transparent",
        border: "1px solid white",
        textAlign: "center",
    }

    const headerStyles = {
    }

    const containerStyles = {
        zIndex: 9999,
        width: "50vw",
        height: "35vh",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        border: "2px solid white",
        backgroundColor: "#1b1b1b"
    }

    const container = document.body.appendChild(document.createElement("div"))
    container.innerHTML = loaderHtml;
    const input = container.querySelector("textarea")
    const submit = container.querySelector(".submitButton")
    const cancel = container.querySelector(".cancelButton")
    const header = container.querySelector("h3")
    applyStyles(container, containerStyles)
    applyStyles(header, headerStyles)
    applyStyles(input, textAreaStyles)
    applyStyles(submit, buttonStyles)
    applyStyles(cancel, buttonStyles)

   submit.addEventListener("click", () => {
       const data = JSON.parse(input.value)
       console.log(data)
       loadJson(data)
       container.remove()
   })
   cancel.addEventListener("click", () => {
       container.remove()
   })
}
