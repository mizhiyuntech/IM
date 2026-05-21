const WS_URL = 'wss://app.mizhiyun.cloud/api/ws';

type WSMessageHandler = (data: any) => void;

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let messageHandler: WSMessageHandler | null = null;
let currentToken: string | null = null;

export function setWSHandler(handler: WSMessageHandler) {
  messageHandler = handler;
}

export function connectWS(token: string) {
  currentToken = token;
  doConnect();
}

function doConnect() {
  if (!currentToken) return;

  if (ws) {
    ws.close();
    ws = null;
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  ws = new WebSocket(`${WS_URL}?token=${currentToken}`);

  ws.onopen = () => {
    // connected
  };

  ws.onmessage = (event: WebSocketMessageEvent) => {
    try {
      const msg = JSON.parse(event.data);
      if (messageHandler) {
        messageHandler(msg);
      }
    } catch {
      // ignore parse error
    }
  };

  ws.onclose = () => {
    ws = null;
    reconnectTimer = setTimeout(() => {
      if (currentToken) {
        doConnect();
      }
    }, 5000);
  };

  ws.onerror = () => {
    // will trigger onclose
  };
}

export function disconnectWS() {
  currentToken = null;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
}
