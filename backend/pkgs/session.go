package pkgs

import (
	"bonfire/pkgs/models"
	"errors"
	"sync"
	"time"

	"github.com/gofrs/uuid"
)

// Session represents a user session
type Session struct {
	ID        string
	User      *models.UserModel
	ExpiresAt time.Time
}

// SessionManager manages user sessions
type SessionManager struct {
	sessions sync.Map
	ttl      time.Duration
}

// NewSessionManager creates a new SessionManager with a specified session TTL
func NewSessionManager(ttl time.Duration) *SessionManager {
	return &SessionManager{
		ttl: ttl,
	}
}

// CreateSession creates a new session for a given user
func (sm *SessionManager) CreateSession(user *models.UserModel) (*Session, error) {
	sessionID, err := uuid.NewV4()
	if err != nil {
		return nil, err
	}

	session := &Session{
		ID:        sessionID.String(),
		User:      user,
		ExpiresAt: time.Now().Add(sm.ttl),
	}

	sm.sessions.Store(sessionID.String(), session)
	return session, nil
}

// GetSession retrieves a session by its ID
func (sm *SessionManager) GetSession(sessionID string) (*Session, error) {
	value, exists := sm.sessions.Load(sessionID)
	if !exists {
		return nil, errors.New("session not found")
	}

	session := value.(*Session)

	// Check if session has expired
	if session.ExpiresAt.Before(time.Now()) {
		sm.sessions.Delete(sessionID)
		return nil, errors.New("session expired")
	}

	return session, nil
}

// DeleteSession deletes a session by its ID
func (sm *SessionManager) DeleteSession(sessionID string) {
	sm.sessions.Delete(sessionID)
}

// CleanupExpiredSessions removes expired sessions from the session manager
func (sm *SessionManager) CleanupExpiredSessions() {
	now := time.Now()
	sm.sessions.Range(func(key, value interface{}) bool {
		session := value.(*Session)
		if session.ExpiresAt.Before(now) {
			sm.sessions.Delete(key)
		}
		return true
	})
}

var MainSessionManager = NewSessionManager(time.Hour * 24)
