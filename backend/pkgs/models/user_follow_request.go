package models

import (
	"github.com/gofrs/uuid"

	"bonfire/pkgs/utils"
)

type FollowRequestModel struct {
	RequestID     uuid.UUID `json:"request_id"`
	UserID        uuid.UUID `json:"user_id"`
	RequesterID   uuid.UUID `json:"requester_id"`
	RequestStatus string    `json:"request_type"`
}

// CRUD Operations

// Function to create a follow request
func (f *FollowRequestModel) Save() error {
	columns := []string{"request_id", "user_id", "requester_id", "request_status"}
	values := []interface{}{f.RequestID, f.UserID, f.RequesterID, f.RequestStatus}
	_, err := utils.Create("follow_request", columns, values)
	return err
}

// Function to delete a follow request
func (f *FollowRequestModel) Del() error {
	condition := "request_id = ?"
	_, err := utils.Delete("follow_request", condition, f.RequestID)
	return err
}

// Function to update a follow request
func (f *FollowRequestModel) Update() error {
	updates := map[string]interface{}{
		"user_id":        f.UserID,
		"requester_id":   f.RequesterID,
		"request_status": f.RequestStatus,
	}
	condition := "request_id = ?"
	_, err := utils.Update("follow_request", updates, condition, f.RequestID)
	return err
}

// GetRequestsByUserID retrieves follow requests by the user's ID.
func GetRequestsByUserID(userID uuid.UUID) ([]FollowRequestModel, error) {
	columns := []string{"request_id", "user_id", "requester_id", "request_status"}
	condition := "user_id = ?"
	rows, err := utils.Read("follow_request", columns, condition, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []FollowRequestModel
	for rows.Next() {
		var request FollowRequestModel
		err := rows.Scan(&request.RequestID, &request.UserID, &request.RequesterID, &request.RequestStatus)
		if err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}

	return requests, nil
}

// GetRequestByRequesterID retrieves follow requests by the requester's ID.
func GetRequestByRequesterID(requesterID uuid.UUID) ([]FollowRequestModel, error) {
	columns := []string{"request_id", "user_id", "requester_id", "request_status"}
	condition := "requester_id = ?"
	rows, err := utils.Read("follow_request", columns, condition, requesterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []FollowRequestModel
	for rows.Next() {
		var request FollowRequestModel
		err := rows.Scan(&request.RequestID, &request.UserID, &request.RequesterID, &request.RequestStatus)
		if err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}

	return requests, nil
}

// GetRequestByRequestID retrieves a follow request by its ID.
func GetRequestByRequestID(requestID uuid.UUID) (*FollowRequestModel, error) {
	columns := []string{"request_id", "user_id", "requester_id", "request_status"}
	condition := "request_id = ?"
	rows, err := utils.Read("follow_request", columns, condition, requestID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var request FollowRequestModel
	if rows.Next() {
		err := rows.Scan(&request.RequestID, &request.UserID, &request.RequesterID, &request.RequestStatus)
		if err != nil {
			return nil, err
		}
	}

	return &request, nil
}

// GetPendingRequest retrieves a follow request by the user's ID and the requester's ID.
func GetPendingRequest(userID uuid.UUID, requesterID uuid.UUID) (*FollowRequestModel, error) {
	columns := []string{"request_id", "user_id", "requester_id", "request_status"}
	condition := "user_id = ? AND requester_id = ? AND request_status = 'pending'"
	rows, err := utils.Read("follow_request", columns, condition, userID, requesterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var request FollowRequestModel
	if rows.Next() {
		err := rows.Scan(&request.RequestID, &request.UserID, &request.RequesterID, &request.RequestStatus)
		if err != nil {
			return nil, err
		}
	}
	return &request, nil
}
