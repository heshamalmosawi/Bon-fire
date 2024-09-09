package models

import (
	"bonfire/pkgs/storage"
	"bonfire/pkgs/utils"
	"database/sql"
	"errors"

	"github.com/gofrs/uuid"
)

type GroupEventAttend struct {
	AttendID      uuid.UUID `json:"attendance_id"`
	EventID      uuid.UUID `json:"event_id"`
	AttendeeID    uuid.UUID `json:"attendee_id"`
	ResponseType   string    `json:"response_Type"`
}

func (ga *GroupEventAttend) Save() error {
	if ga.AttendID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		ga.AttendID = uid
	}

	columns := []string{"attendance_id","event_id","attendee_id","response_Type"}
	values := []interface{}{ga.AttendID,ga.EventID,ga.AttendeeID,ga.ResponseType}

	_, err := utils.Create("group_event_attendance", columns, values)
	return err
}

func (ga *GroupEventAttend) Del() error {
	condition := "attendance_id = ?"
	_, err := utils.Delete("group_event_attendance", condition, ga.AttendID)
	return err
}

func (ga *GroupEventAttend) Update() error {
	updates := map[string]interface{}{
		"attendance_id" : ga.AttendID,
		"event_id" : ga.EventID,
		"attendee_id" : ga.AttendeeID,
		"response_Type" : ga.ResponseType,
	}
	condition := "attendance_id = ?"
	_, err := utils.Update("group_event_attendance", updates, condition, ga.AttendID)
	return err
}

func GetAttendeeByGroup(attendeeID string) (*GroupEventAttend, error) {
	columns := []string{"attendance_id","event_id","attendee_id","response_Type"}
	condition := "attendee_id = ?"
	rows, err := utils.Read("group_event_attendance", columns, condition, attendeeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attendee GroupEventAttend
	if rows.Next() {
		err := rows.Scan(&attendee.AttendID, &attendee.EventID, &attendee.AttendeeID, &attendee.ResponseType)
		if err != nil {
			return nil, err
		}
	}

	return &attendee, nil
}

func GetAttendeeCountByEvent(eventID uuid.UUID) (int, error) {
	query := "SELECT COUNT(*) FROM group_event_attendance WHERE event_id = ? AND response_Type = 'going'"
	row := storage.DB.QueryRow(query, eventID)
	var count int
	if err := row.Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

// GetUserResponseToEvent checks a user's response to a specific event.
func GetUserResponseToEvent(eventID uuid.UUID, userID uuid.UUID) (string, bool, error) {
	query := "SELECT response_Type FROM group_event_attendance WHERE event_id = ? AND attendee_id = ?"
	row := storage.DB.QueryRow(query, eventID, userID)
	var responseType string
	if err := row.Scan(&responseType); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", false, nil // No response from user
		}
		return "", false, err
	}
	return responseType, true, nil // User has responded
}