import { configureStore, createSlice } from "@reduxjs/toolkit";

const savedPlacesSlice = createSlice({
  name: "savedPlaces",
  initialState: [],
  reducers: {
    savePlace: (state, action) => {
      const exists = state.some((place) => place.id === action.payload.id);
      if (!exists) {
        state.push(action.payload);
      } else {
        return state.map((place) =>
          place.id === action.payload.id ? action.payload : place
        );
      }
    },
    unsavePlace: (state, action) => {
      return state.filter((place) => place.id !== action.payload.id);
    },
  },
});

export const { savePlace, unsavePlace } = savedPlacesSlice.actions;

const store = configureStore({
  reducer: {
    savedPlaces: savedPlacesSlice.reducer,
  },
});

export default store;

// import { configureStore } from "@reduxjs/toolkit";
// import { createSlice } from "@reduxjs/toolkit";

// const savedPlacesSlice = createSlice({
//   name: "savedPlaces",
//   initialState: [],
//   reducers: {
//     savePlace: (state, action) => {
//       const exists = state.some((place) => place.id === action.payload.id);
//       if (!exists) {
//         state.push(action.payload);
//       }
//     },
//     unsavePlace: (state, action) => {
//       return state.filter((place) => place.id !== action.payload.id);
//     },
//   },
// });

// export const { savePlace, unsavePlace } = savedPlacesSlice.actions;

// const store = configureStore({
//   reducer: {
//     savedPlaces: savedPlacesSlice.reducer,
//   },
// });

// export default store;
