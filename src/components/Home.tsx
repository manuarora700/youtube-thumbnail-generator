import React from "react";
import { Hero } from "./hero";

function Home(): React.JSX.Element {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Hero />
    </div>
  );
}

export default Home;
