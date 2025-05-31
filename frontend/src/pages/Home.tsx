import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function Home() {

  return (
    <>
      <div className="flex gap-6 min-h-svh w-full items-center justify-center">
        <Button asChild>
          <Link to="/register">Register</Link>
        </Button>
        <Button asChild>
          <Link to="/login">Login</Link>
        </Button>
      </div>
    </>
  );
}

export default Home;
