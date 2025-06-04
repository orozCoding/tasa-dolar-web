import { Carousel } from "@material-tailwind/react";
import indexImg from "/ss-index.png"
import pagoImg from "/ss-pagomovil.png"
import historyImg from "/ss-history.png"
import aboutImg from "/ss-about.png"
import notificationsImg from "/ss-notifications.png"
import { ArrowLeft, ArrowRight } from "../utils/arrowIcons"
 
export function Gallery() {

  const prevArrow = (loop, handlePrev, firstIndex) => {
    return(
      <button
        onClick={handlePrev}
        disabled={!loop && firstIndex}
        className="!absolute top-2/4 left-4 -translate-y-2/4 rounded-full select-none transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none w-12 max-w-[48px] h-12 max-h-[48px] text-black dark:text-white hover:dark:bg-white/10 hover:bg-black/10  active:bg-white/30 grid place-items-center cursor-pointer"
      >
        <ArrowLeft />
      </button>
    )
  }

  const nextArrow = (loop, handleNext, lastIndex) => {
    return(
      <button
        onClick={handleNext}
        disabled={!loop && lastIndex}
        className="!absolute top-2/4 right-4 -translate-y-2/4 rounded-full select-none transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none w-12 max-w-[48px] h-12 max-h-[48px] text-black dark:text-white hover:dark:bg-white/10 hover:bg-black/10  active:bg-white/30 grid place-items-center cursor-pointer"
        >
        <ArrowRight />
      </button>
    )
  }

  const imgClass = "h-full m-auto object-contain rounded-xl object-center cursor-pointer"

  const images =[
    [indexImg, "Home", "/ss-index.png"],
    [pagoImg, "Pagomovil", "/ss-pagomovil.png"],
    [historyImg, "Historial", "/ss-history.png"],
    [aboutImg, "Acerca", "/ss-about.png"],
    [notificationsImg, "Notificaciones", "/ss-notifications.png"],
  ]

  return (
    <Carousel
      loop={true}
      autoplay={true}
      className="overflow-hidden rounded-xl flex items-center text-red-400 py-8"
      autoplayDelay={3000}
      transition={
        { type: "tween", duration: 0.3 }
      }
      prevArrow={({ loop, handlePrev, firstIndex }) => prevArrow(loop, handlePrev, firstIndex)}
      nextArrow={({ loop, handleNext, lastIndex }) => nextArrow(loop, handleNext, lastIndex)}
   >
      {images.map(([image, title, src]) => {
        return (
          <img
            src={image}
            alt={title}
            className={imgClass}
            onClick={() => window.open(src, "_blank")}
          />
        );
      })}
    </Carousel>
  );
}