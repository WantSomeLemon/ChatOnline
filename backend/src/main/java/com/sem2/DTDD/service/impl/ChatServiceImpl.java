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
}
