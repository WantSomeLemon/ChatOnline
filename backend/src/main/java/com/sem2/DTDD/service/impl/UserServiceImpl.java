package com.sem2.DTDD.service.impl;

import com.sem2.DTDD.model.User;
import com.sem2.DTDD.repository.UserRepository;
import com.sem2.DTDD.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate; //cùng với cài đặt trong file application.yml

    private static final String REDIS_ONLINE_KEY = "users:online";
    
    @Override
    public User loginQuick(String username) {
        // Tìm xem user này đã từng vào hệ thống chưa, nếu chưa thì tự động tạo mới tài khoản khách
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername(username);
                    newUser.setFullName(username);
                    newUser.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=" + username); // Tạo avatar tự động từ web
                    return newUser;
                });

        user.setOnline(true);
        User savedUser = userRepository.save(user);

        // Đẩy ID người dùng vào Set bộ nhớ đệm Redis để quản lý session online siêu tốc
        redisTemplate.opsForSet().add(REDIS_ONLINE_KEY, savedUser.getId());

        return savedUser;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void logoutQuick(String userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setOnline(false);
            userRepository.save(user);

            // Xóa ID khỏi tập hợp Online trên Redis khi logout
            redisTemplate.opsForSet().remove(REDIS_ONLINE_KEY, userId);
        });
    }
}
