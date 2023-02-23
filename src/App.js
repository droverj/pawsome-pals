import { useState, React } from "react";

import './App.css';
import Form from 'components/Form';
import NavBar from 'components/NavBar';


function App() {
  const [pets, setPets] = useState([]);

  /**
   *
   * @param { Object } pet: An object of objects containing values for new pet profiles
   * Values: name, fixed, breed, sex, age, location, description, size, housetrained
   */
  function addPet(pet) {
    setPets([...pets, pet]);
  }

  // An array containing an object of objects => pets[0]
  console.log(pets[0]);

  return (
    <div className="App">
    <NavBar/>
    <Form addPet={addPet}/>
    </div>

  );
}

export default App;
