const users = [];

//addUser, removeUser, getUser, getUsers

const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!username || !room) {
    return {
      error: "Morate odabrati ime i sobu!",
    };
  }
  //Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  //Validate username
  if (existingUser) {
    return {
      error: "Korisnik sa tim imenom već postoji. Odaberite drugo ime!",
    };
  }

  //Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const name = users.find((user) => user.id === id);
  if (!name) {
    return {
      error: "Korisnik ne postoji",
    };
  }
  return name;
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  const userRoom = users.filter((user) => user.room === room);
  if (!userRoom) {
    return {
      error: "Korisnika nema u sobi!",
    };
  }
  return userRoom;
};
module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
