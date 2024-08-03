package models

import (
	"fmt"
)

func TestCreateUser() {


	user := UserModel{
		UserEmail:      "test@example.com",
		UserFirstName:  "John",
		UserLastName:   "Doe",
		UserDOB:        "24/10/2004",
		UserAvatarPath: "/path/to/avatar",
		UserNickname:   "testuser",
		UserBio:        "This is a test user",
		ProfileExposure: "Private",
	}

	err := CreateUser(&user)

	if(err != nil){
		fmt.Println(err)
	}
	fmt.Println(("completed"));
}

func TestUserDelete(){
	DeleteUser("test@example.com")
}



