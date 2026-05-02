import { showMessage } from "react-native-flash-message";
import { colors } from "../modules/colors";

// useStates nécessaires :
// const [notifTitle, setNotifTitle] = useState(null);
// const [notifBody, setNotifBody] = useState(null);
// const [tempTokenList, setTempTokenList] = useState([]);
// const [isLoading, setIsLoading] = useState(false);

export default async function sendNotification() {
  setIsLoading(true);
  if (notifTitle && notifBody && tempTokenList.length > 0) {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/notifications/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenList: tempTokenList,
            title: notifTitle,
            body: notifBody,
            url: "/",
          }),
        },
      );

      const data = await response.json();

      // Confirmer l'envoi de la notif
      showMessage({
        message: data.message,
        type: "success",
        backgroundColor: colors.primary,
        color: colors.white,
        style: {
          borderRadius: 10,
          marginBottom: 15,
        },
      });
    } catch (err) {
      console.error(err);
      showMessage({
        message: data.message || "Problème de connexion BDD",
        type: "error",
        style: {
          borderRadius: 10,
          marginBottom: 15,
        },
      });
    } finally {
      setNotifBody(null);
      setNotifTitle(null);
      setTempTokenList([]);
      setIsLoading(false);
    }
  }
}
