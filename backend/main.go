package main

import (
	"os"

	"bonfire/api/server"
	"bonfire/pkgs/storage"
)

func main() {
	if len(os.Args[1:]) > 0 {
		if os.Args[1] == "migrate" {
			storage.RedoMigrations("prod")
		}
	} else {
		storage.InitDB("prod")
		server.Routers()
	}
}
