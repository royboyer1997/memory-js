/*  ==========================================================================
    CONSTANTEN
    ==========================================================================
    Constanten zijn variabelen die niet gewijzigd zullen en kunnen worden
    in onze applicatie. We gebruiken ze eigenlijk vaak om waarden die we
    vaak gebruiken voor b.v. controles een duidelijker naam te geven.
    Hierdoor kunnen we in onze code makkelijker lezen wat we bedoelen.
    Dus puur voor de leesbaarheid van onze code.
    ==========================================================================
 */
const SPELER1               = 0;
const SPELER2               = 1;
const CARD_BACK             = 0;
const CARD_FRONT            = 1;
const OFF                   = false;
const ON                    = true;
const YES                   = true;
const NO                    = false;
const NO_CARD_CLICKED       = -1;
const FIRST_CARD_CLICKED    = 0;
const LAST_CARD_CLICKED     = 1;

/*  ==========================================================================
    VARIABELEN
    ==========================================================================
    Variabelen zullen wel gewijzigd worden. Op z'n minst om bij het starten
    van ons programma ze alvast te vullen met een object of een waarde.
    ==========================================================================
 */
var speelveld;                  // Element
var game_button;                // Element
var score_speler_1;             // Element
var score_speler_2;             // Element
var huidige_speler = SPELER1;   // Welke speler is aan de beurt
var naam_speler_1;              // Element
var naam_speler_2;              // Element
var cards = [                   // De nummers zijn tevens de namen van de jpeg
    1, 2, 3, 4, 5, 6, 7, 8,       // afbeeldingen (1.jpg bijvoorbeeld)
    1, 2, 3, 4, 5, 6, 7, 8
];
/*
    In de onderstaande array houden we bij op welke twee kaarten geclicked is
    We kunnen deze array ook gebruiken om te controleren of het maximaal
    aantal aan te klikken kaarten al is bereikt.
 */
var cards_clicked = [ NO_CARD_CLICKED, NO_CARD_CLICKED ];

var ronde_scores = [ 0, 0 ];    // Hier houden we tijdelijk de rondescores bij
var totaal_scores = [ 0, 0 ];   // Hier houden we de totaal scores per speler bij

/*  ==========================================================================
    FUNCTIES
    ==========================================================================
    Hieronder schrijven we al onze functies die samen het spel vormen en het
    dus mogelijk maken ons spel ook echt te spelen.
    De twee kernfuncties zijn:

    clickOnGameButton
    -----------------
    Deze functie gaat alle kliks op de button afhandelen en de dingen doen
    die we in de voorbereiding hebben bedacht.

    clickOnCard
    -----------
    Deze functie gaat alle kliks op de kaarten afhandelen. In deze functie
    wordt eigenlijk het spel gespeeld en moeten we dus ook verschillende
    controles inbouwen

    ==========================================================================
 */

window.onload = function() {
    speelveld = document.getElementsByClassName('play-card');
    game_button = document.getElementById('game-button');
    score_speler_1 = document.getElementById('score-speler-1');
    score_speler_2 = document.getElementById('score-speler-2');
    naam_speler_1 = document.getElementById('name-speler-1');
    naam_speler_2 = document.getElementById('name-speler-2');

    huidige_speler = determineStartingPlayer();

    game_button.addEventListener('click', clickOnGameButton );

}

/*
    resetScores()
    -------------
    Reset de rondescores

    TYPE:   Hulpfunctie
 */
function resetScores()
{
    ronde_scores[SPELER1] = 0;
    ronde_scores[SPELER2] = 0;
}

/*
    getCardImageTag()
    -----------------
    Maak de image tag af met een kaart op basis van de kaartnummer
    Een kaartnummer loopt van 0 t/m 15

    @return string  De image-tag naar een juiste afbeelding

    TYPE:   Hulpfunctie
 */
function getCardImageTag(card_index)
{
    /*
        Onderstaande opdracht levert bijvoorbeeld het volgende op als card_index gelijk is 1
        en op cards[1] staat het afbeeldingsnummer 8:

        <img class="play-card-img" src="img/8.jpg" />
     */
    return '<img  class="play-card-img" src="img/' + cards[card_index] + ".jpg\" />"
}

/*
    clickOnGameButton()
    -------------------
    Handel de clicks op de button af

    TYPE:   Main Functie
 */
function clickOnGameButton(event)
{
    shuffleCards();
    huidige_speler = determineStartingPlayer();
    showCurrentPlayer();

    if(game_button.innerText === 'Start') {
        game_button.innerText = "Reset";    // Tekst op de knop veranderen

        /*
            Hieronder maken we de kaarten een voor een klikbaar
         */
        for(var kaart_nummer = 0; kaart_nummer < speelveld.length; kaart_nummer++) {
            speelveld[kaart_nummer].addEventListener('click', clickOnCard );
        }
    } else {
        resetScores();
    }
}

/*
    clickOnCard()
    -------------
    Handel de clicks op de cards af
    In deze functie handelen we een ronde af

    TYPE:   Main Functie
 */
function clickOnCard(event)
{
    // Voorbereiden van lokale variabelen
    var parentDiv = event.target.parentElement.parentElement;
    var card_back = event.target.parentElement.parentElement.children[0];
    var card_front = event.target.parentElement.parentElement.children[1];
    var cellNumber = event.target.parentElement.parentElement.parentElement.cellIndex;
    var rowNumber = event.target.parentElement.parentElement.parentElement.parentElement.rowIndex;
    var cardNumber = (rowNumber * 4) + cellNumber;

    /*
        - Als de speler die aan de beurt is (huidige_speler) nog niet
        het maximaal aantal kaarten heeft aangeklikt dan:V
            - kaart die de speler heeft aangeklikt omdraaien V
            - vastleggen in de array cards_clicked op welke kaart de speler
              heeft geklikt. Dit doen we door de index van de kaart in deze
              array te stoppen.
            - Als de huidige speler nu twee kaarten heeft aangeklikt dan:
                - Als de twee aangeklikte kaarten gelijk zijn dan:
                    - ronde score van deze speler verhogen met 1 punt
                      (ronde_scores[huidige_speler])
                    - schakel de klik mogelijkheid op deze twee kaarten uit
                    - reset de variabele cards_clicked, beide waarden
                      in deze array weer terug zetten op NO_CARD_CLICKED
                - anders (de kaarten zijn niet gelijk) dan:
                    - beide kaarten terug draaien
                    - geven de beurt over aan de andere speler
                    - reset de variabele cards_clicked

         - Als we het einde van de ronde hebben bereikt (alle kaarten zijn
           al gedraaid) dan:
            - De ronde beëindigen.
                > scores moeten bijgewerkt worden op het scherm
                > alle kaarten terugdraaien
                > de tekst op de knop terugzetten naar "Start"
                > Klikmogelijkheid van alle kaarten uitzetten
                > Tonen de bijgewerkte totaal score op het scherm

     */
    if(cards_clicked[0] == NO_CARD_CLICKED || cards_clicked[1] == NO_CARD_CLICKED) {
        flipCard(cardNumber);
        if(cards_clicked[0] == NO_CARD_CLICKED)
            cards_clicked[0] = cardNumber;
        else
            cards_clicked[1] = cardNumber;
    }
    /*
    if (cardNumber[1]== cardNumber[1])
    */   
}

function maxCardsClickedReached()
{
    if(cards_clicked[0] != NO_CARD_CLICKED || cards_clicked[1] != NO_CARD_CLICKED)
        return NO;

    return YES;
}

/*
    endRound()
    ----------
    Einde van een ronde. Dus afhandelen wanneer een ronde ten einde is

    TYPE:   Hulpfunctie
 */
function endRound()
{
    flipCard(alle) 
      //@TODO: Implementeren van een einde van een ronde

}

/*
    shuffleCards()
    --------------
    Shuffle de kaarten

    TYPE:   Hulpfunctie
 */
function shuffleCards()
{
    var i = 0;
    var j = 0;
    var temp = null;

    for (i = cards.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = cards[i];
        cards[i] = cards[j];
        cards[j] = temp;
    }
}

/*
    determineStartingPlayer()
    -------------------------
    Bepaal random (willekeurig) welke van de 2 spelers mag beginnen

    @return int Speler nummer (0 of 1)

    TYPE:   Hulpfunctie
 */
function determineStartingPlayer()
{
    return Math.round(Math.random());
}

/*
    showCurrentPlayer()
    -------------------
    Toont op het scherm welke speler aan de beurt is

    TYPE:   Hulpfunctie
 */
function showCurrentPlayer()
{
    if(huidige_speler === SPELER1) {
        naam_speler_1.style.color = "red";
        naam_speler_2.style.color = "black";
    } else if(huidige_speler === SPELER2) {
        naam_speler_1.style.color = "black";
        naam_speler_2.style.color = "red";
    } else {
        naam_speler_1.style.color = "black";
        naam_speler_2.style.color = "black";
    }
}

/*
    flipCard(card_index)
    --------------------
    Draait kaart om van gegeven object carddiv. Als de kaart al is omgedraaid dan
    draaien we de kaart weer terug. Dit doen we met een CSS-class, genaamd flipped.
	Deze zorgt voor het draai effect. Door de tweede div te vullen met de juiste img-tag
	wordt de bijbehorende afbeelding zichtbaar.

	We vertellen
*/
function flipCard(card_index)
{
    if(speelveld[card_index].classList.contains('flipped')) {	// Bevat de kaart al de css class flipped?
        /*
            Ja!
            Dan gaan de kaart weer terugdraaien door de css class flipped weer weg te halen
        */
        speelveld[card_index].classList.remove('flipped');			// Hier halen we de css class flipped weg
        speelveld[card_index].children[CARD_FRONT].innerHTML = "";	// We gaan de img-tag ook weer verwijderen
    } else {
        /*
            Nee!
            Dan draaien we de kaart om zodat de afbeelding zichtbaar wordt.
            Dit doen we door de css class flipped toe te voegen aan de kaart en de tweede div
            in de kaart te vullen met de img-tag van de echte afbeelding
        */
        speelveld[card_index].children[CARD_FRONT].innerHTML = getCardImageTag(card_index);	// Toon de afbeelding
        speelveld[card_index].classList.add('flipped');										// Voeg de css class flipped toe.
    }
}

