
const users=[]

// add user to the user list
exports.addUser=({name,userId,roomId,host,presenter,socketId})=>{
const user={name,userId,roomId,host,presenter,socketId};
users.push(user);
return users.filter((user)=>user.roomId===roomId);
}

// remove a user from user list
exports.removeUser=(id)=>{
    const index=users.findIndex((user)=>user.socketId===id);
    if(index!==-1){
        return users.splice(index,1)[0];

    }
}
// get a user from the user list
exports.getUser=(id)=>{
return users.find((user)=>user.socketId===id)
}

// get all user from the room
exports.getUserInRoom=(roomId)=>{
    return user.filter((user)=>user.roomId===roomId)
}