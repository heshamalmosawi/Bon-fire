package utils

import (
	"bonfire/pkgs/storage"
	"database/sql"
	"fmt"
	"strings"
)

// Create inserts a new record into the specified table.
//
// tableName: the name of the table.
//
// columns: a slice of column names to insert values into.
//
// values: a slice of values corresponding to the columns.
//
// Returns the result of the execution or an error if the insertion fails.
func Create(tableName string, columns []string, values []interface{}) (sql.Result, error) {
	placeholders := make([]string, len(values))
	for i := range placeholders {
		placeholders[i] = "?"
	}
	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", tableName, join(columns, ","), join(placeholders, ","))
	return storage.DB.Exec(query, values...)
}

// Read retrieves records from the specified table based on the given condition.
//
// tableName: the name of the table.
//
// columns: a slice of column names to select.
//
// condition: the WHERE clause for filtering results.
//
// args: optional arguments for the condition placeholders.
//
// Returns the rows resulting from the query or an error if the query fails.
func Read(tableName string, columns []string, condition string, args ...interface{}) (*sql.Rows, error) {
	// Construct the column list
	columnList := "*"
	if len(columns) > 0 {
		columnList = strings.Join(columns, ", ")
	}

	// Construct the base query
	query := fmt.Sprintf("SELECT %s FROM %s", columnList, tableName)

	// Add the WHERE clause if condition is provided
	if condition != "" {
		query = fmt.Sprintf("%s WHERE %s", query, condition)
	}
	return storage.DB.Query(query, args...)
}

// Update modifies existing records in the specified table based on the given condition.
//
// tableName: the name of the table.
//
// updates: a map where keys are column names and values are the new values for those columns.
//
// condition: the WHERE clause for selecting the records to update.
//
// args: optional arguments for the condition placeholders.
//
// Returns the result of the execution or an error if the update fails.
func Update(tableName string, updates map[string]interface{}, condition string, args ...interface{}) (sql.Result, error) {
	setClauses := make([]string, len(updates))
	updateValues := make([]interface{}, len(updates))
	i := 0
	for col, val := range updates {
		setClauses[i] = fmt.Sprintf("%s = ?", col)
		updateValues[i] = val
		i++
	}
	query := fmt.Sprintf("UPDATE %s SET %s WHERE %s", tableName, join(setClauses, ","), condition)
	return storage.DB.Exec(query, append(updateValues, args...)...)
}

// Delete removes records from the specified table based on the given condition.
//
// tableName: the name of the table.
//
// condition: the WHERE clause for selecting the records to delete.
//
// args: optional arguments for the condition placeholders.
//
// Returns the result of the execution or an error if the deletion fails.
func Delete(tableName string, condition string, args ...interface{}) (sql.Result, error) {
	query := fmt.Sprintf("DELETE FROM %s WHERE %s", tableName, condition)
	return storage.DB.Exec(query, args...)
}
