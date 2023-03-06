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



function App() {
  const [allpets, setAllpets] = useState([]);
  const [pets, setPets] = useState([]);
  const [currentpet, setCurrentpet] = useState({});
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [checked, setChecked] = useState(false);
  const { user, loginWithRedirect, logout, isLoading, isAuthenticated } = useAuth0();

  useEffect(() => {
    const getData =  () => {
      axios.get("http://localhost:8080/api/pets")
      .then((response) => {
        const data = Object.entries(response.data).map(([key, value]) => ({ ...value }))
        setAllpets(shuffle(data));
      });
      axios.get(`http://localhost:8080/api/pets/${user.name}`)
      .then((response) => {
        const data = Object.entries(response.data).map(([key, value]) => ({ ...value }))
        setPets(shuffle(data));
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
    }
    if(user) {
      getData();
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

console.log('CURRENTPET', currentpet)


  /**
   *
   * @param { Object } pet: An object of objects containing values for new pet profiles
   * Values: name, fixed, breed, sex, age, location, description, size, housetrained
   */
  function addPet(pet) {
    const id = pets.length + 1;
    const newPet = {};


    const petDetails = {
      id,
      user_id: 100,
      ...pet,
    };

    newPet[id] = petDetails;
    console.log(newPet);
    return axios
      .put(`http://localhost:8080/api/pets/${id - 1}`, { newPet })
      .then(() => {
        console.log("Made it here!");
        setPets([...pets, newPet]);
      });
  }

  // An array containing an object of objects => pets[0]
  //console.log(pets[0]);
  async function getUserByEmail(email) {
    setChecked(true);
    return await axios
      .get(`http://localhost:8080/api/users`, {params: {'email': email}} )
      .catch(err => console.error(err));
  }


  return (
    <div>
      <BrowserRouter>
        <NavBar user={user} isLoading={isLoading} loginWithRedirect={loginWithRedirect} logout={logout}></NavBar>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home user={user} isLoading={isLoading} logout={logout} loginWithRedirect={loginWithRedirect}/>} />
            <Route path="/pets/new" element={<Form addPet={addPet} />} />
            <Route path="/pets/view" element={<PetList pets={pets} />} />
            <Route path="/pets/:id" element={<PetDetail onChange={setCurrentpet} />} />
            <Route path="/profile" element={<Profile user={user} logout={logout} isAuthenticated={isAuthenticated}/>} />
            <Route path="/explore" element={<Advanced pets={allpets} />}/>
            <Route path="/matches" element={<MatchList matches={matches} />}/>
            <Route path="/matches/:id" element={<MatchDetail />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
