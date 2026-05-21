package models

import "time"

type User struct {
	ID        string    `json:"id" gorm:"primaryKey;size:64"`
	Name      string    `json:"name" gorm:"size:64;not null;default:''"`
	Avatar    string    `json:"avatar" gorm:"size:512;not null;default:''"`
	Phone     string    `json:"phone" gorm:"size:20;uniqueIndex;not null;default:''"`
	Password  string    `json:"-" gorm:"size:256;not null;default:''"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (User) TableName() string { return "users" }

type Group struct {
	ID        string    `json:"id" gorm:"primaryKey;size:64"`
	Name      string    `json:"name" gorm:"size:64;not null;default:''"`
	Avatar    string    `json:"avatar" gorm:"size:512;not null;default:''"`
	OwnerID   string    `json:"owner_id" gorm:"size:64;not null;default:''"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Group) TableName() string { return "groups" }

type GroupMember struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	GroupID   string    `json:"group_id" gorm:"size:64;not null;uniqueIndex:uk_group_user"`
	UserID    string    `json:"user_id" gorm:"size:64;not null;uniqueIndex:uk_group_user"`
	CreatedAt time.Time `json:"created_at"`
}

func (GroupMember) TableName() string { return "group_members" }

type Conversation struct {
	ID           string    `json:"id" gorm:"primaryKey;size:64"`
	Type         string    `json:"type" gorm:"size:16;not null;default:'private'"`
	Name         string    `json:"name" gorm:"size:64;not null;default:''"`
	Avatar       string    `json:"avatar" gorm:"size:512;not null;default:''"`
	LastMessage  string    `json:"last_message" gorm:"type:text"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (Conversation) TableName() string { return "conversations" }

type ConversationMember struct {
	ID             uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	ConversationID string    `json:"conversation_id" gorm:"size:64;not null;uniqueIndex:uk_conversation_user"`
	UserID         string    `json:"user_id" gorm:"size:64;not null;uniqueIndex:uk_conversation_user"`
	UnreadCount    int       `json:"unread_count" gorm:"not null;default:0"`
	CreatedAt      time.Time `json:"created_at"`
}

func (ConversationMember) TableName() string { return "conversation_members" }

type Message struct {
	ID             string    `json:"id" gorm:"primaryKey;size:64"`
	ConversationID string    `json:"conversation_id" gorm:"size:64;not null;index"`
	SenderID       string    `json:"sender_id" gorm:"size:64;not null"`
	Content        string    `json:"content" gorm:"type:text;not null"`
	Type           string    `json:"type" gorm:"size:16;not null;default:'text'"`
	CreatedAt      time.Time `json:"created_at"`
}

func (Message) TableName() string { return "messages" }

type Contact struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID    string    `json:"user_id" gorm:"size:64;not null;uniqueIndex:uk_user_contact"`
	ContactID string    `json:"contact_id" gorm:"size:64;not null;uniqueIndex:uk_user_contact"`
	CreatedAt time.Time `json:"created_at"`
}

func (Contact) TableName() string { return "contacts" }
