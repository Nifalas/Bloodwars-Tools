// ==UserScript==
// @name        Nifek Tools BW
// @namespace   Violentmonkey Scripts
// @match       https://r21.bloodwars.interia.pl/
// @grant       none
// @version     1.0
// @author      -
// @description 14.10.2023, 15:27:58
// ==/UserScript==
const currentUrl = window.location.href;

// Pobieranie wyświetlanie ceny z aukcji w zbrojowni
if (currentUrl.indexOf('?a=equip') != -1) {

    // Pobieranie listy itemów
    const itemy = document.querySelectorAll('.armory_playerItem .textShadow .item-link');
    let lastItemsPriceArr = [];
    let lastItemsPriceAll = 0;
    let lastItemsPrice3 = 0;

    // Wyciąganie linku do zakończonych aukcji
    itemy.forEach((item) => {
        item.addEventListener('click', function() {
            lastItemsPriceArr = []; // Wyczyść tablicę przed każdym nowym kliknięciem
            lastItemsPriceAll = 0;
            lastItemsPrice3 = 0;
            let inside = this.getAttribute("data-tippy-content");

            const parser = new DOMParser();
            const doc = parser.parseFromString(inside, 'text/html');
            let link = doc.querySelectorAll(".itemDescDetailsLink");

            let finalLink = link[1].querySelector('a').href;

            // fetch - funkcja pobierania danych z wszystkich aukcji
            fetchAuction(finalLink);

        });
    });

    // fetch function
    function fetchAuction(finalLink) {
        fetch(finalLink)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(function(html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const table = doc.querySelector('.cevent_newCeventOptionContainerWrapper');
                if (table) {
                    let auctions = table.querySelectorAll('.auction_listAuctionRowGrid');
                    // Wyciąganie ceny, która została zapłacona za przedmiot
                    auctions.forEach((auction) => {
                        let price = auction.querySelector('.auction_auctionRowTopOffers div');
                        if (price !== null) {

                            price = parseInt(price.textContent);
                            if (!isNaN(price)) {
                                lastItemsPriceArr.push(price);
                            }

                        }

                    })

                    // Wywołanie funkcji averagePrice
                    const result = averagePrice(lastItemsPriceArr);

                    // Wyświetlanie wyników
                    console.log("Średnia wszystkich ostatnich tranzakcji: " + result.lastItemsPriceAll);
                    console.log("Średnia ostatnich 3 tranzakcji: " + result.lastItemsPrice3);

                    // dodawanie wyników do klienta
                    const placeForResult = document.querySelector(".itemDescContainer");
                    const newDiv = document.createElement("div");
                    const newDiv3 = document.createElement("div");

                    newDiv.innerHTML = "<b>Średnia wszystkich aukcji:</b> " + result.lastItemsPriceAll;
                    newDiv3.innerHTML = "<b>Średnia 3 ostatnich aukcji:</b> " + result.lastItemsPrice3;

                    placeForResult.appendChild(newDiv);
                    placeForResult.appendChild(newDiv3);



                } else {
                    console.log('Nie znaleziono tabeli.');
                }
            })
            .catch(function(err) {
                // Obsłuż błędy
                console.warn('Something went wrong.', err);
            });
    }

    function averagePrice(lastItemsPriceArr) {
        if (lastItemsPriceArr.length === 0) {
            return {
                lastItemsPriceAll: 0,
                lastItemsPrice3: 0
            };
        }

        let lastItemsPriceAll = 0;
        let lastItemsPrice3 = 0;

        // Oblicz średnią dla wszystkich przedmiotów
        for (var i = 0; i < lastItemsPriceArr.length; i++) {
            lastItemsPriceAll += lastItemsPriceArr[i];
        }

        lastItemsPriceAll = lastItemsPriceAll / lastItemsPriceArr.length;
        lastItemsPriceAll = Math.round(lastItemsPriceAll);

        // Oblicz średnią dla ostatnich 3 przedmiotów

        if (lastItemsPriceArr.length < 3) {
            for (var i = 0; i < lastItemsPriceArr.length; i++) {
                lastItemsPrice3 += lastItemsPriceArr[i];
            }
            lastItemsPrice3 = lastItemsPrice3 / lastItemsPriceArr.length;
        } else {
            for (var i = 0; i < 3; i++) {
                lastItemsPrice3 += lastItemsPriceArr[i];
            }
            lastItemsPrice3 = lastItemsPrice3 / 3;
            lastItemsPrice3 = Math.round(lastItemsPrice3);
        }



        return {
            lastItemsPriceAll,
            lastItemsPrice3
        };
    }

}

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
            setInterval(watchAuctions, 5000);
            setInterval(addAuctionTimerToClient, 5000);
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

