package storage

import (
	"database/sql"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

const (
	// Path to the SQLite database file
	dbFileName     = "Bonfire.db"
	testDbFileName = "test.db"
	// Directory containing migration files
	migrationsDir = "pkgs/storage/migrations"
	// Directory reference for testing
	testMigrationsDir = "../pkgs/storage/migrations"
)

// DB holds the database connection
var DB *sql.DB

/*
InitDB initializes the database by creating the database file if it does not exist,
setting up the database connection, and running all migrations.

It accepts a parameter `mode` that can be specified as "test" to change the reference to the migration directory.

Steps:
1. Checks if the database file exists, and creates it if necessary.
2. Opens a connection to the SQLite database.
3. Initializes the SQLite migration driver.
4. Creates a new migrate instance for running migrations.
5. Executes all up migrations to bring the database schema to the latest version.

Logs fatal errors and exits the application if any issues are encountered.
*/
func InitDB(mode string) {
	var dbFname string
	var migrations string

	if mode == "test" {
		dbFname = testDbFileName
		migrations = testMigrationsDir
	} else {
		dbFname = dbFileName
		migrations = migrationsDir
	}

	// Check if the database file exists; create it if it does not
	dbExists := true
	if _, err := os.Stat(dbFname); os.IsNotExist(err) {
		dbExists = false
		_, err := os.Create(dbFname)
		if err != nil {
			log.Fatalf("Error creating DB file: %v", err)
		}
		log.Println("Created database file:", dbFname)
	}

	// Open a new SQLite connection
	db, err := sql.Open("sqlite3", dbFname)
	if err != nil {
		log.Fatalf("Error opening DB connection: %v", err)
	}

	// Check the connection
	if err := db.Ping(); err != nil {
		log.Fatalf("DB connection pinging failed: %v", err)
	}

	if !dbExists {
		// Initialize the migration driver
		driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
		if err != nil {
			log.Fatalf("Failed to initialize sqlite3 migration driver: %v", err)
		}

		// Create a new migrate instance with the migration source and database driver
		m, err := migrate.NewWithDatabaseInstance(
			"file://"+migrations,
			"sqlite3", driver,
		)
		if err != nil {
			log.Fatalf("Failed to create migrate instance: %v", err)
		}

		// Run all migrations
		if err = m.Up(); err != nil && err != migrate.ErrNoChange {
			log.Fatalf("Failed to apply migrations: %v", err)
		}
	}
	
	// Assign the database connection to the global variable
	DB = db
}

/*
RedoMigrations deletes the database file and reruns the migrations.

It accepts a parameter `mode` that can be specified as "test" to change the reference to the migration directory.

Steps:
1. Removes the existing database file if it exists.
2. Reinitializes the database and runs the migrations.

Logs fatal errors and exits the application if any issues are encountered.
*/
func RedoMigrations(mode string) {
	var dbFname string

	if mode == "test" {
		dbFname = testDbFileName
	} else {
		dbFname = dbFileName
	}

	// Check if the database file exists; delete it if it does
	if _, err := os.Stat(dbFname); err == nil {
		if err := os.Remove(dbFname); err != nil {
			log.Fatalf("Error deleting DB file: %v", err)
		}
		log.Println("Deleted database file:", dbFname)
	}

	// Reinitialize the database and run the migrations
	InitDB(mode)
}
