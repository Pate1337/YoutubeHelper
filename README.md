# YoutubeHelper
React + Node based app
Sovellus, joka käyttää YouTube APIa videoiden hakemiseen ja näyttämiseen.
Käyttäjät voivat jättää toisilleen kommentteja.
Lisää toiminnallisuutta suunnitellaan.

## Frontend

[YoutubeHelperFrontend](https://github.com/Pate1337/YoutubeHelperFrontend)

## Documentation

### Tuntikirjanpito

[Tuntikirjanpito Mikko Takala](https://github.com/Pate1337/YoutubeHelper/blob/master/documentation/tuntikirjanpito/MikkoTakala.md)

[Tuntikirjanpito Paavo Hemmo](https://github.com/Pate1337/YoutubeHelper/blob/master/documentation/tuntikirjanpito/PaavoHemmo.md)

### Käyttöohje

Aloita luomalla käyttäjätunnus sovellukseen.
Sovellusta voi myös käyttää ilman käyttäjätunnuksen luomista, mutta tällöin pelkästään videoiden hakeminen Youtubesta on mahdollista.

Kun olet luonut käyttäjätunnuksen, hae sovelluksen kautta haluamasi video Youtubesta ja lisää se joko Suosikkeihisi tai luomaasi soittolistaan.
Videon lisäyksen yhteydessä sovellus hakee Youtuben luomat videoehdotukset kyseiselle videolle ja tallettaa ne videosuosituksiisi.

Sovelluksen backendi käynnistetään hakemistossa YoutubeHelper/ komennolla
```
npm start
```
Sovelluksen frontend käynnistetään hakemistossa YoutubeHelperFrontend/ythelper/ komennolla
```
npm start
```
--------------------------------

## Heroku

[Sovellus herokussa](https://youtubehelper.herokuapp.com/)
