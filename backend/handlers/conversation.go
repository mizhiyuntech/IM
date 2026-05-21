package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"im-backend/models"
)

type ConversationHandler struct {
	DB *gorm.DB
}

type ConversationWithUnread struct {
	models.Conversation
	UnreadCount int `json:"unread_count"`
}

func (h *ConversationHandler) GetConversations(c *gin.Context) {
	userID := c.GetString("userID")

	var members []models.ConversationMember
	h.DB.Where("user_id = ?", userID).Find(&members)

	conversationIDs := make([]string, len(members))
	unreadMap := make(map[string]int)
	for i, m := range members {
		conversationIDs[i] = m.ConversationID
		unreadMap[m.ConversationID] = m.UnreadCount
	}

	if len(conversationIDs) == 0 {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	var conversations []models.Conversation
	h.DB.Where("id IN ?", conversationIDs).Order("updated_at DESC").Find(&conversations)

	result := make([]ConversationWithUnread, len(conversations))
	for i, conv := range conversations {
		result[i] = ConversationWithUnread{
			Conversation: conv,
			UnreadCount:  unreadMap[conv.ID],
		}
	}

	c.JSON(http.StatusOK, result)
}

func (h *ConversationHandler) MarkAsRead(c *gin.Context) {
	userID := c.GetString("userID")
	conversationID := c.Param("id")

	h.DB.Model(&models.ConversationMember{}).
		Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Update("unread_count", 0)

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func (h *ConversationHandler) DeleteConversation(c *gin.Context) {
	userID := c.GetString("userID")
	conversationID := c.Param("id")

	h.DB.Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Delete(&models.ConversationMember{})

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}
