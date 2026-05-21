package router

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"im-backend/config"
	"im-backend/handlers"
	"im-backend/middleware"
)

func Setup(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	authHandler := &handlers.AuthHandler{DB: db, Cfg: cfg}
	userHandler := &handlers.UserHandler{DB: db}
	conversationHandler := &handlers.ConversationHandler{DB: db}
	messageHandler := &handlers.MessageHandler{DB: db}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/register", authHandler.Register)
		}

		authed := api.Group("")
		authed.Use(middleware.AuthMiddleware(cfg))
		{
			authed.GET("/user/me", authHandler.GetCurrentUser)

			users := authed.Group("/users")
			{
				users.GET("", userHandler.GetAllUsers)
				users.GET("/search", userHandler.SearchUser)
				users.GET("/contacts", userHandler.GetContacts)
				users.POST("/contacts", userHandler.AddContact)
				users.DELETE("/contacts/:id", userHandler.DeleteContact)
				users.GET("/:id", userHandler.GetUserByID)
			}

			conversations := authed.Group("/conversations")
			{
				conversations.GET("", conversationHandler.GetConversations)
				conversations.PUT("/:id/read", conversationHandler.MarkAsRead)
				conversations.DELETE("/:id", conversationHandler.DeleteConversation)
			}

			messages := authed.Group("/conversations")
			{
				messages.GET("/:id/messages", messageHandler.GetMessages)
				messages.POST("/:id/messages", messageHandler.SendMessage)
			}
		}
	}
}
