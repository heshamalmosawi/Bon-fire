package pkgs

import (
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
	"errors"
	"sync"
	"time"

	"github.com/gofrs/uuid"
)

var (
	ExpiredSessionChatChan       = make(chan Session)
	ExpiredSessionSubscriberChan = make(chan Session)
)

// Session represents a user session
type Session struct {
	ID        string
	User      *models.UserModel
	ExpiresAt time.Time
}

// SessionManager manages user sessions in memeory
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

	return value.(*Session), nil
}

// GetSessionByUser retrieves a session by the user model, will return error if no session found
func (sm *SessionManager) GetSessionByUser(user *models.UserModel) (*Session, error) {
	var foundSession *Session
	sm.sessions.Range(func(_, value interface{}) bool {
		session := value.(*Session)
		if session.User.UserID == user.UserID {
			foundSession = session
			return false // Stop iteration
		}
		return true // Continue iteration
	})

	if foundSession == nil {
		return nil, errors.New("session not found")
	}
	return foundSession, nil
}

// DeleteSession deletes a session by its ID
func (sm *SessionManager) DeleteSession(sessionID string) {
	sm.sessions.Delete(sessionID)
}

// CleanupExpiredSessions removes expired sessions from the session manager
func (sm *SessionManager) CleanupExpiredSessions() {
	ticker := time.NewTicker(time.Second * 2)
	defer ticker.Stop()

	for range ticker.C {
		sm.sessions.Range(func(key, value interface{}) bool {
			session := value.(*Session)
			if session.ExpiresAt.Before(time.Now()) {
				sm.sessions.Delete(key)
				select {
				case ExpiredSessionChatChan <- *session:
					utils.BonfireLogger.Info("expired session ID for chat " + session.ID)
				case ExpiredSessionSubscriberChan <- *session:
					utils.BonfireLogger.Info("expired session ID for noti " + session.ID)
				default:
					// Avoid blocking if no one is receiving from the channel
				}
			}
			return true
		})
	}
}

var MainSessionManager = NewSessionManager(time.Hour * 24)
