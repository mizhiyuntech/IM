package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"im-backend/models"
	"im-backend/ws"
)

type GroupHandler struct {
	DB  *gorm.DB
	Hub *ws.Hub
}

type CreateGroupRequest struct {
	Name      string   `json:"name" binding:"required"`
	MemberIDs []string `json:"member_ids"`
}

type GroupMemberWithUser struct {
	models.GroupMember
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
	Phone  string `json:"phone"`
}

func (h *GroupHandler) CreateGroup(c *gin.Context) {
	userID := c.GetString("userID")

	var req CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	if req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "群名称不能为空"})
		return
	}

	group := models.Group{
		ID:        generateID("grp"),
		Name:      req.Name,
		OwnerID:   userID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := h.DB.Create(&group).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建群组失败"})
		return
	}

	ownerMember := models.GroupMember{
		GroupID: group.ID,
		UserID:  userID,
		Role:    "owner",
	}
	h.DB.Create(&ownerMember)

	memberSet := make(map[string]bool)
	memberSet[userID] = true
	for _, mid := range req.MemberIDs {
		if mid == userID || memberSet[mid] {
			continue
		}
		var target models.User
		if h.DB.First(&target, "id = ?", mid).Error != nil {
			continue
		}
		member := models.GroupMember{
			GroupID: group.ID,
			UserID:  mid,
			Role:    "member",
		}
		h.DB.Create(&member)
		memberSet[mid] = true
	}

	conv := models.Conversation{
		ID:          generateID("conv"),
		Type:        "group",
		Name:        group.Name,
		Avatar:      group.Avatar,
		GroupID:     group.ID,
		LastMessage: "",
		UpdatedAt:   time.Now(),
	}
	h.DB.Create(&conv)

	var allMembers []models.GroupMember
	h.DB.Where("group_id = ?", group.ID).Find(&allMembers)

	for _, m := range allMembers {
		h.DB.Create(&models.ConversationMember{
			ConversationID: conv.ID,
			UserID:         m.UserID,
		})
	}

	if h.Hub != nil {
		for _, m := range allMembers {
			if m.UserID != userID {
				h.Hub.SendToUser(m.UserID, ws.WSMessage{
					Type: "new_conversation",
					Data: map[string]string{
						"conversation_id": conv.ID,
						"name":            group.Name,
					},
				})
			}
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"group":        group,
		"conversation": conv,
		"member_count": len(allMembers),
	})
}

func (h *GroupHandler) GetGroupMembers(c *gin.Context) {
	groupID := c.Param("id")

	var group models.Group
	if err := h.DB.First(&group, "id = ?", groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "群组不存在"})
		return
	}

	var members []models.GroupMember
	h.DB.Where("group_id = ?", groupID).Find(&members)

	userIDs := make([]string, len(members))
	for i, m := range members {
		userIDs[i] = m.UserID
	}

	var users []models.User
	if len(userIDs) > 0 {
		h.DB.Where("id IN ?", userIDs).Find(&users)
	}

	userMap := make(map[string]models.User)
	for _, u := range users {
		userMap[u.ID] = u
	}

	result := make([]GroupMemberWithUser, 0, len(members))
	for _, m := range members {
		u, ok := userMap[m.UserID]
		if !ok {
			continue
		}
		result = append(result, GroupMemberWithUser{
			GroupMember: m,
			Name:        u.Name,
			Avatar:      u.Avatar,
			Phone:       u.Phone,
		})
	}

	c.JSON(http.StatusOK, result)
}

type SetRoleRequest struct {
	Role string `json:"role" binding:"required"`
}

func (h *GroupHandler) SetMemberRole(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")
	targetUserID := c.Param("userId")

	var req SetRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	if req.Role != "admin" && req.Role != "member" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "角色只能是 admin 或 member"})
		return
	}

	var group models.Group
	if err := h.DB.First(&group, "id = ?", groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "群组不存在"})
		return
	}

	var callerMember models.GroupMember
	if err := h.DB.Where("group_id = ? AND user_id = ?", groupID, userID).First(&callerMember).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "你不是该群成员"})
		return
	}

	if callerMember.Role != "owner" {
		c.JSON(http.StatusForbidden, gin.H{"error": "只有群主才能设置成员角色"})
		return
	}

	if targetUserID == group.OwnerID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不能修改群主角色"})
		return
	}

	h.DB.Model(&models.GroupMember{}).
		Where("group_id = ? AND user_id = ?", groupID, targetUserID).
		Update("role", req.Role)

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func (h *GroupHandler) GetGroupInfo(c *gin.Context) {
	groupID := c.Param("id")

	var group models.Group
	if err := h.DB.First(&group, "id = ?", groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "群组不存在"})
		return
	}

	var memberCount int64
	h.DB.Model(&models.GroupMember{}).Where("group_id = ?", groupID).Count(&memberCount)

	c.JSON(http.StatusOK, gin.H{
		"id":           group.ID,
		"name":         group.Name,
		"avatar":       group.Avatar,
		"owner_id":     group.OwnerID,
		"member_count": memberCount,
		"created_at":   group.CreatedAt,
	})
}

type UpdateGroupRequest struct {
	Name string `json:"name"`
}

func (h *GroupHandler) UpdateGroup(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")

	var req UpdateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数无效"})
		return
	}

	if req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "群名称不能为空"})
		return
	}

	var group models.Group
	if err := h.DB.First(&group, "id = ?", groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "群组不存在"})
		return
	}

	var callerMember models.GroupMember
	if err := h.DB.Where("group_id = ? AND user_id = ?", groupID, userID).First(&callerMember).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "你不是该群成员"})
		return
	}

	if callerMember.Role != "owner" && callerMember.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "只有群主或管理员才能修改群名称"})
		return
	}

	h.DB.Model(&models.Group{}).Where("id = ?", groupID).Update("name", req.Name)

	var conv models.Conversation
	if err := h.DB.First(&conv, "group_id = ?", groupID).Error; err == nil {
		h.DB.Model(&models.Conversation{}).Where("id = ?", conv.ID).Update("name", req.Name)
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func (h *GroupHandler) DissolveGroup(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")

	var group models.Group
	if err := h.DB.First(&group, "id = ?", groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "群组不存在"})
		return
	}

	if group.OwnerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "只有群主才能解散群聊"})
		return
	}

	var conv models.Conversation
	if err := h.DB.First(&conv, "group_id = ?", groupID).Error; err == nil {
		h.DB.Where("conversation_id = ?", conv.ID).Delete(&models.ConversationMember{})
		h.DB.Delete(&conv)
	}

	var members []models.GroupMember
	h.DB.Where("group_id = ?", groupID).Find(&members)

	memberIDs := make([]string, len(members))
	for i, m := range members {
		memberIDs[i] = m.UserID
	}

	h.DB.Where("group_id = ?", groupID).Delete(&models.GroupMember{})
	h.DB.Delete(&group)

	if h.Hub != nil {
		for _, mid := range memberIDs {
			if mid != userID {
				h.Hub.SendToUser(mid, ws.WSMessage{
					Type: "group_dissolved",
					Data: map[string]string{
						"group_id": groupID,
						"name":     group.Name,
					},
				})
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func (h *GroupHandler) LeaveGroup(c *gin.Context) {
	userID := c.GetString("userID")
	groupID := c.Param("id")

	var group models.Group
	if err := h.DB.First(&group, "id = ?", groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "群组不存在"})
		return
	}

	if group.OwnerID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "群主不能退出群聊，请先转让群主或解散群聊"})
		return
	}

	var member models.GroupMember
	if err := h.DB.Where("group_id = ? AND user_id = ?", groupID, userID).First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "你不是该群成员"})
		return
	}

	h.DB.Delete(&member)

	var conv models.Conversation
	if err := h.DB.First(&conv, "group_id = ?", groupID).Error; err == nil {
		h.DB.Where("conversation_id = ? AND user_id = ?", conv.ID, userID).Delete(&models.ConversationMember{})
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}
