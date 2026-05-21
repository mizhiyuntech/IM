package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"im-backend/models"
	"im-backend/ws"
)

type ConversationHandler struct {
	DB  *gorm.DB
	Hub *ws.Hub
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

type CreateConversationRequest struct {
	Type     string `json:"type"`
	MemberID string `json:"member_id"`
}

func (h *ConversationHandler) CreateOrGetConversation(c *gin.Context) {
	userID := c.GetString("userID")

	var req CreateConversationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	if req.Type == "private" && req.MemberID != "" {
		var existingMembers []models.ConversationMember
		h.DB.Where("user_id = ?", userID).Find(&existingMembers)

		for _, m := range existingMembers {
			var otherMember models.ConversationMember
			if err := h.DB.Where("conversation_id = ? AND user_id = ?", m.ConversationID, req.MemberID).First(&otherMember).Error; err == nil {
				var conv models.Conversation
				if err := h.DB.First(&conv, "id = ?", m.ConversationID).Error; err == nil && conv.Type == "private" {
					c.JSON(http.StatusOK, conv)
					return
				}
			}
		}

		var otherUser models.User
		if h.DB.First(&otherUser, "id = ?", req.MemberID).Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "对方用户不存在"})
			return
		}

		var currentUser models.User
		h.DB.First(&currentUser, "id = ?", userID)

		conv := models.Conversation{
			ID:          generateID("conv"),
			Type:        "private",
			Name:        otherUser.Name,
			Avatar:      otherUser.Avatar,
			LastMessage: "",
			UpdatedAt:   time.Now(),
		}
		if err := h.DB.Create(&conv).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "创建会话失败"})
			return
		}

		h.DB.Create(&models.ConversationMember{
			ConversationID: conv.ID,
			UserID:         userID,
		})
		h.DB.Create(&models.ConversationMember{
			ConversationID: conv.ID,
			UserID:         req.MemberID,
		})

		if h.Hub != nil {
			h.Hub.SendToUser(req.MemberID, ws.WSMessage{
				Type: "new_conversation",
				Data: map[string]string{
					"conversation_id": conv.ID,
					"name":            currentUser.Name,
				},
			})
		}

		c.JSON(http.StatusCreated, conv)
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "不支持的会话类型"})
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
