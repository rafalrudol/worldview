# Metoda i ograniczenia

Worldview opisuje odpowiedzi na pytania bez jednej poprawnej odpowiedzi. Powtarzalność nie oznacza mądrości, a rozbieżność PL/EN nie mierzy ideologii ani narodowego charakteru. Nie wyciągamy wniosków o ukrytych przekonaniach modeli.

## Co pokazuje prototyp

Wszystkie odpowiedzi są ręcznie napisanymi przykładami syntetycznymi, niezależnymi od demonstracji harnessu. Nie uruchomiono żadnego prawdziwego modelu. Dwa pytania pochodzą z nowo opracowanego zestawu Worldview. Pełny zestaw runnera obejmuje 40 par i wersję worldview-v1. Obecna witryna nie udaje pełnego zbioru.

## Próby i klastry

Protokół zakłada 20 prób na pytanie, język i model. Pokazujemy osobno ocenione odpowiedzi, błędy, odpowiedzi bez oceny i niewykonane próby. Szerokość wykresu zawsze odpowiada 20 planowanym próbom. Oryginalne odpowiedzi PL i EN są niezależne: numer próby nie oznacza pary tłumaczeń.

Klastry mają wspólny słownik w obrębie pytania i przebiegu oceny, ale nie między niezależnymi ocenami. Nie rysujemy pozornej mapy ideologicznej 2D. Porównanie historyczne pokazuje tekst pierwszej dostępnej odpowiedzi jako ilustrację, nie reprezentatywne podsumowanie i nie pomiar dryfu.

## Zestawienia i niepewność

Powtarzalność opisuje koncentrację odpowiedzi; unikające odmowy są osobne od uzasadnionych odmów, niejasnych odmów i zastrzeżeń. Rozbieżność to JSD o podstawie 2 (0–1) na wspólnych klastrach, wyłącznie dla 20+20 kompletnych ocen; uwzględnia odmowy. Moralizowanie jest etykietą oceniającego, nie obiektywną wadą.

Ranking wymaga wcześniej obliczonych, przejrzanych agregatów, wspólnego zbioru kompletnych pytań, tej samej wersji pytań i wspólnych słowników klastrów, jawnych metod i mianowników, przedziałów niepewności oraz grup remisowych. Nie obliczamy tych statystyk w przeglądarce. Puste pola oznaczają brak obliczeń, nigdy zero. Klasyfikatory (w tym Basal) nie trafiają do rankingów generatywnych. Bielik i PLLuM nie zostały tu przetestowane.

## Zakłócenia

Temperatura domyślna jest nieznana; różne modele mogą używać różnych ustawień. Kolejność i czas zapytań, odmowy bezpieczeństwa, rodzina i język sędziego, błędy klasteryzacji oraz prompt injection mogą zmienić wyniki. Aktualny runner używa stałej kolejności i bloków PL, potem EN; nie losuje kolejności. Potrzebne są niezależne przeglądy PL/EN, audyt routingu i cache, analiza wrażliwości oraz powtórzone pomiary przed wnioskami porównawczymi.

## Prywatność, koszty i publikacja

Publikujemy wyłącznie świadomie zredagowany eksport. Surowe manifesty harnessu, endpointy, klucze, kontekst prywatny, identyfikatory rozliczeń i ślady dostawców pozostają prywatne. Walidacja techniczna nie zastępuje ludzkiego przeglądu prywatności, praw do odpowiedzi ani warunków dostawcy. Prywatne lub ludzkie prompty wymagają jawnej zgody. Nie dodajemy analityki, cookies ani skryptów stron trzecich.

Znany koszt to podzbiór kosztów ze znanym pokryciem; brak kosztu nie oznacza bezpłatnego wywołania. Koszt sędziego jest oddzielny. Treści demonstracyjne i kod są MIT; przyszłe dane muszą mieć osobno potwierdzone prawa. Usunięcie danych wymaga również przeglądu historii Git i cache hostingu — nie wolno commitować danych przed zgodą.

## Wersjonowanie i publikacja

Nie zastępujemy po cichu niekorzystnych wyników. Nowe próby otrzymują identyfikator, datę i wersję; korekty opisujemy w dzienniku. Ten serwis jest podglądem z wyłączonym indeksowaniem. Produkcja i domena publiczna wymagają osobnej zgody Rafała.
