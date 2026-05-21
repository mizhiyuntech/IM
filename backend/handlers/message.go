package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"im-backend/models"
)

type MessageHandler struct {
	DB *gorm.DB
}

type SendMessageRequest struct {
	Content string `json:"content"`
	Type    string `json:"type"`
}

func (h *MessageHandler) GetMessages(c *gin.Context) {
	conversationID := c.Param("id")
	userID := c.GetString("userID")

	var member models.ConversationMember
	if h.DB.Where("conversation_id = ? AND user_id = ?", conversationID, userID).First(&member).Error != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "not a member of this conversation"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "50"))
	offset := (page - 1) * pageSize

	var total int64
	h.DB.Model(&models.Message{}).Where("conversation_id = ?", conversationID).Count(&total)

	var messages []models.Message
	h.DB.Where("conversation_id = ?", conversationID).
		Order("created_at ASC").
		Offset(offset).
		Limit(pageSize).
		Find(&messages)

	c.JSON(http.StatusOK, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"data":      messages,
	})
}

func (h *MessageHandler) SendMessage(c *gin.Context) {
	conversationID := c.Param("id")
	userID := c.GetString("userID")

	var member models.ConversationMember
	if h.DB.Where("conversation_id = ? AND user_id = ?", conversationID, userID).First(&member).Error != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "not a member of this conversation"})
		return
	}

	var req SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content is required"})
		return
	}

	if req.Type == "" {
		req.Type = "text"
	}

	msg := models.Message{
		ID:             generateID("msg"),
		ConversationID: conversationID,
		SenderID:       userID,
		Content:        req.Content,
		Type:           req.Type,
	}

	if err := h.DB.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "send message failed"})
		return
	}

	h.DB.Model(&models.Conversation{}).Where("id = ?", conversationID).
		Updates(map[string]interface{}{
			"last_message": req.Content,
			"updated_at":   msg.CreatedAt,
		})

	var otherMembers []models.ConversationMember
	h.DB.Where("conversation_id = ? AND user_id != ?", conversationID, userID).Find(&otherMembers)
	for _, m := range otherMembers {
		h.DB.Model(&models.ConversationMember{}).
			Where("conversation_id = ? AND user_id = ?", conversationID, m.UserID).
			UpdateColumn("unread_count", gorm.Expr("unread_count + 1"))
	}

	c.JSON(http.StatusCreated, msg)
}
