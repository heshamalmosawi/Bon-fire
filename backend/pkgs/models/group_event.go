package models

import (
	"bonfire/pkgs/utils"
	"time"

	"github.com/gofrs/uuid"
)

type GroupEvent struct {
	EventID      uuid.UUID `json:"event_id"`
	GroupID      uuid.UUID `json:"group_id"`
	CreatorID    uuid.UUID `json:"creator_id"`
	EventTitle   string    `json:"event_title"`
	EventDescrip string    `json:"event_description"`
	EventTime    time.Time `json:"event_timestamp"`

	IsGoing    bool `json:"is_going"`    // if the user is going or not
	DidRespond bool `json:"did_respond"` // to see if we show the buttons or not
	Attendees  int  `json:"attendees"`   //display total number of attendees
}

func (u *GroupEvent) Save() error {
	if u.EventID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		u.EventID = uid
	}

	columns := []string{"event_id", "group_id", "creator_id", "event_title", "event_description", "event_timestamp"}
	values := []interface{}{u.EventID, u.GroupID, u.CreatorID, u.EventTitle, u.EventDescrip, u.EventTime}

	_, err := utils.Create("group_event", columns, values)
	return err
}

func (u *GroupEvent) Del() error {
	condition := "event_id = ?"
	_, err := utils.Delete("group_event", condition, u.EventID)
	return err
}

func (u *GroupEvent) Update() error {
	updates := map[string]interface{}{
		"event_title":       u.EventTitle,
		"event_description": u.EventDescrip,
		"event_timestamp":   u.EventTime,
	}
	condition := "event_id = ?"
	_, err := utils.Update("group_event", updates, condition, u.EventID)
	return err
}

func GetEventByGroup(groupID string) (*GroupEvent, error) {
	columns := []string{"event_id", "group_id", "creator_id", "event_title", "event_description", "event_timestamp"}
	condition := "group_id = ?"
	rows, err := utils.Read("group_event", columns, condition, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var event GroupEvent
	if rows.Next() {
		err := rows.Scan(&event.EventID, &event.GroupID, &event.CreatorID, &event.EventTitle, &event.EventDescrip, &event.EventTime)
		if err != nil {
			return nil, err
		}
	}

	return &event, nil
}

func GetEventsByGroup(groupID string, userID uuid.UUID) ([]GroupEvent, error) {
	var events []GroupEvent
	columns := []string{"event_id", "group_id", "creator_id", "event_title", "event_description", "event_timestamp"}
	condition := "group_id = ?"
	rows, err := utils.Read("group_event", columns, condition, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var event GroupEvent
		if err := rows.Scan(&event.EventID, &event.GroupID, &event.CreatorID, &event.EventTitle, &event.EventDescrip, &event.EventTime); err != nil {
			return nil, err
		}
		event.Attendees, err = GetAttendeeCountByEvent(event.EventID)
		if err != nil {
			return nil, err
		}

		response, didRespond, err := GetUserResponseToEvent(event.EventID, userID)
		if err != nil {
			return nil, err
		}

		event.DidRespond = didRespond
		event.IsGoing = (response == "going")
		events = append(events, event)
	}

	return events, nil
}
