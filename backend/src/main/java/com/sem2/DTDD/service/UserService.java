package com.sem2.DTDD.service;

import com.sem2.DTDD.model.User;

import java.util.List;

public interface UserService {
    /**
     * Thực hiện đăng nhập nhanh vào hệ thống bằng Biệt danh (Username).
     * @param username Biệt danh do người dùng tự nhập từ màn hình chào
     * @return Đối tượng User tương ứng sau khi xử lý lưu trữ hoặc đồng bộ
     */
    User loginQuick(String username);

    /**
     * Lấy danh sách toàn bộ người dùng trong hệ thống để hiển thị lên danh bạ.
     * @return Danh sách mảng chứa tất cả User trong cơ sở dữ liệu
     */
    List<User> getAllUsers();

    /**
     * Đổi trạng thái sang Offline khi người dùng hủy kết nối hoặc thoát ứng dụng.
     * @param userId ID định danh của người dùng
     */
    void logoutQuick(String userId);
}
