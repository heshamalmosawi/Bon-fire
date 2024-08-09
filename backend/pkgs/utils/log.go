package utils

import (
	"log"
	"os"
)

// LogLevel defines the logging levels
type LogLevel int

const (
	INFO LogLevel = iota
	ERROR
	DEBUG
)

// Logger is the main struct for logging
type Logger struct {
	infoColor  string
	errorColor string
	debugColor string
	resetColor string
}

// NewLogger creates a new Logger instance
func NewLogger() *Logger {
	return &Logger{
		infoColor:  "\033[1;34m", // Bold Blue for info
		errorColor: "\033[1;31m", // Bold Red for error
		debugColor: "\033[1;33m", // Bold Yellow for debug
		resetColor: "\033[0m",    // Reset to default color
	}
}

// logMessage is the common logging function
func (l *Logger) logMessage(level LogLevel, message string) {
	var logPrefix string

	switch level {
	case INFO:
		logPrefix = l.infoColor + "INFO"
	case ERROR:
		logPrefix = l.errorColor + "ERROR"
	case DEBUG:
		logPrefix = l.debugColor + "DEBUG"
	default:
		logPrefix = "UNKNOWN"
	}

	log.SetOutput(os.Stdout)
	log.Printf("%s %s%s\n", logPrefix, message, l.resetColor)
}

// Info logs an info message
func (l *Logger) Info(message string) {
	l.logMessage(INFO, message)
}

// Error logs an error message
func (l *Logger) Error(message string) {
	l.logMessage(ERROR, message)
}

// Debug logs a debug message
func (l *Logger) Debug(message string) {
	l.logMessage(DEBUG, message)
}

// BonfireLogger is the global logger instance
var BonfireLogger = NewLogger()
