import firebase from "firebase"

const getIdToken = async () => {
  const idToken = await firebase.auth().currentUser?.getIdToken()
  return idToken ?? null
}

export default getIdToken
