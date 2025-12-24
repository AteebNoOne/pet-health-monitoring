import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api/backend";

export const PetsContext = createContext();

export const PetsProvider = ({ children }) => {
  const [pets, setPets] = useState([]);
  const [refreshPets, setRefreshPets] = useState(false);

  const fetchPets = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      const res = await fetch(`${BASE_URL}/api/pets?user_id=${userId}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setPets(data);
      await AsyncStorage.setItem("petsCache", JSON.stringify(data));
    } catch (err) {
      console.error("Fetch failed, using cache:", err);
      const cachedData = await AsyncStorage.getItem("petsCache");
      if (cachedData) setPets(JSON.parse(cachedData));
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    if (refreshPets) {
      fetchPets();
      setRefreshPets(false);
    }
  }, [refreshPets]);

  return (
    <PetsContext.Provider value={{ pets, setRefreshPets }}>
      {children}
    </PetsContext.Provider>
  );
};
