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



