package models

import (
	"bonfire/pkgs/utils"
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
