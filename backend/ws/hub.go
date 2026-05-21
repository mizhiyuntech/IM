package ws

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	mu      sync.RWMutex
	clients map[string]*Client
}

type Client struct {
	UserID string
	Hub    *Hub
	Conn   *websocket.Conn
	Send   chan []byte
}

type WSMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func NewHub() *Hub {
	return &Hub{
		clients: make(map[string]*Client),
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

func (h *Hub) SendToUser(userID string, msg WSMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}
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
