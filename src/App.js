import { useState, React, useEffect } from "react";
import { BrowserRouter, Routes, Route, redirect } from "react-router-dom";
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
import Footer from "components/Footer";


function App() {
  const [allpets, setAllpets] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [explorePets, setExplorePets] = useState([]);
  const [currentpet, setCurrentpet] = useState({});
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [checked, setChecked] = useState(false);
  const { user, loginWithRedirect, logout, isLoading, isAuthenticated } = useAuth0();

  async function getUserByEmail(email) {
    setChecked(true);
    return await axios
      .get(`http://localhost:8080/api/users`, {params: {'email': email}} )
      .catch(err => console.error(err));
  }

  useEffect(() => {
    const getData = (userId) => {
      axios.get("http://localhost:8080/api/pets")
      .then((response) => {
        const data = Object.entries(response.data).map(([key, value]) => ({ ...value }))
        setAllpets(shuffle(data));
      });
      axios.get(`http://localhost:8080/api/pets/${userId}`)
      .then((response) => {
        const data = Object.entries(response.data).map(([key, value]) => ({ ...value }))
        setUserPets(shuffle(data));
      });
      axios.get("http://localhost:8080/api/matches")
      .then((response) => {
        const data = Object.entries(response.data).map(([key, value]) => ({ ...value }))
        setMatches(data);
      });
      axios.get("http://localhost:8080/api/users")
      .then((response) => {
        const data = Object.entries(response.data).map(([key, value]) => ({ ...value }))
        setUsers(data);
      });
      axios.get(`http://localhost:8080/api/pets/explore/${userId}`)
      .then((response) => {
        console.log(response.data);
        const data = Object.entries(response.data).map(([key, value]) => ({ ...value }))
        setExplorePets(shuffle(data));
      });
    }
    if (user) {
       getUserByEmail(user.name).then(res => {
        const userId = (Object.keys(res.data)[0]);
        getData(userId);
       });
    }
  }, [user]);


  useEffect(() => {
    if (user && !checked) {

      async function addUser(user) {
        return await axios
          .post('http://localhost:8080/api/users', {'email': user.name})
          .then(response => {
            setUsers([...users, user]);
          });
      }

      getUserByEmail(user.name)
      .then(response => {
        if(Object.keys(response.data).length === 0) {
          addUser(user);
        }
      }).catch(err => console.log(err));

    }
  }, [checked, user, users])

//console.log('CURRENTPET', currentpet)

  /**
   *
   * @param { Object } pet: An object of objects containing values for new pet profiles
   * Values: name, breed, age, sex, size, spayed_or_neutered, city, description, photo_url
   */
   async function addPet(pet) {
      const { name, breed, age, sex, size, spayed_or_neutered, city, description, photo_url } = pet;

      return axios
        .post(`http://localhost:8080/api/pets`, {
          'name': name,
          'breed': breed,
          'age': age,
          'sex': sex,
          'spayed_or_neutered': spayed_or_neutered,
          'size': size,
          'city': city,
          'description': description,
          'photo_url': photo_url
        })
        .then((res) => {
          console.log("made it here")
          setUserPets([...userPets, pet]);
          return redirect("http://localhost:3000/pets/view");
        });
    }



  return (
    <div>
      <BrowserRouter>
        <NavBar user={user} isLoading={isLoading} loginWithRedirect={loginWithRedirect} logout={logout}></NavBar>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home user={user} isLoading={isLoading} logout={logout} loginWithRedirect={loginWithRedirect}/>} />
            <Route path="/pets/new" element={<Form addPet={addPet} />} />
            <Route path="/pets/view" element={<PetList pets={userPets} />} />
            <Route path="/pets/:id" element={<PetDetail onChange={setCurrentpet} />} />
            <Route path="/profile" element={<Profile user={user} logout={logout} isAuthenticated={isAuthenticated}/>} />
            <Route path="/explore" element={<Advanced pets={explorePets} />}/>
            <Route path="/matches" element={<MatchList matches={matches} />}/>
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/messages" element={<MessageList />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;
