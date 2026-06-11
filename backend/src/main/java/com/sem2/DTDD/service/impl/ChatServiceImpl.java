package com.sem2.DTDD.service.impl;

import com.sem2.DTDD.model.ChatRoom;
import com.sem2.DTDD.model.Message;
import com.sem2.DTDD.repository.ChatRoomRepository;
import com.sem2.DTDD.repository.MessageRepository;
import com.sem2.DTDD.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;

    @Override
    public ChatRoom createRoom(ChatRoom room) {
        return chatRoomRepository.save(room);
    }

    @Override
    public List<Message> getMessageHistory(String roomId) {
        return messageRepository.findByRoomIdOrderByTimestampAsc(roomId);
    }

    @Override
    public ChatRoom findRoomById(String roomId) {
        // Sử dụng phương thức findById của Spring Data MongoDB
        return chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chat với ID: " + roomId));
    }
}
