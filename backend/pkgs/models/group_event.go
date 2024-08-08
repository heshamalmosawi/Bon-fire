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

	_, err := utils.Create("group", columns, values)
	return err
}

func (u *GroupEvent) Del() error {
	condition := "event_id = ?"
	_, err := utils.Delete("group", condition, u.EventID)
	return err
}

func (u *GroupEvent) Update() error {
	updates := map[string]interface{}{
		"event_title":      u.EventTitle,
		"event_description": u.EventDescrip,
		"event_timestamp":   u.EventTime,
	}
	condition := "event_id = ?"
	_, err := utils.Update("group", updates, condition, u.EventID)
	return err
}

func GetEventByGroup(groupID string) (*GroupEvent, error) {
	columns := []string{"event_id", "group_id", "creator_id", "event_title", "event_description", "event_timestamp"}
	condition := "group_id = ?"
	rows, err := utils.Read("group", columns, condition, groupID)
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
