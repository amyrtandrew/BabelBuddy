import { useState, useMemo, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import axios from "axios";
import Map from "../Components/Map";
import MapForm from "../Components/MapForm";

const libraries = ["places"];

function MapPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_REACT_APP_GOOGLE_API_KEY,
    libraries: libraries,
  });

  // state
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState(null);
  const [zipcode, setZipcode] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [radius, setRadius] = useState(16093.4);
  const [language, setLanguage] = useState("language");
  const [userZipcode, setUserZipcode] = useState(null);
  const [placeName, setPlaceName] = useState("");
  const [placeVicinity, setPlaceVicinity] = useState("");
  const [placeRating, setPlaceRating] = useState("");
  const [placeWebsite, setPlaceWebsite] = useState("");

  useEffect(() => {
    axios.get("/user").then((response) => {
      setUserZipcode(response.data.zipCode);
      console.log(userZipcode);
    });
  }, []);

  // console.log(radius);
  const changeRadius = (e) => {
    e.preventDefault();
    const selectedRadius = e.target.value;
    setRadius(selectedRadius);
    // console.log(radius);
  };

  const changeLanguage = (e) => {
    e.preventDefault();
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
  };

  const handleSaveTutor = async (e) => {
    // e.preventDefault();

    const formData = {
      name: placeName,
      vicinity: placeVicinity,
      rating: placeRating,
      website: placeWebsite,
    };
    console.log(formData);
    const res = await axios.post("/save-tutor", formData);
    if (res.data.success) {
      console.log("saved to tutors");
    }
  };

  useEffect(() => {
    // Get user's location when the component renders
    if (userZipcode) {
      setUserLocation(userZipcode);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(position.coords);
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting user's location:", error);
        }
      );
      //if geolocation is denied by user, set location to SLC when component renders
    } else {
      setUserLocation({ lat: 40.7608, lng: 111.891 });
    }
  }, []);

  useEffect(() => {
    // send lat/lng to server so it can send get request to find language schools within 25 miles
    if (userLocation) {
      // console.log(radius);
      const { lat, lng } = userLocation;
      axios
        .get(
          `http://localhost:2222/api/places?lat=${lat}&lng=${lng}&radius=${radius}&language=${language}`
        )
        .then(({ data }) => {
          //set all places equal to the results sent back by server and map through them to separate by individual location
          const allPlaces = data.results.map((place) => {
            let position = {
              lat: +place.geometry.location.lat,
              lng: +place.geometry.location.lng,
            };

            //return a marker for each individual location and have it open an infowindow when clicked
            let htmlString =
              '<a href="https://maps.google.com/maps/contrib/100961532820129391672">A Google User</a>';
            let doc = new DOMParser().parseFromString(htmlString, "text/html");
            let links = doc.querySelectorAll("a");
            const { name, rating, vicinity } = place;
            //if the place icon equals the "graduation cap" which signifies it is a school, return the marker for it
            return (
              place.icon ===
                "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/school-71.png" && (
                <div key={place.place_id}>
                  <MarkerF
                    position={position}
                    onClick={() => {
                      setOpen(true);
                      setSelectedMarkerId(place.place_id);
                      setPlaceName(name);
                      setPlaceVicinity(vicinity);
                      setPlaceRating(rating);
                      setPlaceWebsite(links[0].href);
                    }}
                  >
                    {open && selectedMarkerId === place.place_id && (
                      <InfoWindowF
                        position={position}
                        onCloseClick={() => setOpen(false)}
                      >
                        <>
                          <h1>{name}</h1>
                          <p>rating: {rating}</p>
                          <p> Address: {vicinity}</p>
                          <a href={links[0].href}>{links[0].href}</a>
                          <br></br>
                          <label>
                            Save To My Schools:
                            <input type="checkbox" onClick={handleSaveTutor} />
                          </label>
                        </>
                      </InfoWindowF>
                    )}
                  </MarkerF>
                </div>
              )
            );
          });

          setPlaces(allPlaces);
          // console.log(language);
        })
        .catch((err) => console.log(err));
    }
  }, [userLocation, open, selectedMarkerId, radius, language]);

  //stores zipcode entered
  const handleZipcodeChange = (event) => {
    setZipcode(event.target.value);
  };

  //changes geolocation based on what was entered as zipcode
  const handleZipcodeSubmit = () => {
    // Fetch latitude and longitude based on the entered zipcode
    console.log(import.meta.env.VITE_REACT_APP_GOOGLE_API_KEY);
    console.log(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${
        import.meta.env.VITE_REACT_APP_GOOGLE_API_KEY
      }`
    );
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${
          import.meta.env.VITE_REACT_APP_GOOGLE_API_KEY
        }`
      )
      .then(({ data }) => {
        // console.log(data);
        const { lat, lng } = data.results[0].geometry.location;
        setUserLocation({ lat, lng });
      })
      .catch((err) => console.log(err));
  };

  if (!isLoaded) return <div>Loading...</div>;
  return (
    <>
      <Map places={places} userLocation={userLocation} />
      <MapForm
        changeRadius={changeRadius}
        onZipcodeChange={handleZipcodeChange}
        onZipcodeSubmit={handleZipcodeSubmit}
        zipcode={zipcode}
        changeLanguage={changeLanguage}
      />
    </>
  );
}

export default MapPage;
