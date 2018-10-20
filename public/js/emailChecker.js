/**
 * Created by chenyang on 12/7/16.
 */

function validateEmail() {
    console.log("email value checking");
    var email = $("#userEmail").val();
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if(!re.test(email)){
        alert("Please enter a valid email address.");
        return false;
    }
    else{
        return true;
    }
}