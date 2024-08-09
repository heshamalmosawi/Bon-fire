package models

import (
	"bonfire/pkgs/utils"
	"time"

	"github.com/gofrs/uuid"
)

type GroupInteractions struct {
	InteractionID      uuid.UUID `json:"interaction_ID"`
	GroupID    uuid.UUID `json:"group_id"`
	UserID   uuid.UUID    `json:"user_id"`
	InteractionType bool    `json:"interaction_Type"`
	Status string `json:"status"`
	InteractionTime time.Time `json:"interaction_Time"`
}

func (gi *GroupInteractions) Save() error {
	if gi.InteractionID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		gi.InteractionID = uid
	}

	columns := []string{"interaction_ID","group_id","user_id","interaction_Type","status","interaction_Time"}
	values := []interface{}{gi.InteractionID,gi.GroupID,gi.UserID,gi.InteractionType,gi.Status,gi.InteractionTime}

	_, err := utils.Create("group_interactions", columns, values)
	return err
}

func (gi *GroupInteractions) Del() error {
	condition := "interaction_ID = ?"
	_, err := utils.Delete("group_interactions", condition, gi.InteractionID)
	return err
}

func (gi *GroupInteractions) Update() error {
	updates := map[string]interface{}{
		"interaction_ID" : gi.InteractionID,
		"group_id" : gi.GroupID,
		"user_id" : gi.UserID,
		"interaction_Type" : gi.InteractionType,
		"status" : gi.Status,
		"interaction_Time" : gi.InteractionTime,
	}
	condition := "interaction_ID = ?"
	_, err := utils.Update("group_interactions", updates, condition, gi.InteractionID)
	return err
}

func GetInteractionByGroup(interactionID string) (*GroupInteractions, error) {
	columns := []string{"interaction_ID","group_id","user_id","interaction_Type","status","interaction_Time"}
	condition := " interaction_ID = ?"
	rows, err := utils.Read("group_interactions", columns, condition, interactionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var interaction GroupInteractions
	if rows.Next() {
		err := rows.Scan(&interaction.InteractionID, &interaction.GroupID, &interaction.UserID, &interaction.InteractionType, &interaction.Status, &interaction.InteractionTime)
		if err != nil {
			return nil, err
		}
	}

	return &interaction, nil
}
