import { configureStore } from "@reduxjs/toolkit";
// import {
//   FLUSH,
//   PAUSE,
//   PERSIST,
//   persistReducer,
//   persistStore,
//   PURGE,
//   REGISTER,
//   REHYDRATE,
// } from "redux-persist";
// import storage from "redux-persist/lib/storage";
import { baseApi } from "./api/baseApi";
// import authReducer from "./features/auth/authSlice";

// const persistConfigTask = {
//   key: "task",
//   version: 1,
//   storage,
// };

// const persistedTaskReducer = persistReducer(persistConfigTask, authReducer);

export const store = configureStore({
  reducer: {
    // task: persistedTaskReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  // {
  // serializableCheck: {
  //   ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  // },
  // }
});

// export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
