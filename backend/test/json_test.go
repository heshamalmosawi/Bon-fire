package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"bonfire/pkgs/utils"
)

type TestStruct struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}

func encodeHandler(w http.ResponseWriter, r *http.Request) {
	testData := TestStruct{Name: "John Doe", Age: 30}
	err := utils.EncodeJSON(w, testData)
	if err != nil {
		http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
	}
}

func decodeHandler(w http.ResponseWriter, r *http.Request) {
	var decodedData TestStruct
	err := utils.DecodeJSON(r, &decodedData)
	if err != nil {
		http.Error(w, "Failed to decode JSON", http.StatusBadRequest)
		return
	}
	err = utils.EncodeJSON(w, decodedData)
	if err != nil {
		http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
	}
}

func TestEncodeHandler(t *testing.T) {
	req, err := http.NewRequest("GET", "/encode", nil)
	if err != nil {
		t.Fatalf("Could not create request: %v", err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(encodeHandler)
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", rr.Code, http.StatusOK)
	}

	expected := TestStruct{Name: "John Doe", Age: 30}
	var response TestStruct
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("Could not unmarshal response: %v", err)
	}

	if response != expected {
		t.Errorf("handler returned unexpected body: got %v want %v", response, expected)
	}
}

func TestDecodeHandler(t *testing.T) {
	testData := TestStruct{Name: "John Doe", Age: 30}
	testDataJSON, _ := json.Marshal(testData)
	req, err := http.NewRequest("POST", "/decode", bytes.NewBuffer(testDataJSON))
	if err != nil {
		t.Fatalf("Could not create request: %v", err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(decodeHandler)
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", rr.Code, http.StatusOK)
	}

	var response TestStruct
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("Could not unmarshal response: %v", err)
	}

	if response != testData {
		t.Errorf("handler returned unexpected body: got %v want %v", response, testData)
	}
}

func TestDecodeHandler_InvalidJSON(t *testing.T) {
	req, err := http.NewRequest("POST", "/decode", bytes.NewBufferString("invalid JSON"))
	if err != nil {
		t.Fatalf("Could not create request: %v", err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(decodeHandler)
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("handler returned wrong status code: got %v want %v", rr.Code, http.StatusBadRequest)
	}
}
