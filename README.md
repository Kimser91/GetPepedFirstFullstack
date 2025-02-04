Title: Pc Dreamshop (working title)

Tech: SQL(SSMS), Node.js, Vue,

Acknowledgements: Youtube(Bro Code, Coding with Mosh), StackOverflow, w3Schools, Get Moodel, Kodelærer Stian Sundby

Lessons learned: 
    1. Hva er SQL og hvordan lage en tabell.
    2. Hva er et API og hvordan konstruere det.
    3. Hvordan kalle på databasen med et API.
    4. Hvordan vise informasjonen fra databasen på en nettside. 




Plan:

Lage en Komplett.no/Proshop.no replica

Trello link: https://trello.com/invite/b/6790c423a4c6f49e50a55ad5/ATTIe2b28ad919a008fddd246d7886726559FEDAE1F7/pc-nettbutikk

her er det en hel del som blir ganske nytt for meg så tidsperspektiv er litt vanskelig,
men i utgangspunktet tenker jeg 3-4 uker for å få noe som er funksjonelt og kanskje litt pressentabelt,

database og API er omtrent helt nytt for meg så dette tenker jeg kommer til å ta rundt 1 uke å få opp å gå

lære seg Vue og produsere noe som er relativt funksjonabelt regner jeg med 1 ukes tid til,

ta med ca 50% mer tid enn forventet så er ca 3 uker brukt av de 4 jeg har avsatt så da er det 1 uke igjen til forbedringer og 
finpuss av frontend

Detaljert plan:

1. Database.
    1. sette opp database, 
        punkt som må være i tabellen:
        1. Id
        2. Navn
        3. artikkelnr
        4. beskrivelse
        5. pris
        6. Lagerstatus
    2. bygge databasen,
        finne ut om det er en måte å hente data på
        evt om jeg kan bruke en form for generator for å lage det

2. API.
    1. bygge et API 
    2. finne ut hvordan man kobler sammen databasen og API
    3. finne ut hvordan man kobler API mot bruker portalen(nettsiden)

3.  Nettsiden.
    1. bruke Vue Rammeverk og Bootstrap CSS!
    2. konstruere basissttukturen på nettsiden i.e Header, sidebar og Main body. 
    3. kartlegge funksjoner som trengs på nettsiden.
    4. bygge Print funksjoner slik at nettsiden blir dynamisk konstruert etter databasen
    5. Lage en Adminportal? for å kunne legge til, endre/fjerne produkter

    6. ting som skal være på nettsiden.
        1. header med logo og søkebar (logo navigerer tilbake til mainView)
        2. left static sidebar(skal inneholde navigerings meny)
        3. main body(her er alt av produkter som samsvarer med søkekritereier eller menyvalg)
        4. skape en heilight funksjon som produserer nyheter og/eller populære produkter  
        5. handlevogn



