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
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) GetAllUsers(c *gin.Context) {
	var users []models.User
	h.DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) SearchUser(c *gin.Context) {
	keyword := c.Query("keyword")
	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "搜索关键词不能为空"})
		return
	}

	var users []models.User
	h.DB.Where("phone = ? OR name LIKE ?", keyword, "%"+keyword+"%").
		Limit(20).
		Find(&users)

	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) AddContact(c *gin.Context) {
	userID := c.GetString("userID")

	var req struct {
		ContactID string `json:"contact_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "contact_id 不能为空"})
		return
	}

	if req.ContactID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不能添加自己为好友"})
		return
	}

	var target models.User
	if h.DB.First(&target, "id = ?", req.ContactID).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	var existing models.Contact
	if h.DB.Where("user_id = ? AND contact_id = ?", userID, req.ContactID).First(&existing).Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "已经是好友了"})
		return
	}

	contact := models.Contact{
		UserID:    userID,
		ContactID: req.ContactID,
	}
	if err := h.DB.Create(&contact).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "添加好友失败"})
		return
	}

	reverseContact := models.Contact{
		UserID:    req.ContactID,
		ContactID: userID,
	}
	h.DB.Where("user_id = ? AND contact_id = ?", req.ContactID, userID).FirstOrCreate(&reverseContact)

	c.JSON(http.StatusCreated, gin.H{"message": "ok"})
}

func (h *UserHandler) DeleteContact(c *gin.Context) {
	userID := c.GetString("userID")
	contactID := c.Param("id")

	h.DB.Where("user_id = ? AND contact_id = ?", userID, contactID).Delete(&models.Contact{})
	h.DB.Where("user_id = ? AND contact_id = ?", contactID, userID).Delete(&models.Contact{})

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}
