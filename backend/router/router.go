package router

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"im-backend/config"
	"im-backend/handlers"
	"im-backend/middleware"
	"im-backend/ws"
)

func Setup(r *gin.Engine, db *gorm.DB, cfg *config.Config, hub *ws.Hub) {
	authHandler := &handlers.AuthHandler{DB: db, Cfg: cfg}
	userHandler := &handlers.UserHandler{DB: db, Hub: hub}
	conversationHandler := &handlers.ConversationHandler{DB: db, Hub: hub}
	messageHandler := &handlers.MessageHandler{DB: db, Hub: hub}
	wsHandler := &handlers.WSHandler{Hub: hub, Cfg: cfg}
	groupHandler := &handlers.GroupHandler{DB: db, Hub: hub}

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

		api.GET("/ws", wsHandler.HandleWS)

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
				conversations.POST("", conversationHandler.CreateOrGetConversation)
				conversations.PUT("/:id/read", conversationHandler.MarkAsRead)
				conversations.DELETE("/:id", conversationHandler.DeleteConversation)
			}

			messages := authed.Group("/conversations")
			{
				messages.GET("/:id/messages", messageHandler.GetMessages)
				messages.POST("/:id/messages", messageHandler.SendMessage)
			}

			groups := authed.Group("/groups")
			{
				groups.POST("", groupHandler.CreateGroup)
				groups.GET("/:id", groupHandler.GetGroupInfo)
				groups.GET("/:id/members", groupHandler.GetGroupMembers)
				groups.PUT("/:id/members/:userId/role", groupHandler.SetMemberRole)
			}
		}
	}
}
