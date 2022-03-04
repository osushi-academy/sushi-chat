import firebase from "firebase/app"
import "firebase/auth"

const getIdToken = async () => {
  const idToken = await firebase.auth().currentUser?.getIdToken()
  return idToken ?? null
}

export default getIdToken
