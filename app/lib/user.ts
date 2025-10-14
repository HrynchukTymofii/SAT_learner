import { UserType } from "@/context/AuthContext";
import { getUserData, upgradeToSync } from "./api/user";
import { useUserDatabase } from "./db/fetchDb";


interface LoadUserOptions {
  token: string;
  setUser: (user: UserType) => void;
  forceSync?: boolean;
}


export function useLoadUserInBackground() {
  const { fetchAndStoreUserData } = useUserDatabase();

  async function loadUserInBackground(
    { token, forceSync = false, setUser }: LoadUserOptions)
  {
    try {
      const res = await getUserData(token);

      if (res.success) {
        const mappedUser: UserType = {
          ...res.user,
          categories: res.user.league,
        };
        setUser(mappedUser);

        if (forceSync || res.user.needSync) {
          await fetchAndStoreUserData(token);
          await upgradeToSync(token);
        }
      } else {
        console.error("Failed to load user:", res.error);
      }
    } catch (err) {
      console.error("Error loading user:", err);
    }
  }

  return { loadUserInBackground };
}


// export const loadUserInBackground = async ({token, forceSync = false, setUser}: LoadUserOptions ) => {
//     // const { fetchAndStoreUserData } = useUserDatabase();
//     try {
//       const res = await getUserData(token);

//       if (res.success) {
//         const mappedUser: UserType = {
//           ...res.user,
//           categories: res.user.league,
//         };
//         setUser(mappedUser);

//         //console.log(res.user.needSync)

//         if (forceSync || res.user.needSync) {
//           await fetchAndStoreUserData(token);

//           await upgradeToSync(token);
//           //console.log('user loaded')
//         } //else{
//         //     console.log('no need for user to be loaded')
//         // }
        
//       } else {
//         console.error("Failed to load user:", res.error);
//       }
//     } catch (err) {
//       console.error("Error loading user:", err);
//     }
//   };