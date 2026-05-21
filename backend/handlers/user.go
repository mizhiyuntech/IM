package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"im-backend/models"
)

type UserHandler struct {
	DB *gorm.DB
}

func (h *UserHandler) GetContacts(c *gin.Context) {
	userID := c.GetString("userID")

	var contacts []models.Contact
	h.DB.Where("user_id = ?", userID).Find(&contacts)

	contactIDs := make([]string, len(contacts))
	for i, ct := range contacts {
		contactIDs[i] = ct.ContactID
	}

	var users []models.User
	if len(contactIDs) > 0 {
		h.DB.Where("id IN ?", contactIDs).Find(&users)
	}

	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) GetUserByID(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) GetAllUsers(c *gin.Context) {
	var users []models.User
	h.DB.Find(&users)
	c.JSON(http.StatusOK, users)
}
