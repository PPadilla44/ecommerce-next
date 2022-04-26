/*global google*/
import React, { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useStyles from "../utils/styles";
import { Store } from "../utils/Store";
import axios from "axios";
import { useSnackbar } from "notistack";
import { LocationType } from "../types";
import { CircularProgress } from "@material-ui/core";
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import dynamic from "next/dynamic";
import { getError } from "../utils/error";

const defaultLocation: LocationType = { lat: 45.516, lng: -73.56 };




const libs = ["places"];

const Map: React.FC = () => {

  const router = useRouter();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [center, setCenter] = useState<LocationType>(defaultLocation);
  const [location, setLocation] = useState<LocationType>(center);


  const mapRef = useRef<google.maps.Map>();
  const placeRef = useRef<google.maps.places.SearchBox>();
  const markerRef = useRef<google.maps.Marker>();


  useEffect(() => {
    const fetchGoogleApiKey = async () => {
      try {
        const { data } = await axios.get(`/api/keys/google`, {
          headers: {
            authorization: `Bearer ${userInfo?.token}`,
          },
        });
        setGoogleApiKey(data);
        getUserCurrentLocation();
      } catch (err) {
        enqueueSnackbar(getError(err), { variant: "error" })
      }
    };
    fetchGoogleApiKey();

  }, []);

  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      enqueueSnackbar("Geolocation is not supported by this browser", {
        variant: "error",
      });
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  const onIdle = () => {
    if (!mapRef.current) {
      return;
    }
    setLocation({
      lat: mapRef.current.getCenter()?.lat() as number,
      lng: mapRef.current.getCenter()?.lng() as number,
    });
  };

  const onPlacesChange = () => {
    const places = placeRef.current?.getPlaces();
    if (places && places.length === 1) {
      const place = places[0].geometry?.location;
      setCenter({ lat: place!.lat(), lng: place!.lng() });
      setLocation({ lat: place!.lat(), lng: place!.lng() });
    }
  };

  const onConfirm = () => {
    const places = placeRef.current?.getPlaces();
    if (places && places.length === 1) {
      dispatch!({
        type: "SAVE_SHIPPING_ADDRESS_MAP_LOCATION",
        payload: {
          lat: location.lat,
          lng: location.lng,
          address: places[0].formatted_address,
          name: places[0].name,
          vicinity: places[0].vicinity,
          googleAddressId: places[0].place_id,
        },
      });
      enqueueSnackbar("location selected successfully", { variant: "success" });
    }
  };

  return googleApiKey ? (
    <div className={classes.fullContainer}>
      <LoadScript libraries={libs as any} googleMapsApiKey={googleApiKey}>
        <GoogleMap
          id="sample-map"
          mapContainerStyle={{ height: "100%", width: "100%" }}
          center={center}
          zoom={15}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onIdle={onIdle}
        >
          <StandaloneSearchBox
            onLoad={(place) => {
              placeRef.current = place;
            }}
            onPlacesChanged={onPlacesChange}
          >
            <div className={classes.mapInputBox}>
              <input type="text" placeholder="Enter your address" />
              <button type="button" className="primary" onClick={onConfirm}>
                Confirm
              </button>
            </div>
          </StandaloneSearchBox>
          <Marker position={location} onLoad={(marker) =>{
            markerRef.current = marker;
          }}></Marker>
        </GoogleMap>
      </LoadScript>
    </div>
  ) : (
    <CircularProgress />
  );
};

export default dynamic(() => Promise.resolve(Map), { ssr: false });
