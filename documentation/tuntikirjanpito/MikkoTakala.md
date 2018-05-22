| Pvm | Tunnit | Kuvaus
| ------- | ------- | -----
| 13.03.18 | 3.5h | Aloitus dokkarit + npm init, index.js, tietokannat luotu yms. aloitustoimia + YouTube APIn selvitystä
| 14.03.18 | 1h | YT APIn lukemista, alustava User-model, tietokantayhteyden testaus
| 15.03.18 | 2h | Uuden käyttäjän luomisen toiminnallisuuden lisäämistä
|  | 2h | Käyttäjän rekisteröinti tehty loppuun
| 20.03.18 | 2h | Käyttäjän rekisteröinnin string-validationit kuntoon frontissa ja bäkissä, ja salasanan lisätarkistus(uusi kenttä) ja siihen visuaalinen ilmoitus
| 21.03.18 | 2h | Progress barin lisääminen piilotettuun soittolistaan. Toiminnallisuus kesken. APIen ja dokumentaatioiden lukemista
| 22.03.18 | 4h | Favorites listaan linkin poistonappi ja aivan älytön bugihuntti koska 1 koodirivi. Fronttiin funktio poistolle bäkin kutsumista varten.
| 26.03.18 | 1h | User.js runkoa, läppärille mongodb konffaus .enviin, 22-26 tulleen uuden koodin läpikäyntiä ja Heroku -version testailua.
|   | 3.5h | Favorite linkkien poisto tehty loppuun, nyt myös User olion favorites listalta poistuu linkki joka on poistettu.
| 27.03.18 | 3h | Favorites listaa muokattu paremmaksi, voi soittaa videoita, ulkoasu järkevämpi. Käyttäjälistaan lisätty toiminnallisuutta, kesken vielä
| 29.03.2018 | 3h | Käyttäjien välisten kommenttien jättämisen rakentamista, vähän sekava eikä toimi vielä.
| 02.04.2018 | 1h | Kommenttien lisääminen alkaa olla lähellä toimintaa. Tietokannassa tallentuu jo se mitä pitää
|   | 2.5h | Niitten vitun kommenttien säätämistä. Eihän se paska toimi vieläkään
| 07.04.2018 | 2.5h | Sama kun ylempi. Miljoona riviä console logia ja pään seinään hakkaamista ja tuloksena tyhjiä taulukoita. Ei edes vituta
| 15.05.2018 | 2h | Tauon jälkeen vähän edistystä. Kommentit näkyy nyt, mutta formissa tai jossain on jotakin hämärää, vain yhdelle käyttäjälle voi lisätä kommentteja, muista jää kaikki muu paitsi ID pois.
| 19.05.2018 | 2.5h | Kommentit saatu toimimaan, vika oli backendissä, siirretty kommenttien haku pois getUserilta omaan comments routeen, ja reduceri ja frontti muokattu käyttämään sitä, jotta ei tarvi aina hakea miljoonaa riviä turhaa dataa userien mukana, vaan saadaan pelkät kommentit haettua lähettäjän id:n perusteella. Myös sivun päivitys kommentin jättämisen jälkeen toimii nyt, eikä tarvi rämppäillä F5.
| 20.05.2018 | 3h | Kommenttien poistolle toiminnallisuus. Poistaa sekä kommentti olion, että vastaanottaja-userin vastaanotetut listan kommentti-id:n. Lähetettyjen listalta ei toistaiseksi poisteta. Nyt kommentti tallentuu lähetettyihin myös silloin kun käyttäjä lähettää kommentin itselleen. Kommentteja voi poistaa vain niiden vastaanottaja. Bäkissä on vielä optimoinnin varaa.
| 22.05.2018 | 3.75h | Pieniä refaktorointeja ja muutoksia kommentteihin ja Käyttäjät-näkymään. Käyttäjät näkymän eri käyttäjien playlistien näyttäminen ei oikeen onnistunut, vaatii näköjään isompia muutoksia kun mitä ajattelin. Muutokset jätetty pois toistaiseksi. Pitää joko muuttaa userLinksReduceria jotenkin tai tehdä kokonaan uusi reduceri tai jotain emt.
 YHTEENSÄ | 40.5h |  
