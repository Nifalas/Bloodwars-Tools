// ==UserScript==
// @name        BW - Licznik czasu na aukcjach
// @namespace   Violentmonkey Scripts
// @match       https://r21.bloodwars.interia.pl/
// @grant       none
// @version     1.0
// @author      -
// @description 19.10.2023, 17:08:52
// ==/UserScript==

const currentUrl = window.location.href;
// licznik czasu na aukcjach

if(currentUrl.indexOf('/https://r21.bloodwars.interia.pl/')){
fetch('https://r21.bloodwars.interia.pl/?a=auction')
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(html => {
        // Tutaj możesz przetwarzać treść strony, np. używając DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

    const auctionsList =  doc.querySelectorAll('.auction_listAuctionRowGrid');
         if (auctionsList.length > 1) {
            watchAuctions();
            addAuctionTimerToClient();
            setInterval(watchAuctions, 10000);
            setInterval(addAuctionTimerToClient, 10000);
         }


    })
    .catch(error => {
        // Obsłuż błąd
        console.error('Something went wrong:', error);
    });



function watchAuctions() {
    return fetch('https://r21.bloodwars.interia.pl/?a=auction')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const auctionsList = doc.querySelectorAll('.auction_listAuctionRowGrid');
            const results = [];

            if (auctionsList.length > 1) {
                for (let i = 1; i < auctionsList.length; i++) {
                    const singleAuction = auctionsList[i];
                    const singleAuctionName = singleAuction.querySelector('.auction_auctionRowItem .item-link').textContent;
                    let singleAuctionFinish = singleAuction.querySelectorAll('.auction_auctionFinished .no-wrap');
                    singleAuctionFinish = singleAuctionFinish[1].textContent;

                    const actualDate = new Date();
                    const auctionFinishDate = new Date(actualDate.toDateString() + " " + singleAuctionFinish);
                    const AuctionTimeDiffrence = auctionFinishDate - actualDate;
                    const hours = Math.floor(AuctionTimeDiffrence / 3600000);
                    const minutes = Math.floor((AuctionTimeDiffrence % 3600000) / 60000);
                    const seconds = Math.floor((AuctionTimeDiffrence % 60000) / 1000);
                    results.push([singleAuctionName, singleAuctionFinish, hours, minutes, seconds]);
                }
            }

            return results;
        })
        .catch(error => {
            console.error('Something went wrong:', error);
        });
}

function addAuctionTimerToClient() {
    watchAuctions().then(results => {
        const headerCenterPanel = document.querySelector('.additionalWrapperForSimpleBar');
        let newDivforAuctions = document.querySelector('.listOfCurrentAuctions');
        if(document.querySelector('.listOfCurrentAuctions')){
          let clearAuctions = document.querySelectorAll('.listOfCurrentAuctions');
          clearAuctions.forEach((auction)=>{
            auction.innerHTML="";
          })
        }
        const firstChild = headerCenterPanel.firstChild;
        for (const result of results) {
            const createDiv = document.createElement('div');
            createDiv.innerHTML = `${result[0]} - koniec: ${result[1]}, <b>zostało: ${result[2]}:${result[3]}:${result[4]}</b><br>`;
            createDiv.classList.add('listOfCurrentAuctions')
            headerCenterPanel.insertBefore(createDiv,firstChild);
        }
    });
}
}