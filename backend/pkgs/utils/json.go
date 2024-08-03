package utils

import (
	"encoding/json"
	"errors"
	"net/http"
)

// EncodeJSON encodes the given interface as JSON and writes it to the provided http.ResponseWriter.
// It returns an error if encoding fails.
func EncodeJSON(w http.ResponseWriter, v interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(v); err != nil {
		http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
		return err
	}
	return nil
}

// DecodeJSON decodes the JSON from the http.Request body into the provided interface.
// It returns an error if decoding fails or if the request body is empty.
func DecodeJSON(r *http.Request, v interface{}) error {
	if r.Body == nil {
		return errors.New("request body is empty")
	}
	defer r.Body.Close()
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(v); err != nil {
		return err
	}
	return nil
}
