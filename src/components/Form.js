import { useState, useEffect, React } from "react";
import "./styling/Form.scss";
import pawprint from "./styling/pawprint.svg";
import coverphoto from "./styling/dog-cover-photo.png"

/**
 *
 * @param { Object } props: addPet function
 * @returns the Form view for new pet profiles.
 */
export default function Form(props) {
  const [photo, setPhoto] = useState([]);

  /**
   * @param { String } initial
   * @returns the current state based on the user's form input.
   */
  function useControlledInput(initial) {
    const [value, setValue] = useState(initial);

    return {
      value,
      onClick: (event) => setValue(event.target.value),
      onChange: (event) => setValue(event.target.value),
    };
  }

  const name = useControlledInput("");
  const breed = useControlledInput("");
  const age = useControlledInput("");
  const sex = useControlledInput("");
  const size = useControlledInput("");
  const spayed_or_neutered = useControlledInput("");
  const city = useControlledInput("");
  const description = useControlledInput("");

  /**
   *
   * @param { Function } e: A callback function that triggers upon form submission.
   * Stores the form values in an object.
   * The object is captured in the addPet function passed from App.js.
   */
  function onSubmit(e) {
    e.preventDefault();

    const value_toBoolean = spayed_or_neutered.value === "Yes" ? true : false;
    const age_toNumber = Number(age.value);
    const file_toURL = URL.createObjectURL(photo);

    const newPetProfile = {
      name: name.value,
      breed: breed.value,
      age: age_toNumber,
      sex: sex.value,
      size: size.value,
      spayed_or_neutered: value_toBoolean,
      city: city.value,
      description: description.value,
      photo_url: file_toURL
    };

    props.addPet(newPetProfile);
  }

  return (
      <div id="page-container">

        <header>
            <h1>
             Create <b>Paw</b>file
            </h1>
            <img src={coverphoto} />
            <div id="line-1">
          Sign up your best friend for more friends today!
          </div>
          <div id="line-2">
          Don't worry - You'll always be their favourite.
          </div>
          </header>

        <div id="form-container">

          <span id="title">Brag About Your Pet</span>
          <form className="new-profile" onSubmit={onSubmit} autoComplete="off">
            <div className="labels">
              <label htmlFor="name of pet" className="text-input">
                Name
                <br />
                <input
                  {...name}
                  id="name"
                  placeholder="enter your pet's name"
                  required
                />
              </label>

              <label htmlFor="breed of pet" className="text-input">
                Breed
                <br />
                <input
                  {...breed}
                  id="breed"
                  placeholder="enter your pet's breed"
                  required
                />
              </label>

              <label htmlFor="age of pet" className="text-input">
                Age
                <br />
                <input
                  {...age}
                  id="age"
                  placeholder="enter your pets age"
                  maxLength="2"
                  min="0"
                  type="number"
                  required
                />
              </label>
            </div>

            <label htmlFor="gender of pet" className="radios">
              <span className="radio-tags">Gender :</span>
              <input {...sex} value="Male" type="radio" name="sex" required />
              <span className="sex">M</span>
              <input {...sex} value="Female" type="radio" name="sex" />
              <span className="sex">F</span>
            </label>

            <label htmlFor="spayed or neutered" className="radios">
              <span className="radio-tags">Spayed / Neutered :</span>
              <input
                {...spayed_or_neutered}
                value="Yes"
                type="radio"
                name="spayed_or_neutered"
                required
              />
              <span className="spayed_or_neutered">Y</span>
              <input
                {...spayed_or_neutered}
                value="No"
                type="radio"
                name="spayed_or_neutered"
              />
              <span className="spayed_or_neutered">N</span>
            </label>

            <label htmlFor="size of pet" className="radios">
              <span className="radio-tags">Size :</span>
              <input
                {...size}
                value="Small"
                type="radio"
                name="size"
                required
              />
              <span className="size">S (up to 24 lbs)</span>
              <input {...size} value="Medium" type="radio" name="size" />
              <span className="size">M (25- 59 lbs)</span>
              <input {...size} value="Large" type="radio" name="size" />
              <span className="size">L (60 lbs+)</span>
            </label>
            <br />

            <label htmlFor="city" className="text-input">
              city
              <br />
              <input {...city} placeholder="City" required />
            </label>

            <label
              htmlFor="description of pet"
              className="text-input"
              id="description"
            >
              Description <br />
              <input
                {...description}
                placeholder="How would your pet describe themselves?"
                minLength="3"
                required
              />
            </label>
            <br />

            <label name="photo_url" htmlFor="upload pet photo">
              <input
                type="file"
                onChange={(event) => {
                  // console.log(event.target.files[0]);
                  setPhoto(event.target.files[0]);
                }}
                id="upload_img"
                name="photo_url"
                required
              />
            </label>
            <br/>

            <button type="submit">READY TO PLAY</button>
          </form>
        <footer>
            All's well that friends well
            <img src={pawprint} id="pawprint" alt="pawprint-icon" />
        </footer>
        </div>
      </div>
  );
}