package utils

import "golang.org/x/crypto/bcrypt"

// HashPassword hashes the given plaintext password using bcrypt with a cost of 11.
// It returns the hashed password as a string or an error if hashing fails.
//
// Parameters:
// - plaintext: The plaintext password to be hashed.
//
// Returns:
//
// - string: The hashed password.
//
// - error: An error if hashing the password fails.
func HashPassword(plaintext string) (string, error) {
    // Generate a bcrypt hash from the plaintext password with a cost of 11
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(plaintext), 11)
    if err != nil {
        return "", err
    }

    // Convert the hashed password to a string and return it
    return string(hashedPassword), nil
}
