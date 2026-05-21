package main

import (
	"context"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"im-backend/config"
	"im-backend/models"
	"im-backend/router"
	"im-backend/ws"
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

	var rdb *redis.Client
	rdb = redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr(),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("[Redis] connection failed: %v, falling back to local mode", err)
		rdb = nil
	} else {
		log.Printf("[Redis] connected to %s", cfg.RedisAddr())
	}

	hub := ws.NewHub(rdb)

	if rdb != nil {
		go hub.Subscribe(ctx)
	}

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

	router.Setup(r, db, cfg, hub)

	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("IM backend server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
