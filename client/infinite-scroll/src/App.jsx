import { useCallback, useEffect, useRef, useState } from "react";
import "./styles.css";
import { parseLinkHeader } from "./parseLinkHeader";

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const nextPhotoUrlRef = useRef();

  const LIMIT = 10;

  async function fetchPhotos(url, { overwrite = false } = {}) {
    setIsLoading(true);
    try {
      const res = await fetch(url);
      nextPhotoUrlRef.current = parseLinkHeader(res.headers.get("Link")).next;
      const photos = await res.json();
      if (overwrite) {
        setPhotos(photos);
      } else {
        setPhotos((previousPhotos) => {
          return [...previousPhotos, ...photos];
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const imageRef = useCallback((image) => {
    if (image == null) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        console.log("last is shown");
        fetchPhotos(nextPhotoUrlRef.current);
        observer.unobserve(image);
      }
    });

    observer.observe(image);
  }, []);

  useEffect(() => {
    fetchPhotos(`http://localhost:3000/photos?_page=1&_limit=${LIMIT}`, {
      overwrite: true,
    });
  }, []);

  return (
    <div className="grid">
      {photos?.map((photo, index) => (
        <img
          src={photo.url}
          key={photo.id}
          ref={index === photos.length - 1 ? imageRef : undefined}
        />
      ))}
      {isLoading &&
        Array.from({ length: LIMIT }, (_, index) => index).map((n) => {
          return (
            <div key={n} className="skeleton">
              Loading...
            </div>
          );
        })}
    </div>
  );
}
