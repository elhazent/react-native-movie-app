import { Stack } from "expo-router";
import "./global.css";
import { StatusBar } from "react-native";

export default function RootLayout() {
  
  return <>
  <StatusBar hidden={true}/>
  <Stack>
    <Stack.Screen
      name="(tabs)"
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="movies/[id]"
      options={{ headerShown: false, title: "Movie Details" }}
    />
    <Stack.Screen
      name="videos/[id]"
      options={{ headerShown: false, title: "Movie Videos" }}
    />
  </Stack>
  </>;
}
