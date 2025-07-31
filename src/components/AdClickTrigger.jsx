import { useEffect, useState } from "react";

export default function AdClickTrigger({ adUrl }) {
  const [adOpened, setAdOpened] = useState(false);

  useEffect(() => {
    const handleClick = () => {
      if (!adOpened) {
        window.open(adUrl, "_blank", "noopener,noreferrer");
        setAdOpened(true);
        // Remove the listener to avoid future triggers
        document.body.removeEventListener("click", handleClick);
      }
    };

    document.body.addEventListener("click", handleClick);

    return () => {
      document.body.removeEventListener("click", handleClick);
    };
  }, [adOpened, adUrl]);

  return null; // This component renders nothing, it's purely functional
}
