// ==UserScript==
// @name         AMQ Character Card Align
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Change the character cards to where they used to be (a bit higher up)
// @author       Luminight
// @twitch       twitch.tv/stormross
// @match        https://animemusicquiz.com/
// @icon         https://www.google.com/s2/favicons?domain=animemusicquiz.com
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @updateURL    https://raw.githubusercontent.com/Luminighty/AMQ-scripts/main/amqCharCardAlign.user.js
// @grant        none
// ==/UserScript==


(function() {

	// You can use this value to change how high up the character card is
	// 40 is really close to what it used to be
	const moveAmount = 40;

    let loadInterval = setInterval(() => {
        const loadingScreen = document.getElementById("loadingScreen")
        if (loadingScreen && loadingScreen.classList?.contains("hidden")) {
            
            AMQ_addScriptData({
                name: "Character Card Align",
                author: "Luminight",
                description: `
                    <p>Changes the character cards to where they used to be. (a bit higher up)</p>
                    <p>You can use the <code>moveAmount</code> variable to change how high up the character card is</p>
                    <p>My other scripts: <a href="https://github.com/Luminighty/AMQ-scripts" target="_blank">GitHub</a> <sub><a href="https://twitch.tv/stormross/" target="_blank">secret</a></sub></p>`
                    
            });
            clearInterval(loadInterval);
        }
    }, 500);


    let qpAvatarRow = null;
    let qpAnimeContainer = null;
    let loadMatch = setInterval(() => {
        if (document.querySelector("#qpAnimeContainer") != null) {
            clearInterval(loadMatch);
            setup();
            loadMatch = null;
        }
    }, 500);


    function setup() {

        let quizReady = new Listener("quiz ready", setHeight);
        quizReady.bindListener();
        qpAvatarRow = document.querySelector("#qpAvatarRow");
        qpAnimeContainer = document.querySelector("#qpAnimeContainer");
        window.addEventListener("resize", setHeight);
        setHeight();
    }

    let setHeight = function() {
        const height = qpAvatarRow.parentNode.offsetHeight;
        if (height == 0) {
            setTimeout(setHeight, 2000);
        }
        qpAvatarRow.style.height = `${(qpAvatarRow.parentNode.offsetHeight * 0.37) - 40}px`;
        qpAnimeContainer.style.marginBottom = "0px";
    };


})();