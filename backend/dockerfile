FROM golang:1.22

WORKDIR /backendapp

# dependencies needed recuired for the project (sqlite3)
RUN apt-get update && apt-get -y install gcc sqlite3 libsqlite3-dev

# Copy go mod and sum files, and download the dependencies
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the Go app, targetting linux and enabling cgo
RUN CGO_ENABLED=1 GOOS=linux go build -o main ./

# Expose the port the app runs on
EXPOSE 8080

CMD ["./main"]