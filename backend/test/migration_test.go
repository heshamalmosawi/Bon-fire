package test

import (
	"database/sql"
	"log"
	"os"
	"testing"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

const (
	dbFileName    = "../Bonfire.db"
	migrationsDir = "../pkgs/storage/migrations"
)

func TestMigrations(t *testing.T) {
	// Remove the database file if it exists
	if _, err := os.Stat(dbFileName); err == nil {
		os.Remove(dbFileName)
	}

	// Open a new SQLite conn
	db, err := sql.Open("sqlite3", dbFileName)
	if err != nil {
		log.Fatalf("failed to open sqlite3 database: %v", err)
	}
	defer db.Close()

	// Initialize the migration driver
	driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		log.Fatalf("failed to initialize sqlite3 migration driver: %v", err)
	}

	// Create a new migrate instance
	m, err := migrate.NewWithDatabaseInstance(
		"file://"+migrationsDir,
		"sqlite3", driver,
	)
	if err != nil {
		log.Fatalf("failed to create migrate instance: %v", err)
	}

	// Run the migrations up
	err = m.Up()
	if err != nil && err != migrate.ErrNoChange {
		log.Fatalf("failed to run up migrations: %v", err)
	}

	// Verify the table was created
	if _, err := db.Exec("SELECT * FROM user LIMIT 1"); err != nil {
		t.Fatalf("failed to query user table: %v", err)
	}

	// Cleanup
	err = m.Down()
	if err != nil && err != migrate.ErrNoChange {
		log.Fatalf("failed to run down migrations: %v", err)
	}
}
