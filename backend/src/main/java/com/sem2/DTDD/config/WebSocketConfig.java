package com.sem2.DTDD.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Đăng ký điểm kết nối cổng WebSocket (Endpoint) cho Frontend kết nối vào
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*") // Cho phép Frontend (đang chạy ở cổng khác, ví dụ :4200) kết nối tới
                .withSockJS(); // Hỗ trợ cơ chế SockJS dự phòng nếu trình duyệt cũ không hỗ trợ WebSocket thuần
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 1. Định cấu hình Message Broker để quản lý các luồng tin nhắn dội về Client
        // Người dùng sẽ "Đăng ký" (Subscribe) vào các đường dẫn bắt đầu bằng các tiền tố này để nghe tin nhắn
        registry.enableSimpleBroker("/topic", "/queue");

        // 2. Định cấu hình tiền tố cho các API xử lý tin nhắn do Client gửi lên (Publish)
        // Khi client muốn gửi tin nhắn lên Server, đường dẫn phải bắt đầu bằng /app
        // Ví dụ: /app/chat.sendMessage
        registry.setApplicationDestinationPrefixes("/app");

        // 3. Định cấu hình tiền tố cho tin nhắn gửi đích danh cho 1 người cụ thể (User-specific)
        registry.setUserDestinationPrefix("/user");
    }
}
