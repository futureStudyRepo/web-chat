const nicknameInput = document.getElementById("nickname");
const connectButton = document.getElementById("connect-button");
const disconnectButton = document.getElementById("disconnect-button");
const sendButton = document.getElementById("send-button");
const messageInput = document.getElementById("message-input");
const messageList = document.getElementById("message-list");
const userList = document.getElementById("user-list");
const connectionStatus = document.getElementById("connection-status");

let socket = null;

function setStatus(online) {
  // 상단 연결 상태를 한 곳에서만 갱신합니다.
  connectionStatus.textContent = online ? "온라인" : "오프라인";
  connectionStatus.className = `status-chip ${online ? "online" : "offline"}`;
}

function appendMessage(type, meta, message) {
  // 메시지 카드 1개를 만들어 목록 아래에 추가합니다.
  const card = document.createElement("article");
  card.className = `message-card ${type}`;

  const metaLine = document.createElement("div");
  metaLine.className = "message-meta";
  metaLine.textContent = meta;

  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = message;

  card.append(metaLine, body);
  messageList.appendChild(card);
  messageList.scrollTop = messageList.scrollHeight;
}

function appendSystemMessage(meta, message) {
  // 시스템 메시지는 자주 쓰이므로 별도 함수로 묶습니다.
  appendMessage("system", meta, message);
}

function renderUsers(users) {
  // 현재 접속자 목록을 다시 그립니다.
  userList.innerHTML = "";

  if (!users.length) {
    const item = document.createElement("li");
    item.textContent = "현재 접속 중인 사용자가 없습니다.";
    userList.appendChild(item);
    return;
  }

  users.forEach((user) => {
    const item = document.createElement("li");
    item.textContent = user;
    userList.appendChild(item);
  });
}

function connectChat() {
  // 닉네임을 확인한 뒤 웹소켓 연결을 시작합니다.
  const nickname = nicknameInput.value.trim();
  if (!nickname) {
    appendSystemMessage("안내", "닉네임을 먼저 입력해 주세요.");
    return;
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    appendSystemMessage("안내", "이미 채팅에 연결되어 있습니다.");
    return;
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(
    `${protocol}://${window.location.host}/ws?nickname=${encodeURIComponent(nickname)}`
  );

  socket.addEventListener("open", () => {
    setStatus(true);
    appendSystemMessage("연결", `${nickname} 닉네임으로 채팅에 접속했습니다.`);
  });

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    renderUsers(payload.users || []);

    if (payload.type === "system") {
      appendSystemMessage("시스템", payload.message);
      return;
    }

    appendMessage("chat", payload.nickname, payload.message);
  });

  socket.addEventListener("close", () => {
    setStatus(false);
    appendSystemMessage("연결 종료", "웹소켓 연결이 종료되었습니다.");
  });
}

function disconnectChat() {
  // 연결이 살아 있으면 종료합니다.
  if (socket) {
    socket.close();
    socket = null;
  }
}

function sendMessage() {
  // 입력한 메시지를 서버로 전송합니다.
  const message = messageInput.value.trim();
  if (!message) {
    return;
  }

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    appendSystemMessage("안내", "먼저 채팅에 연결해 주세요.");
    return;
  }

  socket.send(message);
  messageInput.value = "";
  messageInput.focus();
}

connectButton.addEventListener("click", connectChat);
disconnectButton.addEventListener("click", disconnectChat);
sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

renderUsers([]);
setStatus(false);
