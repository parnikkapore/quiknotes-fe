import { Button } from "@material-ui/core";
import { useAuth } from "../hooks/useAuth";

function PageLogin() {
  const { signInWithGoogle } = useAuth();

  return (
    <>
      <h1>Login</h1>
      <Button variant="contained" color="primary" onClick={signInWithGoogle}>
        Sign in with Google
      </Button>
    </>
  );
}

export default PageLogin;