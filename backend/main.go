package main

import (
	"bonfire/pkgs/storage"
	"os"
)

func main() {
	if len(os.Args[1:]) > 0 {
		if os.Args[1] == "migrate" {
			storage.RedoMigrations()
		}
	} else {
		storage.InitDB()
	}
}
