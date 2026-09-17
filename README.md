# Web Chat

FastAPI와 WebSocket으로 만든 아주 간단한 실시간 채팅 예제입니다.

## 기능

- 닉네임 입력 후 채팅방 접속
- 실시간 메시지 브로드캐스트
- 접속자 목록 표시
- 입장/퇴장 시스템 메시지

## 폴더 구조

```text
web-chat-demo/
  app/
    main.py
    chat_manager.py
    templates/
      index.html
    static/
      app.css
      app.js
  requirements.txt
```

## 실행 방법

```bash
cd C:\dev\workspace_gpt\project-lab\web-chat-demo
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

브라우저에서 아래 주소로 접속합니다.

```text
http://127.0.0.1:8000
```

다른 기기에서 접속하려면 서버 PC의 실제 IP를 사용하면 됩니다.

```text
http://서버PC아이피:8000
```

## 사용 방법

1. 브라우저 창을 2개 이상 엽니다.
2. 각 창에서 닉네임을 입력하고 `채팅 시작`을 누릅니다.
3. 메시지를 보내면 모든 창에 실시간으로 전달됩니다.

## 학습 포인트

- FastAPI 기본 라우팅
- WebSocket 연결
- 브로드캐스트 구조
- 프런트엔드와 서버 간 실시간 통신
