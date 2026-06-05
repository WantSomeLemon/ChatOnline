package com.sem2.DTDD.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users") //khai báo bảng users trong MongoDB
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;

    private String password; //chưa bt nên mã hoá hay ko
    private String fullName;
    private String avatarUrl;
    private boolean isOnline;
    
}
