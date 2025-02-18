import { Carousel } from "@material-tailwind/react";
import promo1 from "/promo1.png"
import promo2 from "/promo2.png"
import promo3 from "/promo3.png"
import promo4 from "/promo4.png"
import promo5 from "/promo5.png"
 
export function Gallery() {
  return (
    <Carousel
    loop={true}
    autoplay={true}
    className="rounded-xl"
    autoplayDelay={3000}
    transition={
      { type: "tween", duration: 0.3 }
    }
   >
      <img
        src={promo1}
        alt="image 1"
        className="h-full w-full object-cover object-center"
      />
      <img
        src={promo2}
        alt="image 2"
        className="h-full w-full object-cover object-center"
      />
      <img
        src={promo3}
        alt="image 3"
        className="h-full w-full object-cover object-center"
      />
      <img
        src={promo4}
        alt="image 4"
        className="h-full w-full object-cover object-center"
      />
      <img
        src={promo5}
        alt="image 5"
        className="h-full w-full object-cover object-center"
      />
    </Carousel>
  );
}