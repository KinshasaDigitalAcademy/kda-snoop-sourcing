import { signIn, useSession } from "next-auth/react";
import Loading from "../Loading";

const withAuthentication = (Component) =>
  function WithAuth(props) {
    const { status, data: session } = useSession({
      
      required: true,
      onUnauthenticated() {
        // The user is not authenticated, handle it here.
        return signIn();
      },
    });
    //console.log(session.user);
    

    if (status === "loading") {
      return <Loading />;
    }

    return <Component {...props} />;
  };

export default withAuthentication;
