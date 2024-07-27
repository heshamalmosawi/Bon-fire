package main

import (
	"bonfire/pkgs/storage"
	"fmt"
)

func main() {
	fmt.Println("let's go live!")
	storage.InitDB()
}
