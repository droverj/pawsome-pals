import { useState, React, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

import Form from "components/Form";
import NavBar from "components/NavBar";
import Profile from "components/Profile";
import Home from "components/Home";
import PetList from "components/PetList";
import PetDetail from "components/PetDetail";
import Advanced from "components/MatchListTest";
import shuffle from "components/helpers/shuffleArray";
import MatchList from "components/MatchList";
import MatchDetail from "components/MatchDetail";
import MessageList from "components/MessageList";
import MessageDetail from "components/MessageDetail";
import Footer from "components/Footer";

function App() {
  const [allpets, setAllpets] = useState([]);
  const [pets, setPets] = useState([]);
  const [currentpet, setCurrentpet] = useState(() => {
    // getting stored value
    const saved = localStorage.getItem("currentpet");
    const initialValue = JSON.parse(saved);
    return initialValue || {};
  });
  const [matches, setMatches] = useState([]);
  const [pending, setPending] = useState([]);
  const [matchee, setMatchee] = useState([]);
  const [users, setUsers] = useState([]);
  const [checked, setChecked] = useState(false);
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showFooter, setShowFooter] = useState(true);
  const { user, loginWithRedirect, logout, isLoading, isAuthenticated } =
    useAuth0();

  const handlePetChange = (pet) => {
    localStorage.setItem("currentpet", JSON.stringify(pet));
    setCurrentpet(JSON.parse(localStorage.getItem("currentpet")));
  };

  function Logout() {
    localStorage.clear();
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  function deletePet(id) {
    return axios
    .delete(`http://localhost:8080/api/pets/${id}`)
    .then(res =>
      window.location.reload())
  }

  async function getUserByEmail(email) {
    return await axios
      .get(`http://localhost:8080/api/users`, { params: { email: email } })
      .catch(err => console.error(err));

  }

  async function getUserByPet(id) {
    return await axios
      .get(`http://localhost:8080/api/matches/owner/${id}`)
      .catch(err => console.error(err));

  }

  useEffect(() => {
    const getData = (userId) => {
      axios.get("http://localhost:8080/api/pets").then((response) => {
        const data = Object.entries(response.data).map(([key, value]) => ({
          ...value,
        }));
        setAllpets(shuffle(data));
      });
      axios.get(`http://localhost:8080/api/pets/${userId}`).then((response) => {
        const data = Object.entries(response.data).map(([key, value]) => ({
          ...value,
        }));
        setPets(shuffle(data));
      });
      axios.get("http://localhost:8080/api/users").then((response) => {
        const data = Object.entries(response.data).map(([key, value]) => ({
          ...value,
        }));
        setUsers(data);
      });
    };
    if (user && checked) {
      getUserByEmail(user.name).then((res) => {
        const userId = Object.keys(res.data)[0];
        getData(userId);
      });
    }
  }, [user, checked]);

  useEffect(() => {
    if ((JSON.parse(localStorage.getItem("currentpet")) !== null) && (JSON.parse(localStorage.getItem("currentpet")) !== undefined)) {
      const currentId = JSON.parse(localStorage.getItem("currentpet")).id;
      console.log(currentId);
      axios
        .get(`http://localhost:8080/api/matches/${currentId}`)
        .then((response) => {
          const data = Object.entries(response.data).map(([key, value]) => ({
            ...value,
          }));
          setMatches(data);
        });
      axios
        .get(`http://localhost:8080/api/matches/pending/${currentId}`)
        .then((response) => {
          const data = Object.entries(response.data).map(([key, value]) => ({
            ...value,
          }));
          setPending(data);
        });
      axios
        .get(`http://localhost:8080/api/matches/matchee/${currentId}`)
        .then((response) => {
          const data = Object.entries(response.data).map(([key, value]) => ({
            ...value,
          }));
          setMatchee(data);
        });
      axios
        .get(`http://localhost:8080/api/messages/${currentId}`)
        .then((response) => {
          const data = Object.entries(response.data).map(([key, value]) => ({
            ...value,
          }));
          setMessages(data);
        });
    }
  }, [currentpet]);


  useEffect(() => {
    if (user && !checked) {
      async function addUser(user) {
        return await axios
          .post('http://localhost:8080/api/users', { email: user.name })
          .then(response => {
            setUsers([...users, user]);
          });
      }

      getUserByEmail(user.name)
        .then((response) => {
          if (response && Object.keys(response.data).length === 0) {
            addUser(user);
          }
          setChecked(true);
        })
        .catch((err) => console.log(err));
    }
  }, [checked, user, users]);

  // Store the current user's ID
  useEffect(() => {
    if (user) {
      getUserByEmail(user.name).then((res) => {
        const userId = Object.keys(res.data)[0];
        setUserId(userId);
      });
    }
  }, [user]);

  // Create a new pet profile
  async function addPet(pet) {
    const currentId = userId;
    // console.log(currentId)
    const newPet = {
      user_id: currentId,
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      sex: pet.sex,
      size: pet.size,
      spayed_or_neutered: pet.spayed_or_neutered,
      city: pet.city,
      description: pet.description,
      photo_url: pet.photo_url
    }

    return axios
      .post(`http://localhost:8080/api/pets`, newPet)
      .then((res) => {
        console.log("made it here");
        console.log(res.data);
        setPets([...pets, pet]);
        return window.location = "/pets/view";
      });
  }

  //console.log('MESSAGGES', messages);

  async function newMsg(msg) {
    const newMsg = {
      from_petId: msg.from_petId,
      to_petId: msg.to_petId,
      message: msg.message,
      timestamp: msg.timestamp
    }

    return axios
      .post(`http://localhost:8080/api/messages`, newMsg)
      .then(res => {
        console.log('NEW MESSAGE', res.data)
        setMessages([...messages, newMsg])
      })
  }

  async function newChat(chat) {
    const msg = {
      from_petId: chat.currentPet.id,
      to_petId: chat.pet.id,
      message: `Hey ${chat.pet.name}! My name is ${chat.currentPet.name}. This is a new chat.`,
      timestamp: (new Date().toLocaleString("en-US"))
    }
    newMsg(msg).then(() => {window.location = "/messages"});
  }

  async function unmatch(petId, otherId) {
    return axios
      .delete(`http://localhost:8080/api/matches`, {
        data: {
          'pet_id': petId,
          'other_id': otherId
        }
      })
      .then((res) => {
        const update = matches.filter(p => p.id !== otherId);
        setMatches(update);
        return window.location = "/matches";
      })
      .catch(err => {
        console.log(err);
      });
  }

  function addMatch(match) {
    console.log(match);
    if (match.currentPet && match.target) {
      const relationship = {
        current_pet: match.currentPet.id,
        other_pet: match.target.id
      }
      return axios.post("http://localhost:8080/api/relationships", relationship)
        .then((res) => {
          if (match.dir === 'right') {
            const newMatch = {
              pet_one: match.currentPet.id,
              pet_two: match.target.id,
            }

            return axios.put("http://localhost:8080/api/matches", newMatch)
              .then(res => res.data);
          }
        }).catch(err => console.log(err));
    }
    return new Promise((resolve) => {
      resolve(null);
    })
  }

  function filterDuplicatemsgs(messages) {
    const uniqueMessages = {};
    const uniqueArr = messages.filter(message => {
      const pair1 = `${message.from_petid}-${message.to_petid}`;
      const pair2 = `${message.to_petid}-${message.from_petid}`;
      if (!uniqueMessages[pair1] && !uniqueMessages[pair2]) {
        uniqueMessages[pair1] = true;
        return true;
      }
      return false;
    });
    return uniqueArr
  }

  const uniqueMessages = filterDuplicatemsgs(messages);
  //console.log(uniqueMessages)

  return (
    <div>
      <BrowserRouter>
        <NavBar
          user={user}
          isLoading={isLoading}
          loginWithRedirect={loginWithRedirect}
          logout={Logout}
        ></NavBar>
        <div className="content">
          <Routes>

            <Route
              path="/"
              element={
                <Home
                  user={user}
                  isLoading={isLoading}
                  logout={Logout}
                  loginWithRedirect={loginWithRedirect}
                />
              }
            />
            <Route path="/pets/new" element={<Form addPet={addPet} />} />
            <Route
              path="/pets/view"
              element={<PetList pets={pets} current={currentpet} deletePet={deletePet} />}
            />
            <Route
              path="/pets/:id"
              element={<PetDetail handlePetChange={handlePetChange} />}
            />
            <Route
              path="/profile"
              element={
                <Profile
                  user={user}
                  logout={Logout}
                  isAuthenticated={isAuthenticated}
                />
              }
            />

            <Route
              path="/messages"
              element={
              <MessageList
                currentId={currentpet.id}
                messages={uniqueMessages}
                userPets={pets}
                currentPet={currentpet}
                setCurrentPet={handlePetChange}
                newChat={newChat}
                pending={pending}
                matches={matches}
                matchee={matchee}
              />}
            />
            <Route path="/messages/:id" element={<MessageDetail newMsg={newMsg} setShowFooter={setShowFooter} />} />
            <Route
              path="/matches/:id"
              element={
                <MatchDetail
                  unmatch={unmatch}
                  currentPet={currentpet}
                  currentId={currentpet.id}
                  getUserByPet={getUserByPet}
                  addMatch={addMatch}
                  newChat={newChat}
                  newMsg={newMsg}
                />
              }
            />
            <Route
              path="/matches"
              element={
                <MatchList
                  matches={matches}
                  getUserByPet={getUserByPet}
                  pending={pending}
                  matchee={matchee}
                  setCurrentPet={handlePetChange}
                  currentPet={currentpet} userPets={pets}
                  unMatch={unmatch}
                  addMatch={addMatch}
                  newMsg={newMsg}
                />}
            />
            {userId}
            <Route path="/explore" element={
              <Advanced
                userPets={pets}
                addMatch={addMatch}
                currentPet={currentpet}
                setCurrentPet={handlePetChange}
                userId={userId}
                newMsg={newMsg}
              />} />
            <Route path="/messages" element={<MessageList />} />
          </Routes>
        </div>
      </BrowserRouter>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
