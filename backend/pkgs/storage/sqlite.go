package storage

import (
	"database/sql"
	"os"

	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

const (
	dbFileName    = "../Bonfire.db"
	migrationsDir = "../pkgs/storage/migrations"
)

var DB *sql.DB

/*
Create the DB file (if needed) and run all migrations
*/
func Initialize() {
	if _, err := os.Stat(dbFileName); err != nil {
		os.Remove(dbFileName)
	}
}
