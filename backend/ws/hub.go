package ws

import (
	"context"
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

const channelName = "im:messages"

type Hub struct {
	mu      sync.RWMutex
	clients map[string]*Client
	rdb     *redis.Client
}

type Client struct {
	UserID string
	Hub    *Hub
	Conn   *websocket.Conn
	Send   chan []byte
}

type WSMessage struct {
	Type       string      `json:"type"`
	TargetUser string      `json:"target_user,omitempty"`
	Data       interface{} `json:"data"`
}

func NewHub(rdb *redis.Client) *Hub {
	return &Hub{
		clients: make(map[string]*Client),
		rdb:     rdb,
	}
}

func (h *Hub) Register(client *Client) {
	h.mu.Lock()
	if existing, ok := h.clients[client.UserID]; ok {
		close(existing.Send)
		existing.Conn.Close()
	}
	h.clients[client.UserID] = client
	h.mu.Unlock()
	log.Printf("[WS] user %s connected, online: %d", client.UserID, h.OnlineCount())
}

func (h *Hub) Unregister(client *Client) {
	h.mu.Lock()
	if existing, ok := h.clients[client.UserID]; ok && existing == client {
		delete(h.clients, client.UserID)
		close(client.Send)
	}
	h.mu.Unlock()
	log.Printf("[WS] user %s disconnected, online: %d", client.UserID, h.OnlineCount())
}

func (h *Hub) deliverLocal(userID string, data []byte) {
	h.mu.RLock()
	client, ok := h.clients[userID]
	h.mu.RUnlock()
	if ok {
		select {
		case client.Send <- data:
		default:
			go h.Unregister(client)
		}
	}
}

func (h *Hub) SendToUser(userID string, msg WSMessage) {
	if h.rdb != nil {
		msg.TargetUser = userID
		data, err := json.Marshal(msg)
		if err != nil {
			return
		}
		h.rdb.Publish(context.Background(), channelName, data)
	} else {
		data, err := json.Marshal(msg)
		if err != nil {
			return
		}
		h.deliverLocal(userID, data)
	}
}

func (h *Hub) BroadcastToUsers(userIDs []string, msg WSMessage) {
	for _, uid := range userIDs {
		h.SendToUser(uid, msg)
	}
}

func (h *Hub) OnlineCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

func (h *Hub) Subscribe(ctx context.Context) {
	if h.rdb == nil {
		return
	}

	sub := h.rdb.Subscribe(ctx, channelName)
	ch := sub.Channel()

	log.Printf("[Redis] subscribed to channel %s", channelName)

	for msg := range ch {
		var wsMsg WSMessage
		if err := json.Unmarshal([]byte(msg.Payload), &wsMsg); err != nil {
			continue
		}

		if wsMsg.TargetUser == "" {
			continue
		}

		h.deliverLocal(wsMsg.TargetUser, []byte(msg.Payload))
	}

	log.Printf("[Redis] unsubscribed from channel %s", channelName)
}

func (c *Client) WritePump() {
	defer c.Conn.Close()
	for msg := range c.Send {
		if err := c.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			return
		}
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister(c)
		c.Conn.Close()
	}()
	c.Conn.SetReadLimit(512)
	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			return
		}
	}
}
