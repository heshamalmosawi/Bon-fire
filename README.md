# Bonfire
<p align=center><img src="https://github.com/user-attachments/assets/e701ead0-7182-4036-a2db-285bb98b2d7e" alt="Bonfire Logo" width=400></p>

## Description
Bonfire is a social media desktop web-platform, that allows users to share posts, follow others, and communicate with others using shared-interest groups, and a chat system. The application is built in an MVC-like architecture, where the frontend is built using NextJs and a Go-based backend. Bonfire also uses an SQLite database primarly, with the addition of Supabase which handles image storage and delivery, offering a seamless experience for sharing media-rich content.

## Technologies used
- Go Language
- NextJs
- SQLite3 
- Supabase
- Docker
- Websockets

## Usage
1. Install [Go](https://go.dev/doc/install)
2. Install [SQLite](https://www.sqlite.org/download.html)
3. Install [Docker](https://docs.docker.com/get-docker/)
```bash
sudo snap install docker
```
4. Run using docker-compose
```bash
docker compose up --build
```
To stop the docker container you can also use:
```bash
docker compose down
```
<hr>
Or you can take the long route and navigate to the `backend/` dir and run it using `go mod tidy && go run main.go` and on a seperate terminal navigate to the `frontend/` dir and run it using `npm i && npm run dev`

## Team
- [Hashem Alzaki](https://github.com/SnakeSees)
- [Abdulrahman Idrees](https://github.com/akhaled01)
- [Fatima Abbas](https://github.com/xlvk)
- [Noora Wael](https://github.com/NooraWael)
- [Sayed Hesham Al-Mosawi](https://github.com/heshamalmosawi)
- [Fares Alashkar](https://github.com/Exortix)