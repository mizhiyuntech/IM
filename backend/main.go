package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"im-backend/config"
	"im-backend/models"
	"im-backend/router"
)

func main() {
	cfg := config.Load()

	db, err := gorm.Open(mysql.Open(cfg.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	db.AutoMigrate(
		&models.User{},
		&models.Group{},
		&models.GroupMember{},
		&models.Conversation{},
		&models.ConversationMember{},
		&models.Message{},
		&models.Contact{},
	)

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	router.Setup(r, db, cfg)

	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("IM backend server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
