# docker_zadanie_1 Miłosz Piechota IO 6.7

# [Link do repozytorium DockerHub](https://hub.docker.com/repository/docker/miloszpiechota/myserver/general)


# I. Część obowiązkowa

## Backend (Node.js z Express)

### Utworzenie serwera "server.js"
Kiedy serwer się uruchamia, zapisuje informacje o starcie do pliku server.log.

```
// Zapisywanie informacji na temat uruchomienia serwera w pliku server.log
const startLog = `Server started at ${new Date().toISOString()} by ${AUTHOR_NAME} on port ${port}\n`;
fs.appendFileSync('server.log', startLog);
```

Kiedy żądanie /api/client-info zostaje otrzymane, pobierany jest adres IP klienta. Gdy adres IP to ::1, co oznacza lokalny adres IP, zostaje użyty standardowy adres 127.0.0.1. Następnie wywoływana jest funkcja getTimezone, która wysyła żądanie, przekazując adres IP klienta. Następnie zwracana jest informacja JSON, w tym strefa czasowa, w jakiej znajduje się podany adres IP. Strefa czasowa jest sformatowana za pomocą biblioteki "moment-timezone". 

```
// Pobieranie strefy czasowej na podstawie adresu IP
const getTimezone = async (ip) => {
    try {
        const response = await axios.get(`https://ipinfo.io/${ip}/json`);
        if (response.data && response.data.timezone) {
            return response.data.timezone;
        }
    } catch (error) {
        console.error(`Error retrieving timezone for IP ${ip}: ${error}`);
    }
    return 'UTC';
};
```

```
//definiowanie trasy 
app.get('/api/client-info', async (req, res) => {
    const clientIp = req.ip === '::1' ? '127.0.0.1' : req.ip;
    const timezone = await getTimezone(clientIp);
    const clientTime = moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss Z');

    res.json({
        client_ip: clientIp,
        client_time: clientTime
    });
});

```

## Frontend (React) - utworzenie komponentu "ClientInfo.js"

Ten plik  ma za zadanie pobrać informacje o kliencie z serwera i wyświetlić je w interfejsie użytkownika.

Wywołanie funkcji fetchClientInfo,  wykonuje żądanie GET do ścieżki /api/client-info na serwerze.

```
useEffect(() => {
        const fetchClientInfo = async () => {
            try {
                const response = await axios.get('/api/client-info');
                setClientInfo(response.data);
            } catch (error) {
                console.error('Error fetching client info:', error);
            }
        };

        fetchClientInfo();
    }, []);
```
## Stworzenie pliku Dockerfile w katalogu głównym projektu

Etap 1: Budowanie aplikacji klienta opiera się na: użyciu pełnego obrazu Node.js (node:16) do budowania aplikacji,
ustawieniu autora pliku Dockerfile za pomocą etykiety (LABEL), kopiowaniu plików package.json oraz package-lock.json zarówno dla serwera, jak i klienta
oraz instalowane są zależności serwera. Na koniec budowana jest aplikacja klienta.

Etap 2: Budowanie obrazu końcowego. Używam lżejszego obrazu node:16-slim dla produkcyjnego środowiska.
Kopiuję zbudowaną aplikację klienta z pierwszego etapu.Kopiuję zależności serwera oraz kod źródłowy.
Instaluje tylko produkcyjne zależności serwera. Ustawiamy zmienną środowiskową na production. Dodatkowo dodałem instrukcję HEALTHCHECK, aby monitorować zdrowie kontenera.

## Wynik działania aplikacji

1. Budowanie obrazu
  
![image](https://github.com/miloszpiechota/docker_zadanie_1/assets/161620373/032d3c04-5abb-4da9-949e-87d9051dd6de)


2. Uruchomienie kontenera
   
![image](https://github.com/miloszpiechota/docker_zadanie_1/assets/161620373/be3058a1-9a76-414e-86a9-5abe691dd6df)


3. Weryfikacja utworzonego kontenera i jego stanu zdrowia

![image](https://github.com/miloszpiechota/docker_zadanie_1/assets/161620373/fb1fc21e-085a-4528-b139-274b930532fb)


4. Sprawdzenie działania aplikacji

![image](https://github.com/miloszpiechota/docker_zadanie_1/assets/161620373/649a6419-d570-4e25-8a5f-368abb8e7019)

![image](https://github.com/miloszpiechota/docker_zadanie_1/assets/161620373/5d0dc4dc-7f04-4a32-ae7b-3525d8a2a9c4)

![image](https://github.com/miloszpiechota/docker_zadanie_1/assets/161620373/a772a6b8-e0f9-4ff0-8350-fa19377ba4e2)

![image](https://github.com/miloszpiechota/docker_zadanie_1/assets/161620373/d78a8067-ab82-4a86-88da-129085b4b63a)

![image](https://github.com/miloszpiechota/docker_zadanie_1/assets/161620373/2eb2888b-af27-4adf-a68c-6f494b351b71)

polecenie sprawdzające warstwy utworzonego kontenera

![image](https://github.com/miloszpiechota/docker_zadanie_1/assets/161620373/d7091b39-844d-41f3-ab45-bb21b08a2427)


# II. Część dodatkowa - Dockerfile2

## wykorzystanie rozszezronego frontendu

```# syntax=docker/dockerfile:1.2```

## Instalowanie zależności serwera, korzystając z mounta cache, co pozwala na wykorzystanie danych cache w trakcie budowania, co powinno przyspieszyć  proces budowania obrazów.

```
RUN --mount=type=cache,target=/app/client/node_modules npm install
RUN --mount=type=cache,target=/app/client/build npm run build
```

##  Budowanie obrazów dla obu architektur arm64 i amd64 

```
# Zbudowanie obrazu dla architektury linux/amd64
FROM --platform=linux/amd64 node:16-slim AS amd64

# Zbudowanie obrazu dla architektury linux/arm64
FROM --platform=linux/arm64 node:16-slim AS arm64
```

## Wynik działania  programu

To polecenie buduje obraz zgodnie z określonym plikiem Dockerfile, nadaje mu tag i przesyła go do Docker Hub.

```docker buildx build -f Dockerfile2 -t miloszpiechota/myserver:part2 --push .```

![image](https://github.com/miloszpiechota/docker_zadanie_1/assets/161620373/8c7ade54-6d7b-4356-9805-7f64586e700f)


Uzyskanie szczegółowych informacji na temat obrazu znajdującego się w rejestrze Docker.

```docker buildx imagetools inspect miloszpiechota/myserver:part2```

![image](https://github.com/miloszpiechota/docker_zadanie_1/assets/161620373/f32bde7b-dbf7-461f-872d-3e90e81dddaf)

![image](https://github.com/miloszpiechota/docker_zadanie_1/assets/161620373/d52aa8be-318e-427c-b05c-5a69d81d31b1)


   





