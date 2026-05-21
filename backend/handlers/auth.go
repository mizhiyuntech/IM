package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"im-backend/config"
	"im-backend/models"
)

type AuthHandler struct {
	DB  *gorm.DB
	Cfg *config.Config
}

type LoginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	var user models.User
	if err := h.DB.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "phone or password incorrect"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "phone or password incorrect"})
		return
	}

	token, err := h.generateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "generate token failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
	})
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.Phone == "" || req.Password == "" || req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "phone, password and name are required"})
		return
	}

	var existing models.User
	if h.DB.Where("phone = ?", req.Phone).First(&existing).Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "phone already registered"})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "hash password failed"})
		return
	}

	user := models.User{
		ID:       generateID("user"),
		Name:     req.Name,
		Phone:    req.Phone,
		Password: string(hashed),
	}

	if err := h.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "create user failed"})
		return
	}

	token, err := h.generateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "generate token failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user":  user,
	})
}

func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userID := c.GetString("userID")

	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) generateToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(72 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.Cfg.JWTSecret))
}

func generateID(prefix string) string {
	return prefix + "_" + time.Now().Format("20060102150405") + randomSuffix()
}

func randomSuffix() string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, 4)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
